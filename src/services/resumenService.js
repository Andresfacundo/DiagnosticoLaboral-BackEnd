const empleadosService = require("./empleadosService");
const turnosService = require("./turnosService");

const HORAS_MENSUALES_ESTANDAR = 230;
const HORA_NOCTURNA_INICIO = 21;
const HORA_NOCTURNA_FIN = 6;
const HORAS_SEMANALES_MAXIMAS = 46;

const diasFestivos = [
  '2025-01-01', '2025-03-25', '2025-03-28', '2025-03-29',
  '2025-05-01', '2025-05-13', '2025-06-03', '2025-05-24',
  '2025-07-01', '2025-07-20', '2025-08-07', '2025-08-19',
  '2025-10-14', '2025-11-04', '2025-11-11', '2025-12-08', '2025-12-25'
];

function esFestivo(fecha) {
  const fechaStr = fecha.toISOString().split('T')[0];
  return diasFestivos.includes(fechaStr);
}

// Calcula horas nocturnas entre 21:00 y 6:00, respetando minutos de descanso
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
    const fecha = new Date(`${turno.dia}T00:00:00`);
    const inicioSemana = new Date(fecha);
    inicioSemana.setDate(fecha.getDate() - fecha.getDay());
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
    const esTrabajadorDireccion = ['Direccion, confianza o manejo', 'Ordinario'].includes(empleado.tipoTrabajador);
    const semanasTurnos = agruparTurnosPorSemana(turnosEmpleado);

    let totalHoras = 0;
    let horasExtra = 0;
    let recargoNocturno = 0;

    const detalleTurnos = turnosEmpleado.map((turno) => {
      const fecha = new Date(`${turno.dia}T00:00:00`);
      const [hiH, hiM] = turno.horaInicio.split(":").map(Number);
      const [hfH, hfM] = turno.horaFin.split(":").map(Number);
      const horaInicio = hiH + hiM / 60;
      const horaFin = hfH + hfM / 60;
      const minutosDescanso = Number(turno.minutosDescanso) || 0;

      const { horasNocturnas, horasDiurnas, tiempoTrabajado } = calcularHorasNocturnas(horaInicio, horaFin, minutosDescanso);

      totalHoras += tiempoTrabajado;

      // Calcular horas semanales para este turno
      const inicioSemana = new Date(fecha);
      inicioSemana.setDate(fecha.getDate() - fecha.getDay());
      const claveSemana = inicioSemana.toISOString().split('T')[0];
      const horasSemanales = calcularHorasSemanales(semanasTurnos[claveSemana]);

      let horasExtraTurno = 0;
      if (!esTrabajadorDireccion && horasSemanales > HORAS_SEMANALES_MAXIMAS) {
        const horasExtraSemanales = horasSemanales - HORAS_SEMANALES_MAXIMAS;
        const proporcionTurno = tiempoTrabajado / horasSemanales;
        horasExtraTurno = horasExtraSemanales * proporcionTurno;
      }

      horasExtra += horasExtraTurno;

      // Calcular recargo nocturno solo para horas entre 21:00 y 6:00
      let recargoNocturnoTurno = 0;
      let minutosTrabajados = 0;
      let inicioMin = horaInicio * 60;
      let finMin = horaFin * 60;
      if (finMin <= inicioMin) finMin += 24 * 60;
      for (let minuto = 0; minuto < (finMin - inicioMin); minuto++) {
        const horaReal = ((inicioMin + minuto) / 60) % 24;
        if (horaReal >= HORA_NOCTURNA_INICIO || horaReal < HORA_NOCTURNA_FIN) recargoNocturnoTurno++;
        minutosTrabajados++;
      }

      recargoNocturnoTurno = Math.max(0, recargoNocturnoTurno );
      recargoNocturno += recargoNocturnoTurno / 60;

      return {
        empleado: `${empleado.nombre} ${empleado.apellido}`,
        cc: empleado.cc,
        area: empleado.area,
        dia: turno.dia,
        horaInicio: turno.horaInicio,
        horaFin: turno.horaFin,
        minutosDescanso: turno.minutosDescanso,
        tiempoTrabajado: tiempoTrabajado.toFixed(2),
        horasNocturnas: horasNocturnas.toFixed(2),
        horasDiurnas: horasDiurnas.toFixed(2),
        horasExtra: horasExtraTurno.toFixed(2),
        horasSemanales: horasSemanales.toFixed(2),
        esTrabajadorDireccion
      };
    });

    // const horasRegulares = totalHoras - horasExtra;

    const valores = {
      // pagoHorasNormales: salarioHora,
      horasExtra: horasExtra * salarioHora * 1.25, // Recargo único para todas las extras
      recargoNocturno: recargoNocturno * salarioHora * 0.35
    };

    const totalPagar = Object.values(valores).reduce((sum, val) => sum + val , 0)* 0.92;
    const costoTotal = Object.values(valores).reduce((sum, val) => sum + val , 0)* 1.3855;



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
        horasExtra: horasExtra.toFixed(2),
        recargoNocturno: recargoNocturno.toFixed(2),
        totalHoras: totalHoras.toFixed(2)
      },
      valores: Object.fromEntries(
        Object.entries(valores).map(([k, v]) => [k, Math.max(0, Math.round(v))])
      ),
      totalPagar: Math.round(totalPagar),
      costoTotal: Math.round(costoTotal),
      totalHoras: totalHoras.toFixed(2),
      // horasRegulares: horasRegulares.toFixed(2),
      horasExtra: horasExtra.toFixed(2),
      // pagoRegular: Math.round(valores.pagoHorasNormales),
      pagoExtra: Math.round(valores.horasExtra),
      cantidadTurnos: detalleTurnos.length
    };
  });

  const totales = resumenEmpleados.reduce(
    (acc, emp) => {
      acc.totalHoras += parseFloat(emp.horas.totalHoras);
      acc.totalNomina += parseFloat(emp.totalPagar);
      acc.totalExtras += parseFloat(emp.horasExtra);
      acc.totalTurnos += emp.cantidadTurnos;
      return acc;
    },
    { totalHoras: 0, totalNomina: 0, totalExtras: 0, totalTurnos: 0 }
  );

  return {
    resumenEmpleados,
    totales: {
      totalHoras: totales.totalHoras.toFixed(2),
      totalNomina: Math.round(totales.totalNomina),
      totalExtras: totales.totalExtras.toFixed(2),
      totalTurnos: totales.totalTurnos
    },
  };
}

module.exports = { calcularResumenEmpleados };