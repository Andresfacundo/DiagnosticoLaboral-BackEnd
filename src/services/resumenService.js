const empleadosService = require("./empleadosService");
const turnosService = require("./turnosService");
const colombianHolidays = require('colombian-holidays');

const HORAS_MENSUALES_ESTANDAR = 220;
const HORA_NOCTURNA_INICIO = 21;
const HORA_NOCTURNA_FIN = 6;
const HORAS_SEMANALES_MAXIMAS = 44;
const HORAS_DIARIAS_LIMITE_POCOS_TURNOS = 9;
const RECARGO_FESTIVO = 0.80;
const MAX_HORAS_DIARIAS = 11;
const MAX_HORAS_EXTRA_SEMANA = 12;
const MAX_HORAS_SEMANA_TOTAL = 56;
const MAX_HORAS_EXTRA_DIARIAS = 2;

function esFestivo(fecha) {
  return colombianHolidays.isHoliday(fecha);
}

function calcularHorasNocturnas(horaInicio, horaFin, minutosDescanso = 0, inicioDescanso = null) {
  let inicio = horaInicio * 60;
  let fin = horaFin * 60;
  if (fin <= inicio) fin += 24 * 60;

  let nocturnas = 0, diurnas = 0;

  let inicioDescansoMinutos = inicioDescanso ? inicioDescanso * 60 : (fin - minutosDescanso);
  let finDescansoMinutos = inicioDescansoMinutos + minutosDescanso;

  for (let minuto = inicio; minuto < fin; minuto++) {
    if (minuto >= inicioDescansoMinutos && minuto < finDescansoMinutos) {
      continue;
    }
    const horaReal = (minuto / 60) % 24;
    if (horaReal >= HORA_NOCTURNA_INICIO || horaReal < HORA_NOCTURNA_FIN) {
      nocturnas++;
    } else {
      diurnas++;
    }
  }

  nocturnas = nocturnas / 60;
  diurnas = diurnas / 60;
  const tiempoTrabajado = nocturnas + diurnas;

  return {
    horasNocturnas: Number(nocturnas.toFixed(2)),
    horasDiurnas: Number(diurnas.toFixed(2)),
    tiempoTrabajado: Number(tiempoTrabajado.toFixed(2)),
  };
}

