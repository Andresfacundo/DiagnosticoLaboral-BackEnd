const empleadosService = require("./empleadosService");
const turnosService = require("./turnosService");

const HORAS_MENSUALES_ESTANDAR = 230;
const HORA_NOCTURNA_INICIO = 21;
const HORA_NOCTURNA_FIN = 6;
const HORAS_SEMANALES_MAXIMAS = 46;
const JORNADA_MAXIMA_DIARIA = 11;
const TIEMPO_MINIMO_ALIMENTACION = 20;

const diasFestivos = [
  '2025-01-01', '2025-03-25', '2025-03-28', '2025-03-29',
  '2025-05-01', '2025-05-13', '2025-06-03', '2025-06-24',
  '2025-07-01', '2025-07-20', '2025-08-07', '2025-08-19',
  '2025-10-14', '2025-11-04', '2025-11-11', '2025-12-08', '2025-12-25'
];

function esFestivo(fecha) {
  const fechaStr = fecha.toISOString().split('T')[0];
  return diasFestivos.includes(fechaStr);
}

function calcularHorasNocturnas(horaInicio, horaFin, minutosDescanso = 0) {
  const bloques = [];

  let inicio = horaInicio * 60;
  let fin = horaFin * 60;

  if (fin <= inicio) {
    fin += 24 * 60;
  }

  const duracionTotal = fin - inicio;
  const descansoInicio = inicio + Math.floor((duracionTotal - minutosDescanso) / 2);

  for (let minuto = 0; minuto < duracionTotal; minuto++) {
    const tiempoActual = inicio + minuto;

    if (
      tiempoActual >= descansoInicio &&
      tiempoActual < descansoInicio + minutosDescanso
    ) {
      continue;
    }

    const horaReal = (tiempoActual / 60) % 24;

    if (horaReal >= HORA_NOCTURNA_INICIO || horaReal < HORA_NOCTURNA_FIN) {
      bloques.push("nocturna");
    } else {
      bloques.push("diurna");
    }
  }

  const nocturnas = bloques.filter((h) => h === "nocturna").length / 60;
  const diurnas = bloques.filter((h) => h === "diurna").length / 60;

  return {
    horasDiurnas: Number(diurnas.toFixed(2)),
    horasNocturnas: Number(nocturnas.toFixed(2)),
    tiempoTrabajado: Number((diurnas + nocturnas).toFixed(2)),
  };
}

