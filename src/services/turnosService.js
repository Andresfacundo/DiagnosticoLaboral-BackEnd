const Turno = require("../models/Turnos");
const Trabajador = require('../models/TrabajadorTurnos');
const { agruparTurnosPorSemana, horaStringADecimal } = require("../utils/dateUtils");
const CalculoHorasService = require("./calculoHorasService");
const { Op } = require("sequelize");
const CalcularHorasTrabajadas = require("../utils/CalcularHorasTrabajadas");
const CalculoHoras = new CalcularHorasTrabajadas();
const ResumenNomina = require("../models/ResumenNomina");
class TurnoService {

  async getAll(usuarioId, filtros = {}) {
    const { nombre, apellido, area, cc, diaInicio, diaFin } = filtros;

    const whereTrabajador = { usuarioId };    
    const whereTurno = {};

    if (nombre) {
      whereTrabajador.nombre = { [Op.like]: `%${nombre}%` };
    }
    if (apellido) {
      whereTrabajador.apellido = { [Op.like]: `%${apellido}%` };
    }
    if (area) {
      whereTrabajador.area = { [Op.like]: `%${area}%` };
    }
    if (cc) {
      whereTrabajador.cc = { [Op.like]: `%${cc}%` };
    }
    if (diaInicio) {
      whereTurno.diaInicio = { [Op.gte]: diaInicio };
    }
    if (diaFin) {
      whereTurno.diaFin = { [Op.lte]: diaFin };
    }


    return await Turno.findAll({
      where: whereTurno,
      include: {
        model: Trabajador,
        where: whereTrabajador
      }
    });
  }

  async getById(id, usuarioId) {
    const turno = await Turno.findOne({
      where: { id },
      include: {
        model: Trabajador,
        where: { usuarioId },
      }
    });
    if (!turno) throw new Error("Turno no encontrado");
    return turno;
  }

  async add(trabajadorId, data, usuarioId) {
    const trabajador = await Trabajador.findOne({
      where: { id: trabajadorId, usuarioId }
    });

    if (!trabajador) throw new Error("El trabajador no existe");

    // Obtener turnos existentes del trabajador
    const turnosExistentes = await Turno.findAll({
      where: { trabajadorId },
      raw: true
    });

    const buildTurno = (turno, fecha) => ({

      trabajadorId,
      diaInicio: fecha,
      diaFin: fecha,
      horaInicio: turno.horaInicio,
      horaFin: turno.horaFin,
      minutosDescanso: turno.minutosDescanso,
      inicioDescanso: turno.inicioDescanso,
      tiempoTrabajado: CalculoHoras.calcular(turno.horaInicio, turno.horaFin, turno.minutosDescanso)

    });


    if (data.diasRepeticion && Array.isArray(data.diasRepeticion) && data.diasRepeticion.length > 0) {
      const baseDate = new Date(data.diaInicio);

      const diasSemana = {
        domingo: 6,
        lunes: 0,
        martes: 1,
        miercoles: 2,
        jueves: 3,
        viernes: 4,
        sabado: 5
      };

      const nuevosTurnos = data.diasRepeticion.map(dia => {
        const targetDay = diasSemana[dia.toLowerCase()];
        if (targetDay === undefined) throw new Error(`Día inválido: ${dia}`);

        // Clonar la fecha base
        const nuevaFecha = new Date(baseDate);

        // Calcular diferencia de días hasta el target
        const diff = targetDay - nuevaFecha.getDay();
        nuevaFecha.setDate(nuevaFecha.getDate() + (diff >= 0 ? diff : diff + 7));

        return buildTurno(data, nuevaFecha.toISOString().split("T")[0]);
      });

      this.validarHorasSemanales(turnosExistentes, nuevosTurnos, trabajador);

      return await Promise.all(nuevosTurnos.map(turno => Turno.create(turno)));
    }

    const nuevoTurno = buildTurno(data, data.diaInicio);
    this.validarHorasSemanales(turnosExistentes, [nuevoTurno], trabajador);
    return await Turno.create(nuevoTurno);
  }

  validarHorasSemanales(turnosExistentes, nuevosTurnos, trabajador) {
    const todosTurnos = [...turnosExistentes, ...nuevosTurnos];
    const semanas = agruparTurnosPorSemana(todosTurnos);

    for (const claveSemana in semanas) {
      let horasSemanales = 0;
      const turnosSemana = semanas[claveSemana];

      for (const turno of turnosSemana) {
        const { tiempoTrabajado } = CalculoHorasService.clasificarMinutosTurno(
          {
            horaInicio: turno.horaInicio,
            horaFin: turno.horaFin,
            minutosDescanso: turno.minutosDescanso,
            inicioDescanso: turno.inicioDescanso,
            diaInicio: turno.diaInicio
          },
          0
        );

        if (tiempoTrabajado < 4) {
          throw new Error(`El turno del ${turno.diaInicio} es menor a 4 horas (duración ${tiempoTrabajado.toFixed(1)}h)`);
        }


        if (tiempoTrabajado > 11) {
          throw new Error(`El turno del ${turno.diaInicio} es mayor a 11 horas (duración ${tiempoTrabajado.toFixed(1)}h)`);
        }

        horasSemanales += tiempoTrabajado;


      }

      if (horasSemanales > 56) {
        throw new Error(
          `No se pueden crear los turnos. El trabajador ${trabajador.nombre} ${trabajador.apellido} excedería las 56 horas semanales (${horasSemanales.toFixed(2)} horas).`
        );
      }
    }
  }



  async update(turnoId, data, usuarioId) {
    const turno = await Turno.findOne({
      where: { id: turnoId },
      include: { model: Trabajador, where: { usuarioId } }
    });
    if (!turno) throw new Error("El turno no existe");

    let trabajador = turno.Trabajador;
    if (data.trabajadorId) {
      trabajador = await Trabajador.findOne({
        where: { id: data.trabajadorId, usuarioId }
      });
      if (!trabajador) throw new Error("El trabajador no existe");
    }


    const trabajadorIdFinal = data.trabajadorId || turno.trabajadorId;
    const turnosExistentes = await Turno.findAll({
      where: {
        trabajadorId: trabajadorIdFinal,
        id: { [require('sequelize').Op.ne]: turnoId }
      },
      raw: true
    });


    const turnoActualizado = {
      trabajadorId: trabajadorIdFinal,
      diaInicio: data.diaInicio || turno.diaInicio,
      diaFin: data.diaFin || turno.diaFin,
      horaInicio: data.horaInicio || turno.horaInicio,
      horaFin: data.horaFin || turno.horaFin,
      minutosDescanso: data.minutosDescanso !== undefined ? data.minutosDescanso : turno.minutosDescanso,
      inicioDescanso: data.inicioDescanso || turno.inicioDescanso,
    };

    this.validarHorasSemanales(turnosExistentes, [turnoActualizado], trabajador);
    
    data.tiempoTrabajado = CalculoHoras.calcular(
      data.horaInicio || turno.horaInicio,
      data.horaFin || turno.horaFin,
      data.minutosDescanso !== undefined ? data.minutosDescanso : turno.minutosDescanso
    );

    await turno.update(data);

    return turno;
  }

  async delete(id, usuarioId) {
    const turno = await Turno.findOne({
      where: { id },
      include: { model: Trabajador, where: { usuarioId } }
    });

    if (!turno) throw Error('Turno no encontrado');

    await ResumenNomina.destroy({ where: { trabajadorId: turno.trabajadorId } }); 

    await turno.destroy();
    return true;
  }
}

module.exports = TurnoService;
 