function calcularHorasExtrasDesdeMinuto(horaInicio, horaFin, minutosDescanso, minutosHastaExtra, inicioDescanso = null) {
  let inicio = horaInicio * 60;
  let fin = horaFin * 60;
  if (fin <= inicio) fin += 24 * 60;

  const tiempoSinDescanso = (fin - inicio) - minutosDescanso;

  if (minutosHastaExtra >= tiempoSinDescanso) {
    return { extrasNocturnas: 0, extrasDiurnas: 0 };
  }

  let inicioDescansoMinutos = inicioDescanso ? inicioDescanso * 60 : (fin - minutosDescanso);
  let finDescansoMinutos = inicioDescansoMinutos + minutosDescanso;

  let extrasNocturnas = 0, extrasDiurnas = 0;
  let minutosContados = 0;

  for (let minuto = inicio; minuto < fin; minuto++) {
    if (minuto >= inicioDescansoMinutos && minuto < finDescansoMinutos) {
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

          let inicioDescanso = null;
          if (turno.inicioDescanso) {
            const [hdH, hdM] = turno.inicioDescanso.split(":").map(Number);
            inicioDescanso = hdH + hdM / 60;
          }

          const { horasNocturnas, horasDiurnas, tiempoTrabajado } =
            calcularHorasNocturnas(horaInicio, horaFin, minutosDescanso, inicioDescanso);

          if (tiempoTrabajado > MAX_HORAS_DIARIAS) {
            throw new Error(`El turno del empleado ${empleado.nombre} el día ${turno.diaInicio} excede las 11 horas permitidas.`);
          }


          totalHoras += tiempoTrabajado;
          
          const fechaInicio = new Date(`${turno.diaInicio}T00:00:00`);
          const esDiaFestivo = esFestivo(fechaInicio);
          if (esDiaFestivo) horasFestivas += tiempoTrabajado;

          let horasExtraDiariasDelTurno = 0;
          let horasExtraDiurnasDia = 0;
          let horasExtraNocturnasDia = 0;

          // Calcular extras DIARIAS (máximo 2 por día)
          if (tiempoTrabajado > HORAS_DIARIAS_LIMITE_POCOS_TURNOS) {
            const horasExcedentesDia = Math.min(
              tiempoTrabajado - HORAS_DIARIAS_LIMITE_POCOS_TURNOS,
              MAX_HORAS_EXTRA_DIARIAS
            );

            const minutosHastaExtraDia = HORAS_DIARIAS_LIMITE_POCOS_TURNOS * 60;
            const { extrasNocturnas, extrasDiurnas } = calcularHorasExtrasDesdeMinuto(
              horaInicio, horaFin, minutosDescanso, minutosHastaExtraDia, inicioDescanso
            );

            const totalExtrasDia = extrasNocturnas + extrasDiurnas;
            if (totalExtrasDia > MAX_HORAS_EXTRA_DIARIAS) {
              const factor = MAX_HORAS_EXTRA_DIARIAS / totalExtrasDia;
              horasExtraNocturnasDia = extrasNocturnas * factor;
              horasExtraDiurnasDia = extrasDiurnas * factor;
            } else {
              horasExtraNocturnasDia = extrasNocturnas;
              horasExtraDiurnasDia = extrasDiurnas;
            }

            horasExtraDiariasDelTurno = horasExtraNocturnasDia + horasExtraDiurnasDia;
          }

          const horasOrdinariasDelTurno = tiempoTrabajado - horasExtraDiariasDelTurno;

          const espacioDisponibleSemanal = Math.max(0, HORAS_SEMANALES_MAXIMAS - horasAcumuladas);
          const horasOrdinariasSemana = Math.min(horasOrdinariasDelTurno, espacioDisponibleSemanal);
          const horasExtrasSemanalesDelTurno = Math.max(0, horasOrdinariasDelTurno - espacioDisponibleSemanal);

          horasAcumuladas += horasOrdinariasSemana;

          let horasExtraSemanalesDiurnas = 0;
          let horasExtraSemanalesNocturnas = 0;

          if (horasExtrasSemanalesDelTurno > 0) {
            const minutosOrdinarios = horasOrdinariasSemana * 60;
            const minutosExtrasYaContadas = horasExtraDiariasDelTurno * 60;
            const minutosHastaExtraSemanal = minutosOrdinarios + minutosExtrasYaContadas;

            const { extrasNocturnas, extrasDiurnas } = calcularHorasExtrasDesdeMinuto(
              horaInicio, horaFin, minutosDescanso, minutosHastaExtraSemanal, inicioDescanso
            );

            horasExtraSemanalesNocturnas = extrasNocturnas;
            horasExtraSemanalesDiurnas = extrasDiurnas;
          }

          horasExtraDiurnasSemana += horasExtraDiurnasDia + horasExtraSemanalesDiurnas;
          horasExtraNocturnasSemana += horasExtraNocturnasDia + horasExtraSemanalesNocturnas;

          // el recargo se calcula solo en las horas ordinarias que son nocturnas
          const horasNocturnasOrdinarias = Math.max(0, horasNocturnas - (horasExtraNocturnasDia + horasExtraSemanalesNocturnas));

          recargoNocturnoSemana += horasNocturnasOrdinarias;


          const horasExtraTotalTurno = horasExtraDiariasDelTurno + horasExtrasSemanalesDelTurno;

          detalleTurnos.push({
            empleado: `${empleado.nombre} ${empleado.apellido}`,
            cc: empleado.cc,
            area: empleado.area,
            diaInicio: turno.diaInicio,
            diaFin: turno.diaFin,
            horaInicio: turno.horaInicio,
            horaFin: turno.horaFin,
            minutosDescanso: turno.minutosDescanso,
            inicioDescanso: turno.inicioDescanso || 'No especificado',
            tiempoTrabajado: tiempoTrabajado.toFixed(2),
            horasNocturnas: horasNocturnas.toFixed(2),
            horasDiurnas: horasDiurnas.toFixed(2),
            horasOrdinarias: horasOrdinariasSemana.toFixed(2),
            horasExtraDiarias: horasExtraDiariasDelTurno.toFixed(2),
            horasExtraSemanales: horasExtrasSemanalesDelTurno.toFixed(2),
            horasExtra: horasExtraTotalTurno.toFixed(2),
            esTrabajadorDireccion,
            esFestivo: esDiaFestivo,
            cantidadTurnosSemana: turnosSemana.length
          });
        }

        const horasExtraTotalesSemana = horasExtraDiurnasSemana + horasExtraNocturnasSemana;
        let otrasHorasExtrasSemana = 0;
        let horasExtraDiurnasPermitidasSemana = horasExtraDiurnasSemana;
        let horasExtraNocturnasPermitidasSemana = horasExtraNocturnasSemana;

        if (horasExtraTotalesSemana > MAX_HORAS_EXTRA_SEMANA) {
          const exceso = horasExtraTotalesSemana - MAX_HORAS_EXTRA_SEMANA;
          otrasHorasExtrasSemana = exceso;
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
      recargoNocturno: totalRecargoNocturno * salarioHora * 0.35,
      recargoFestivo: horasFestivas * salarioHora * RECARGO_FESTIVO
    };

    const netoAPagar = Object.values(valores).reduce((sum, val) => sum + val, 0) * 0.92;
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
        recargoNocturno: totalRecargoNocturno.toFixed(2),
        horasFestivas: horasFestivas.toFixed(2),
        totalHoras: totalHoras.toFixed(2)
      },
      valores: Object.fromEntries(
        Object.entries(valores).map(([k, v]) => [k, Math.max(0, Math.round(v))])
      ),
      netoAPagar: Math.round(netoAPagar),
      costoTotal: Math.round(costoTotal),
      totalHoras: totalHoras.toFixed(2),
      horasExtra: horasExtraTotales.toFixed(2),
      pagoExtra: Math.round(valores.horasExtraDiurnas + valores.horasExtraNocturnas),
      pagoFestivo: Math.round(valores.recargoFestivo),
      cantidadTurnos: detalleTurnos.length
    };
  });

  const totales = resumenEmpleados.reduce((acc, emp) => {
    acc.totalHoras += parseFloat(emp.horas.totalHoras);
    acc.totalNomina += parseFloat(emp.netoAPagar);
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