function agruparTurnosPorSemana(turnos) {
  const semanas = {};

  turnos.forEach(turno => {
    const fecha = new Date(`${turno.dia}T00:00:00`);
    const inicioSemana = new Date(fecha);
    inicioSemana.setDate(fecha.getDate() - fecha.getDay());
    const claveSemana = inicioSemana.toISOString().split('T')[0];

    if (!semanas[claveSemana]) {
      semanas[claveSemana] = [];
    }
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

function calcularResumenEmpleados(empleados,turnos) {
  // const empleados = empleadosService.getEmpleados();
  // const turnos = turnosService.getTurnos();

  const resumenEmpleados = empleados.map((empleado) => {
    const turnosEmpleado = turnos.filter((t) => String(t.empleadoId) === String(empleado.id));
    const salarioBase = Number(empleado.salarioBase) || 0;
    const salarioHora = salarioBase / HORAS_MENSUALES_ESTANDAR;

    const esTrabajadorDireccion = ['direccion', 'confianza', 'manejo'].includes(empleado.tipoTrabajador);

    const semanasTurnos = agruparTurnosPorSemana(turnosEmpleado);

    let totalHoras = 0;
    let extrasDiurnas = 0, extrasNocturnas = 0, extrasDomDiurnas = 0, extrasDomNocturnas = 0;
    let recargoNocturno = 0, recargoDomDiurno = 0, recargoDomNocturno = 0, recargoFestivo = 0;

    const detalleTurnos = turnosEmpleado.map((turno) => {
      const fecha = new Date(`${turno.dia}T00:00:00`);
      const esDomingo = fecha.getDay() === 0;
      const esFestivoHoy = esFestivo(fecha);

      const [hiH, hiM] = turno.horaInicio.split(":").map(Number);
      const [hfH, hfM] = turno.horaFin.split(":").map(Number);
      const horaInicio = hiH + hiM / 60;
      const horaFin = hfH + hfM / 60;

      const minutosDescanso = Number(turno.minutosDescanso) || 0;
      const {
        horasNocturnas,
        horasDiurnas,
        tiempoTrabajado
      } = calcularHorasNocturnas(horaInicio, horaFin, minutosDescanso);

      totalHoras += tiempoTrabajado;

      const inicioSemana = new Date(fecha);
      inicioSemana.setDate(fecha.getDate() - fecha.getDay());
      const claveSemana = inicioSemana.toISOString().split('T')[0];
      const horasSemanales = calcularHorasSemanales(semanasTurnos[claveSemana]);

      let horasExtra = 0;
      if (!esTrabajadorDireccion && horasSemanales > HORAS_SEMANALES_MAXIMAS) {
        const horasExtraSemanales = horasSemanales - HORAS_SEMANALES_MAXIMAS;
        const proporcionTurno = tiempoTrabajado / horasSemanales;
        horasExtra = horasExtraSemanales * proporcionTurno;
      }

      const horasNormales = tiempoTrabajado - horasExtra;

      const proporcionNocturna = horasNocturnas / tiempoTrabajado || 0;
      const extrasNocturnasTurno = horasExtra * proporcionNocturna;
      const extrasDiurnasTurno = horasExtra - extrasNocturnasTurno;

      const horasNormalesNocturnas = horasNormales * proporcionNocturna;
      const horasNormalesDiurnas = horasNormales - horasNormalesNocturnas;

      if (esFestivoHoy) {
        recargoFestivo += horasNormalesDiurnas + horasNormalesNocturnas;
        if (!esTrabajadorDireccion) {
          extrasDomDiurnas += extrasDiurnasTurno;
          extrasDomNocturnas += extrasNocturnasTurno;
        }
      } else if (esDomingo) {
        recargoDomDiurno += horasNormalesDiurnas;
        recargoDomNocturno += horasNormalesNocturnas;
        if (!esTrabajadorDireccion) {
          extrasDomDiurnas += extrasDiurnasTurno;
          extrasDomNocturnas += extrasNocturnasTurno;
        }
      } else {
        recargoNocturno += horasNormalesNocturnas;
        if (!esTrabajadorDireccion) {
          extrasDiurnas += extrasDiurnasTurno;
          extrasNocturnas += extrasNocturnasTurno;
        }
      }

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
        horasExtra: horasExtra.toFixed(2),
        horasSemanales: horasSemanales.toFixed(2),
        esDomingo,
        esFestivo: esFestivoHoy,
        esTrabajadorDireccion
      };
    });

    const valores = {
      pagoHorasNormales: totalHoras * salarioHora,
      extrasDiurnas: extrasDiurnas * salarioHora * 1.25,
      extrasNocturnas: extrasNocturnas * salarioHora * 1.75,
      extrasDomDiurnas: extrasDomDiurnas * salarioHora * 2.0,
      extrasDomNocturnas: extrasDomNocturnas * salarioHora * 2.5,

      recargoNocturno: recargoNocturno * salarioHora * 0.35,
      recargoDomDiurno: recargoDomDiurno * salarioHora * 0.80,
      recargoDomNocturno: recargoDomNocturno * salarioHora * 1.10,
      recargoFestivo: recargoFestivo * salarioHora * 0.75,
    };

    const totalPagar = Object.values(valores).reduce((sum, val) => sum + val, 0);

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
        extrasDiurnas: extrasDiurnas.toFixed(2),
        extrasNocturnas: extrasNocturnas.toFixed(2),
        extrasDomDiurnas: extrasDomDiurnas.toFixed(2),
        extrasDomNocturnas: extrasDomNocturnas.toFixed(2),
        recargoDomDiurno: recargoDomDiurno.toFixed(2),
        recargoDomNocturno: recargoDomNocturno.toFixed(2),
        recargoNocturno: recargoNocturno.toFixed(2),
        recargoFestivo: recargoFestivo.toFixed(2),
        totalHoras: totalHoras.toFixed(2)
      },
      valores: Object.fromEntries(
        Object.entries(valores).map(([k, v]) => [k, Math.max(0, Math.round(v))])
      ),
      totalPagar: Math.round(totalPagar),

           totalHoras: totalHoras.toFixed(2),
      horasRegulares: (totalHoras - (extrasDiurnas + extrasNocturnas + extrasDomDiurnas + extrasDomNocturnas)).toFixed(2),
      horasExtra: (extrasDiurnas + extrasNocturnas + extrasDomDiurnas + extrasDomNocturnas).toFixed(2),
      pagoRegular: Math.round(valores.pagoHorasNormales),
      pagoExtra: Math.round(
        valores.extrasDiurnas +
        valores.extrasNocturnas +
        valores.extrasDomDiurnas +
        valores.extrasDomNocturnas
      ),
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
