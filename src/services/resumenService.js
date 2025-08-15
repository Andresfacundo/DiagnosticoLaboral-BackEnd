const empleadosService = require("./empleadosService");
const turnosService = require("./turnosService");
const colombianHolidays = require('colombian-holidays');

const HORAS_MENSUALES_ESTANDAR = 220;
const HORA_NOCTURNA_INICIO = 21;
const HORA_NOCTURNA_FIN = 6;
const HORAS_SEMANALES_MAXIMAS = 44;
const RECARGO_FESTIVO = 0.80;
const MAX_HORAS_DIARIAS = 11;
const MAX_HORAS_EXTRA_SEMANA = 12;

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

function calcularHorasExtrasDesdeMinuto(horaInicio, horaFin, minutosDescanso, minutosHastaExtra) {
  let inicio = horaInicio * 60;
  let fin = horaFin * 60;
  if (fin <= inicio) fin += 24 * 60;

  const duracionTotal = fin - inicio;
  const tiempoSinDescanso = duracionTotal - minutosDescanso;

  if (minutosHastaExtra >= tiempoSinDescanso) {
    return { extrasNocturnas: 0, extrasDiurnas: 0 };
  }

  const minutosExtras = tiempoSinDescanso - minutosHastaExtra;
  let extrasNocturnas = 0, extrasDiurnas = 0;

  const factorDescanso = tiempoSinDescanso / duracionTotal;
  let minutosContados = 0;
  let minutosDescansoDistribuidos = 0;

  for (let minuto = inicio; minuto < fin; minuto++) {
    const minutosTranscurridos = minuto - inicio;
    const descansoEsperado = (minutosTranscurridos / duracionTotal) * minutosDescanso;

    if (minutosDescansoDistribuidos < descansoEsperado) {
      minutosDescansoDistribuidos++;
      continue;
    }

    if (minutosContados >= minutosHastaExtra) {
      const horaReal = (minuto / 60) % 24;
      if (horaReal >= HORA_NOCTURNA_INICIO || horaReal < HORA_NOCTURNA_FIN) {
        extrasNocturnas++;
      } else {
        extrasDiurnas++;
      }
    }
    minutosContados++;
  }

  return {
    extrasNocturnas: extrasNocturnas / 60,
    extrasDiurnas: extrasDiurnas / 60
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

function calcularResumenEmpleados(empleados, turnos) {
  const resumenEmpleados = empleados.map((empleado) => {
    const turnosEmpleado = turnos.filter((t) => String(t.empleadoId) === String(empleado.id));
    const salarioBase = Number(empleado.salarioBase) || 0;
    const salarioHora = salarioBase / HORAS_MENSUALES_ESTANDAR;    
    const esTrabajadorDireccion = empleado.clasificacionPersonal === 'Direccion, confianza o manejo';
    const semanasTurnos = agruparTurnosPorSemana(turnosEmpleado);

    let totalHoras = 0;
    let totalHorasExtraDiurnas = 0;
    let totalHorasExtraNocturnas = 0;
    let totalOtrasHorasExtras = 0;
    let totalRecargoNocturno = 0;
    let horasFestivas = 0;

    let detalleTurnos = [];

    if (!esTrabajadorDireccion) {
      for (const claveSemana in semanasTurnos) {
        let horasAcumuladas = 0;
        let horasExtraDiurnasSemana = 0;
        let horasExtraNocturnasSemana = 0;
        let recargoNocturnoSemana = 0;
        const turnosSemana = semanasTurnos[claveSemana];

        for (const turno of turnosSemana) {
          const [hiH, hiM] = turno.horaInicio.split(":").map(Number);
          const [hfH, hfM] = turno.horaFin.split(":").map(Number);
          const horaInicio = hiH + hiM / 60;
          const horaFin = hfH + hfM / 60;
          const minutosDescanso = Number(turno.minutosDescanso) || 0;

          const { horasNocturnas, horasDiurnas, tiempoTrabajado } =
            calcularHorasNocturnas(horaInicio, horaFin, minutosDescanso);

          if (tiempoTrabajado > MAX_HORAS_DIARIAS) {
            throw new Error(`El turno del empleado ${empleado.nombre} el día ${turno.diaInicio} excede las 11 horas permitidas.`);
          }

          totalHoras += tiempoTrabajado;

          const fechaInicio = new Date(`${turno.diaInicio}T00:00:00`);
          const esDiaFestivo = esFestivo(fechaInicio);
          if (esDiaFestivo) horasFestivas += tiempoTrabajado;

          detalleTurnos.push({
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
          });

          const espacioDisponible = Math.max(0, HORAS_SEMANALES_MAXIMAS - horasAcumuladas);
          const horasAsignadas = Math.min(tiempoTrabajado, espacioDisponible);
          const horasExcedentes = Math.max(0, tiempoTrabajado - espacioDisponible);

          horasAcumuladas += horasAsignadas;
          if (horasAsignadas > 0) {
            const proporcionNocturna = horasNocturnas / tiempoTrabajado;
            recargoNocturnoSemana += horasAsignadas * proporcionNocturna;
          }

          if (horasExcedentes > 0) {
            const minutosHastaExtra = espacioDisponible * 60;
            const { extrasNocturnas, extrasDiurnas } =
              calcularHorasExtrasDesdeMinuto(horaInicio, horaFin, minutosDescanso, minutosHastaExtra);

            horasExtraNocturnasSemana += extrasNocturnas;
            horasExtraDiurnasSemana += extrasDiurnas;
          }
        }

        // Limitar horas extra
        const horasExtraTotalesSemana = horasExtraDiurnasSemana + horasExtraNocturnasSemana;
        let otrasHorasExtrasSemana = 0;
        let horasExtraDiurnasPermitidasSemana = horasExtraDiurnasSemana;
        let horasExtraNocturnasPermitidasSemana = horasExtraNocturnasSemana;

        if (horasExtraTotalesSemana > MAX_HORAS_EXTRA_SEMANA) {
          const exceso = horasExtraTotalesSemana - MAX_HORAS_EXTRA_SEMANA;
          otrasHorasExtrasSemana = exceso;

          if (horasExtraTotalesSemana > 0) {
            const factor = horasExtraDiurnasSemana / horasExtraTotalesSemana;
            horasExtraDiurnasPermitidasSemana -= exceso * factor;
            horasExtraNocturnasPermitidasSemana -= exceso * (1 - factor);
          }
        }

        totalHorasExtraDiurnas += horasExtraDiurnasPermitidasSemana;
        totalHorasExtraNocturnas += horasExtraNocturnasPermitidasSemana;
        totalOtrasHorasExtras += otrasHorasExtrasSemana;
        totalRecargoNocturno += recargoNocturnoSemana;
      }
    }

    const valores = {
      horasExtraDiurnas: totalHorasExtraDiurnas * salarioHora * 1.25,
      horasExtraNocturnas: totalHorasExtraNocturnas * salarioHora * 1.75,
      otrasHorasExtras: totalOtrasHorasExtras * salarioHora * 1.25,
      recargoNocturno: totalRecargoNocturno * salarioHora * 0.35,
      recargoFestivo: horasFestivas * salarioHora * RECARGO_FESTIVO
    };

    const totalPagar = Object.values(valores).reduce((sum, val) => sum + val, 0) * 0.92;
    const costoTotal = Object.values(valores).reduce((sum, val) => sum + val, 0) * 1.3855;

    const horasExtraTotales = totalHorasExtraDiurnas + totalHorasExtraNocturnas;

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
        horasExtraDiurnas: totalHorasExtraDiurnas.toFixed(2),
        horasExtraNocturnas: totalHorasExtraNocturnas.toFixed(2),
        otrasHorasExtras: totalOtrasHorasExtras.toFixed(2),
        recargoNocturno: totalRecargoNocturno.toFixed(2),
        horasFestivas: horasFestivas.toFixed(2),
        totalHoras: totalHoras.toFixed(2)
      },
      valores: Object.fromEntries(
        Object.entries(valores).map(([k, v]) => [k, Math.max(0, Math.round(v))])
      ),
      totalPagar: Math.round(totalPagar),
      costoTotal: Math.round(costoTotal),
      totalHoras: totalHoras.toFixed(2),
      horasExtra: horasExtraTotales.toFixed(2),
      pagoExtra: Math.round(valores.horasExtraDiurnas + valores.horasExtraNocturnas + valores.otrasHorasExtras),
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
    }
  };
}


module.exports = { calcularResumenEmpleados };