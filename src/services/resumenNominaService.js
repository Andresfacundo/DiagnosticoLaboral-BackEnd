const ResumenNomina = require("../models/ResumenNomina");
const DetalleTurnoNomina = require("../models/DetalleTurnoNomina");
const Trabajador = require("../models/TrabajadorTurnos");
const Turno = require("../models/Turnos");
const CalculoHorasService = require("./calculoHorasService");
const { Op } = require("sequelize");

class ResumenNominaService {
  async generarYGuardarResumen(usuarioId) {
    const trabajadores = await Trabajador.findAll({ where: { usuarioId }, raw: true });
    const turnos = await Turno.findAll({
      where: { trabajadorId: trabajadores.map((t) => t.id) },
      raw: true,
    });

    const { resumenEmpleados } = CalculoHorasService.calcularResumenEmpleados(trabajadores, turnos);

    for (const emp of resumenEmpleados) {
      const tieneDatos = [
        emp.totalHoras,
        emp.horasExtraOrdinaria,
        emp.horasExtraNocturna,
        emp.horasExtraOrdinariaDominical,
        emp.horasExtraNocturnaDominical,
        emp.horasRecargoNocturno,
        emp.horasRecargoDominical,
        emp.horasRecargoNocturnoDominical,
        emp.netoAPagar,
        emp.costoTotal,
      ].some((v) => v && v > 0);

      if (!tieneDatos) {
        console.log(`Trabajador ${emp.id} sin datos de nómina, no se guarda.`);
        continue;
      }

      const payload = {
        trabajadorId: emp.id,
        salarioBase: emp.salarioBase,
        salarioHora: emp.salarioHora,
        totalHoras: emp.totalHoras,
        horasExtraOrdinaria: emp.horasExtraOrdinaria,
        valorExtraOrdinaria: emp.valorExtraOrdinaria,
        horasExtraNocturna: emp.horasExtraNocturna,
        valorExtraNocturna: emp.valorExtraNocturna,
        horasExtraOrdinariaDominical: emp.horasExtraOrdinariaDominical,
        valorExtraOrdinariaDominical: emp.valorExtraOrdinariaDominical,
        horasExtraNocturnaDominical: emp.horasExtraNocturnaDominical,
        valorExtraNocturnaDominical: emp.valorExtraNocturnaDominical,
        horasRecargoNocturno: emp.horasRecargoNocturno,
        valorRecargoNocturno: emp.valorRecargoNocturno,
        horasRecargoDominical: emp.horasRecargoDominical,
        valorRecargoDominical: emp.valorRecargoDominical,
        horasRecargoNocturnoDominical: emp.horasRecargoNocturnoDominical,
        valorRecargoNocturnoDominical: emp.valorRecargoNocturnoDominical,
        netoAPagar: emp.netoAPagar,
        costoTotal: emp.costoTotal,
      };

      // Buscar o crear resumen
      let resumen = await ResumenNomina.findOne({ where: { trabajadorId: emp.id } });
      if (resumen) {
        await resumen.update(payload);
      } else {
        resumen = await ResumenNomina.create(payload);
      }

      if (emp.detalleTurnos?.length >= 0) {
        const turnosDelTrabajador = turnos
          .filter((t) => t.trabajadorId === emp.id)
          .map((t) => t.id);

        await DetalleTurnoNomina.destroy({
          where: {
            resumenNominaId: resumen.id,
            trabajadorId: emp.id,
            turnoId: { [Op.in]: turnosDelTrabajador },
          },
        });

        for (const d of emp.detalleTurnos) {
          if (d.horas > 0) {
            await DetalleTurnoNomina.create({
              resumenNominaId: resumen.id,
              trabajadorId: emp.id,
              turnoId: d.turnoId,
              categoria: d.categoria,
              fecha: d.fecha,
              horaInicio: d.horaInicio,
              horaFin: d.horaFin,
              horas: d.horas,
              valor: d.valor,
            });
          }
        }
      }

    }
  }

  async listarResumenes(usuarioId, filtros = {}) {
    const whereTrabajador = { usuarioId };
    const whereTurno = {};

    if (filtros.nombre) whereTrabajador.nombre = { [Op.like]: `%${filtros.nombre}%` };
    if (filtros.apellido) whereTrabajador.apellido = { [Op.like]: `%${filtros.apellido}%` };
    if (filtros.area) whereTrabajador.area = { [Op.like]: `%${filtros.area}%` };
    if (filtros.cc) whereTrabajador.cc = { [Op.like]: `%${filtros.cc}%` };    


    if (filtros.diaInicio) whereTurno.diaInicio = { [Op.gte]: filtros.diaInicio };
    if (filtros.diaFin) whereTurno.diaFin = { [Op.lte]: filtros.diaFin };

    const includeTurno = {
      model: DetalleTurnoNomina,
      required: !!(filtros.diaInicio || filtros.diaFin), // join
      include: [
        {
          model: Turno,
          where: whereTurno,
          required: !!(filtros.diaInicio || filtros.diaFin)
        }
      ]
    };

    return await ResumenNomina.findAll({
      include: [
        {
          model: Trabajador,
          where: whereTrabajador
        },
        includeTurno
      ],
      distinct: true // evita duplicar resúmenes si tienen varios turnos en el rango
    });
  }

}

module.exports = new ResumenNominaService();