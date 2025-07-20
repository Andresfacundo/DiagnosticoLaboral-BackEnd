const empleadosService = require("./empleadosService");
const turnosService = require("./turnosService");
const colombianHolidays = require('colombian-holidays');

const HORAS_MENSUALES_ESTANDAR = 220;
const HORA_NOCTURNA_INICIO = 21;
const HORA_NOCTURNA_FIN = 6;
const HORAS_SEMANALES_MAXIMAS = 44;
const RECARGO_FESTIVO = 0.80;

function esFestivo(fecha) {
  return colombianHolidays.isHoliday(fecha);
}

function calcularHorasNocturnas(horaInicio, horaFin, minutosDescanso = 0) {
  let inicio = horaInicio * 60;
  let fin = horaFin * 60;
  if (fin <= inicio) fin += 24 * 60;
  const duracionTotal = fin - inicio;
  let nocturnas = 0, diurnas = 0;

  for (let minuto = 0; minuto < duracionTotal; minuto++) {
    const horaReal = ((inicio + minuto) / 60) % 24;
    if (horaReal >= HORA_NOCTURNA_INICIO || horaReal < HORA_NOCTURNA_FIN) nocturnas++;
    else diurnas++;
  }

  nocturnas = nocturnas / 60;
  diurnas = diurnas / 60;
  const tiempoTrabajado = (nocturnas + diurnas) - (minutosDescanso / 60);

  return {
    horasNocturnas: Number(nocturnas.toFixed(2)),
    horasDiurnas: Number(diurnas.toFixed(2)),
    tiempoTrabajado: Number(tiempoTrabajado.toFixed(2)),
  };
}

function agruparTurnosPorSemana(turnos) {
  const semanas = {};
  turnos.forEach(turno => {
    const fecha = new Date(`${turno.diaInicio}T00:00:00`);
    const inicioSemana = new Date(fecha);
    const dia = fecha.getDay();
    const offset = dia === 0 ? -6 : 1 - dia;
    inicioSemana.setDate(fecha.getDate() + offset);
    const claveSemana = inicioSemana.toISOString().split('T')[0];
    if (!semanas[claveSemana]) semanas[claveSemana] = [];
    semanas[claveSemana].push(turno);
  });
  return semanas;
}

function calcularHorasSemanales(turnosSemana) {
  return turnosSemana.reduce((total, turno) => {
    const [hiH, hiM] = turno.horaInicio.split(":").map(Number);
    const [hfH, hfM] = turno.horaFin.split(":").map(Number);
    const horaInicio = hiH + hiM / 60;
    const horaFin = hfH + hfM / 60;
    let duracionHoras = horaFin - horaInicio;
    if (duracionHoras < 0) duracionHoras = (24 - horaInicio) + horaFin;
    const horasTurno = duracionHoras - (Number(turno.minutosDescanso) || 0) / 60;
    return total + horasTurno;
  }, 0);
}

function calcularResumenEmpleados(empleados, turnos) {
  const resumenEmpleados = empleados.map((empleado) => {
    const turnosEmpleado = turnos.filter((t) => String(t.empleadoId) === String(empleado.id));
    const salarioBase = Number(empleado.salarioBase) || 0;
    const salarioHora = salarioBase / HORAS_MENSUALES_ESTANDAR;
    const esTrabajadorDireccion = empleado.clasificacionPersonal === 'Direccion, confianza o manejo';
    const semanasTurnos = agruparTurnosPorSemana(turnosEmpleado);

    let totalHoras = 0;
    let horasExtraTotales = 0;
    let horasExtraDiurnas = 0;
    let horasExtraNocturnas = 0;
    let horasExtra = horasExtraDiurnas + horasExtraNocturnas;

    let recargoNocturno = 0;
    let horasFestivas = 0;


    if (!esTrabajadorDireccion) {
      for (const claveSemana in semanasTurnos) {
        let horasAcumuladas = 0;
        const turnosSemana = semanasTurnos[claveSemana];

        for (const turno of turnosSemana) {
          const [hiH, hiM] = turno.horaInicio.split(":").map(Number);
          const [hfH, hfM] = turno.horaFin.split(":").map(Number);
          const horaInicio = hiH + hiM / 60;
          const horaFin = hfH + hfM / 60;
          const minutosDescanso = Number(turno.minutosDescanso) || 0;

          const { horasNocturnas, horasDiurnas, tiempoTrabajado } = calcularHorasNocturnas(horaInicio, horaFin, minutosDescanso);

          const espacioDisponible = Math.max(0, HORAS_SEMANALES_MAXIMAS - horasAcumuladas);
          const horasAsignadas = Math.min(tiempoTrabajado, espacioDisponible);
          const horasExcedentes = Math.max(0, tiempoTrabajado - espacioDisponible);

          horasAcumuladas += horasAsignadas;

          if (horasExcedentes > 0) {
            const proporcionNocturna = horasNocturnas / (horasNocturnas + horasDiurnas || 1);
            const extraNocturna = horasExcedentes * proporcionNocturna;
            const extraDiurna = horasExcedentes - extraNocturna;

            horasExtraNocturnas += extraNocturna;
            horasExtraDiurnas += extraDiurna;
            horasExtraTotales += horasExcedentes;
          }
        }
      }
    }


    const detalleTurnos = turnosEmpleado.map((turno) => {
      const fechaInicio = new Date(`${turno.diaInicio}T00:00:00`);
      const [hiH, hiM] = turno.horaInicio.split(":").map(Number);
      const [hfH, hfM] = turno.horaFin.split(":").map(Number);
      const horaInicio = hiH + hiM / 60;
      const horaFin = hfH + hfM / 60;
      const minutosDescanso = Number(turno.minutosDescanso) || 0;

      const { horasNocturnas, horasDiurnas, tiempoTrabajado } = calcularHorasNocturnas(horaInicio, horaFin, minutosDescanso);

      totalHoras += tiempoTrabajado;

      let recargoNocturnoTurno = 0;
      let inicioMin = horaInicio * 60;
      let finMin = horaFin * 60;
      if (finMin <= inicioMin) finMin += 24 * 60;
      for (let minuto = 0; minuto < (finMin - inicioMin); minuto++) {
        const horaReal = ((inicioMin + minuto) / 60) % 24;
        if (horaReal >= HORA_NOCTURNA_INICIO || horaReal < HORA_NOCTURNA_FIN) recargoNocturnoTurno++;
      }
      recargoNocturno += recargoNocturnoTurno / 60;

      const esDiaFestivo = esFestivo(fechaInicio);
      if (esDiaFestivo) horasFestivas += tiempoTrabajado;

      return {
        empleado: `${empleado.nombre} ${empleado.apellido}`,
        cc: empleado.cc,
        area: empleado.area,
        diaInicio: turno.diaInicio,
        diaFin: turno.diaFin,
        horaInicio: turno.horaInicio,
        horaFin: turno.horaFin,
        minutosDescanso: turno.minutosDescanso,
        tiempoTrabajado: tiempoTrabajado.toFixed(2),
        horasNocturnas: horasNocturnas.toFixed(2),
        horasDiurnas: horasDiurnas.toFixed(2),
        horasExtra: "0.00",
        esTrabajadorDireccion,
        esFestivo: esDiaFestivo
      };
    });

    const valores = {
      horasExtraDiurnas: horasExtraDiurnas * salarioHora * 1.25,
      horasExtraNocturnas: horasExtraNocturnas * salarioHora * 1.75,
      recargoNocturno: recargoNocturno * salarioHora * 0.35,
      recargoFestivo: horasFestivas * salarioHora * 0.80
    };

    const totalPagar = Object.values(valores).reduce((sum, val) => sum + val, 0) * 0.92;
    const costoTotal = Object.values(valores).reduce((sum, val) => sum + val, 0) * 1.3855;

    return {
      id: empleado.id,
      nombre: empleado.nombre,
      apellido: empleado.apellido,
      cc: empleado.cc,
      area: empleado.area,
      tipoTrabajador: empleado.tipoTrabajador || 'ordinario',
      esTrabajadorDireccion,
      salarioBase,
      salarioHora: salarioHora.toFixed(2),
      detalleTurnos,
      horas: {
        horasExtraTotales: horasExtraTotales.toFixed(2),
        horasExtraDiurnas: horasExtraDiurnas.toFixed(2),
        horasExtraNocturnas: horasExtraNocturnas.toFixed(2),
        recargoNocturno: recargoNocturno.toFixed(2),
        horasFestivas: horasFestivas.toFixed(2),
        totalHoras: totalHoras.toFixed(2)

      },
      valores: Object.fromEntries(
        Object.entries(valores).map(([k, v]) => [k, Math.max(0, Math.round(v))])
      ),
      totalPagar: Math.round(totalPagar),
      costoTotal: Math.round(costoTotal),
      totalHoras: totalHoras.toFixed(2),
      horasExtra: horasExtra.toFixed(2),
      pagoExtra: Math.round(valores.horasExtraDiurnas + valores.horasExtraNocturnas),
      pagoFestivo: Math.round(valores.recargoFestivo),
      cantidadTurnos: detalleTurnos.length
    };
  });

  const totales = resumenEmpleados.reduce((acc, emp) => {
    acc.totalHoras += parseFloat(emp.horas.totalHoras);
    acc.totalNomina += parseFloat(emp.totalPagar);
    acc.totalExtras += parseFloat(emp.horasExtra);
    acc.totalTurnos += emp.cantidadTurnos;
    acc.totalFestivas = (acc.totalFestivas || 0) + parseFloat(emp.horas.horasFestivas || 0);
    return acc;
  }, { totalHoras: 0, totalNomina: 0, totalExtras: 0, totalTurnos: 0, totalFestivas: 0 });

  return {
    resumenEmpleados,
    totales: {
      totalHoras: totales.totalHoras.toFixed(2),
      totalNomina: Math.round(totales.totalNomina),
      totalExtras: totales.totalExtras.toFixed(2),
      totalTurnos: totales.totalTurnos,
      totalFestivas: totales.totalFestivas.toFixed(2)
    },
  };
}

module.exports = { calcularResumenEmpleados };
