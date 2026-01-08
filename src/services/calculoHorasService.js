const colombianHolidays = require("colombian-holidays");
const { agruparTurnosPorSemana, horaStringADecimal } = require("../utils/dateUtils");

const TARIFAS = {
  HORA_EXTRA_ORDINARIA: 1.25,
  HORA_EXTRA_NOCTURNA: 1.75,
  HORA_EXTRA_ORDINARIA_DOMINICAL: 2.05,
  HORA_EXTRA_NOCTURNA_DOMINICAL: 2.55,
  RECARGO_NOCTURNO: 0.35,
  RECARGO_DOMINICAL: 0.8,
  RECARGO_NOCTURNO_DOMINICAL: 1.15
};

class CalculoHorasService {
  constructor() {
    this.HORAS_MENSUALES_ESTANDAR = 220;
    this.HORA_NOCTURNA_INICIO = 21;
    this.HORA_NOCTURNA_FIN = 6;
    this.HORAS_SEMANALES_MAXIMAS = 44;
    this.HORAS_DIARIAS_MAX_EXTRA = 2;
    this.HORAS_DIARIAS_LIMITE = 9;
    this.HORAS_DIARIAS_MAX = 11;
    this.TRATAR_DOMINGOS_COMO_DOMINICAL = false;
  }


  esFestivo(fecha) {
    // return colombianHolidays.isHoliday(fecha);
    const y = fecha.getFullYear();
    const m = fecha.getMonth();
    const d = fecha.getDate();
    const fechaMidnightLocal = new Date(y, m, d); // midnight local del día
    const esFestivo = colombianHolidays.isHoliday(fechaMidnightLocal);
    const esDomingo = fechaMidnightLocal.getDay() === 0;
    return esFestivo || (this.TRATAR_DOMINGOS_COMO_DOMINICAL && esDomingo);

  }

  crearFechaDesdeBody(dia, hora = "00:00") {
    const [year, month, day] = dia.split("-").map(Number);
    const [hours, minutes] = hora.split(":").map(Number);


    return new Date(year, month - 1, day, hours, minutes);
  }

  aMinutos(horaInicio, horaFin) {
    let inicio = horaInicio * 60;
    let fin = horaFin * 60;
    if (fin <= inicio) fin += 24 * 60;
    return { inicio, fin };
  }

  esNocturna(hora) {
    return hora >= this.HORA_NOCTURNA_INICIO || hora < this.HORA_NOCTURNA_FIN;
  }

  aplicarDescanso(inicio, fin, minutosDescanso = 0, inicioDescanso) {
    if (!minutosDescanso || minutosDescanso <= 0) {
      return { inicioDescansoMin: null, finDescansoMin: null };
    }
    let inicioDescansoMin;
    if (inicioDescanso !== null && inicioDescanso !== undefined) {
      inicioDescansoMin = inicioDescanso * 60;
      if (inicioDescansoMin < inicio) {
        inicioDescansoMin += 24 * 60;
      }
    } else {
      inicioDescansoMin = fin - minutosDescanso;
    }
    const finDescansoMin = inicioDescansoMin + minutosDescanso;
    return { inicioDescansoMin, finDescansoMin };
  }

  clasificarMinutosTurno(turno, acumuladasSemana) {
    const inicio = horaStringADecimal(turno.horaInicio);
    const fin = horaStringADecimal(turno.horaFin);
    const descanso = Number(turno.minutosDescanso) || 0;
    const inicioDescanso = turno.inicioDescanso ? horaStringADecimal(turno.inicioDescanso) : null;

    const { inicio: minInicio, fin: minFin } = this.aMinutos(inicio, fin);
    const { inicioDescansoMin, finDescansoMin } = this.aplicarDescanso(minInicio, minFin, descanso, inicioDescanso);

    // baseDate = medianoche local del diaInicio
    const baseDate = this.crearFechaDesdeBody(turno.diaInicio, "00:00");

    // límites (minutos)
    const limiteDiario = this.HORAS_DIARIAS_LIMITE * 60;
    const maximoDiario = this.HORAS_DIARIAS_MAX * 60;
    const maxExtrasDiarias = this.HORAS_DIARIAS_MAX_EXTRA * 60;
    const limiteSemanal = this.HORAS_SEMANALES_MAXIMAS * 60;

    let minutosTrabajados = 0;
    let minutosOrdinariosSemana = acumuladasSemana * 60;

    // acumuladores
    let extraDiurnasDiarias = 0, extraNocturnasDiarias = 0;
    let extraDiurnasSemanales = 0, extraNocturnasSemanales = 0;
    let extraDiurnasDiariasDominicales = 0, extraNocturnasDiariasDominicales = 0;
    let extraDiurnasSemanalesDominicales = 0, extraNocturnasSemanalesDominicales = 0;

    let recargoNocturno = 0, recargoDominicalDiurno = 0, recargoDominicalNocturno = 0;
    let totalMinutos = 0;

    for (let minuto = minInicio; minuto < minFin; minuto++) {
      // aplicar descanso
      if (inicioDescansoMin !== null && minuto >= inicioDescansoMin && minuto < finDescansoMin) continue;



      totalMinutos++;


      // minuteOfDay: 0..1439 (evita problemas cuando minuto >= 1440)
      const minuteOfDay = ((minuto % (24 * 60)) + (24 * 60)) % (24 * 60);
      const horaReal = minuteOfDay / 60;
      const esNocturna = this.esNocturna(horaReal);

      // fecha real de este minuto (local)
      const minuteTimestamp = baseDate.getTime() + minuto * 60 * 1000;
      const minuteDate = new Date(minuteTimestamp);

      // detectamos festivo o domingo en el día real del minuteDate
      const esDomFestivoMinuto = this.esFestivo(minuteDate);

      // extras
      const esExtraDiaria = minutosTrabajados >= limiteDiario && minutosTrabajados < (limiteDiario + maxExtrasDiarias);
      const esExtraSemanal = !esExtraDiaria && minutosOrdinariosSemana >= limiteSemanal;

      // clasificación
      if (esDomFestivoMinuto) {
        if (esExtraDiaria) {
          if (esNocturna) extraNocturnasDiariasDominicales++;
          else extraDiurnasDiariasDominicales++;
        } else if (esExtraSemanal) {
          if (esNocturna) extraNocturnasSemanalesDominicales++;
          else extraDiurnasSemanalesDominicales++;
        } else {
          if (esNocturna) recargoDominicalNocturno++;
          else recargoDominicalDiurno++;
        }
      } else {
        if (esExtraDiaria) {
          if (esNocturna) extraNocturnasDiarias++;
          else extraDiurnasDiarias++;
        } else if (esExtraSemanal) {
          if (esNocturna) extraNocturnasSemanales++;
          else extraDiurnasSemanales++;
        } else {
          if (esNocturna) recargoNocturno++;
          // diurno ordinario no suma recargo
        }
      }

      // sólo minutos ordinarios (no extras) suman para el conteo semanal
      if (!(esExtraDiaria || esExtraSemanal)) {
        minutosOrdinariosSemana++;
      }

      minutosTrabajados++;
    }

    // agregados
    const extraDiurnasMin = extraDiurnasDiarias + extraDiurnasSemanales;
    const extraNocturnasMin = extraNocturnasDiarias + extraNocturnasSemanales;
    const extraDiurnasDomMin = extraDiurnasDiariasDominicales + extraDiurnasSemanalesDominicales;
    const extraNocturnasDomMin = extraNocturnasDiariasDominicales + extraNocturnasSemanalesDominicales;

    return {
      tiempoTrabajado: totalMinutos / 60,
      extraDiurnasDiarias: extraDiurnasDiarias / 60,
      extraNocturnasDiarias: extraNocturnasDiarias / 60,
      extraDiurnasSemanales: extraDiurnasSemanales / 60,
      extraNocturnasSemanales: extraNocturnasSemanales / 60,
      extraDiurnasDiariasDominicales: extraDiurnasDiariasDominicales / 60,
      extraNocturnasDiariasDominicales: extraNocturnasDiariasDominicales / 60,
      extraDiurnasSemanalesDominicales: extraDiurnasSemanalesDominicales / 60,
      extraNocturnasSemanalesDominicales: extraNocturnasSemanalesDominicales / 60,
      extraDiurnas: extraDiurnasMin / 60,
      extraNocturnas: extraNocturnasMin / 60,
      extraDiurnasDominicales: extraDiurnasDomMin / 60,
      extraNocturnasDominicales: extraNocturnasDomMin / 60,
      recargoNocturno: recargoNocturno / 60,
      recargoDominicalDiurno: recargoDominicalDiurno / 60,
      recargoDominicalNocturno: recargoDominicalNocturno / 60,
      minutosOrdinariosSemana: minutosOrdinariosSemana / 60
    };
  }

  calcularResumenEmpleados(trabajadores, turnos) {
    const resumenEmpleados = trabajadores.map((trabajador) => {
      const turnosTrabajador = turnos.filter((t) => String(t.trabajadorId || t.empleadoId) === String(trabajador.id));
      const salarioBase = Number(trabajador.salarioBase) || 0;
      const salarioHora = salarioBase / this.HORAS_MENSUALES_ESTANDAR;
      const esDireccion = trabajador.clasificacionPersonal === "Direccion, confianza o manejo";
      const semanas = agruparTurnosPorSemana(turnosTrabajador);

      // Acumuladores globales
      let totalHoras = 0;
      let extraDiurnas = 0, extraNocturnas = 0;
      let extraDiurnasDominicales = 0, extraNocturnasDominicales = 0;
      let recargoNocturno = 0, recargoDominicalDiurno = 0, recargoDominicalNocturno = 0;
      const detalleTurnos = [];

      if (!esDireccion) {
        for (const claveSemana in semanas) {
          let acumuladasSemana = 0;
          const turnosSemana = semanas[claveSemana];

          for (const turno of turnosSemana) {
            const clasificados = this.clasificarMinutosTurno(turno, acumuladasSemana);

            totalHoras += clasificados.tiempoTrabajado;
            acumuladasSemana = clasificados.minutosOrdinariosSemana;

            extraDiurnas += clasificados.extraDiurnas;
            extraNocturnas += clasificados.extraNocturnas;
            extraDiurnasDominicales += clasificados.extraDiurnasDominicales;
            extraNocturnasDominicales += clasificados.extraNocturnasDominicales;
            recargoNocturno += clasificados.recargoNocturno;
            recargoDominicalDiurno += clasificados.recargoDominicalDiurno;
            recargoDominicalNocturno += clasificados.recargoDominicalNocturno;
            
            if (clasificados.extraDiurnas > 0) {
              detalleTurnos.push({
                fecha: turno.diaInicio,
                horaInicio: turno.horaInicio,
                horaFin: turno.horaFin,
                categoria: "extra_ordinaria",
                horas: clasificados.extraDiurnas,
                valor: clasificados.extraDiurnas * salarioHora * TARIFAS.HORA_EXTRA_ORDINARIA,
                trabajadorId: trabajador.id,
                turnoId: turno.id
              });
            }

            if (clasificados.extraNocturnas > 0) {              
              detalleTurnos.push({
                fecha: turno.diaInicio,
                horaInicio: turno.horaInicio,
                horaFin: turno.horaFin,
                categoria: "extra_nocturna",
                horas: clasificados.extraNocturnas,
                valor: clasificados.extraNocturnas * salarioHora * TARIFAS.HORA_EXTRA_NOCTURNA,
                trabajadorId: trabajador.id,
                turnoId: turno.id
              });
            }

            if (clasificados.extraDiurnasDominicales > 0) {
              detalleTurnos.push({
                fecha: turno.diaInicio,
                horaInicio: turno.horaInicio,
                horaFin: turno.horaFin,
                categoria: "extra_ordinaria_dominical",
                horas: clasificados.extraDiurnasDominicales,
                valor: clasificados.extraDiurnasDominicales * salarioHora * TARIFAS.HORA_EXTRA_ORDINARIA_DOMINICAL,
                trabajadorId: trabajador.id,
                turnoId: turno.id
              });
            }

            if (clasificados.extraNocturnasDominicales > 0) {
              detalleTurnos.push({
                fecha: turno.diaInicio,
                horaInicio: turno.horaInicio,
                horaFin: turno.horaFin,
                categoria: "extra_nocturna_dominical",
                horas: clasificados.extraNocturnasDominicales,
                valor: clasificados.extraNocturnasDominicales * salarioHora * TARIFAS.HORA_EXTRA_NOCTURNA_DOMINICAL,
                trabajadorId: trabajador.id,
                turnoId: turno.id
              });
            }
          }
        }
      }

      // --- Cálculo de pagos ---
      const pagos = {
        horasExtraOrdinarias: extraDiurnas * salarioHora * TARIFAS.HORA_EXTRA_ORDINARIA,
        horasExtraNocturnas: extraNocturnas * salarioHora * TARIFAS.HORA_EXTRA_NOCTURNA,
        horasExtraFestivasDiurnas: extraDiurnasDominicales * salarioHora * TARIFAS.HORA_EXTRA_ORDINARIA_DOMINICAL,
        horasExtraFestivasNocturnas: extraNocturnasDominicales * salarioHora * TARIFAS.HORA_EXTRA_NOCTURNA_DOMINICAL,
        recargoNocturno: recargoNocturno * salarioHora * TARIFAS.RECARGO_NOCTURNO,
        recargoFestivoDiurno: recargoDominicalDiurno * salarioHora * TARIFAS.RECARGO_DOMINICAL,
        recargoFestivoNocturno: recargoDominicalNocturno * salarioHora * TARIFAS.RECARGO_NOCTURNO_DOMINICAL
      };

      const totalPagos = Object.values(pagos).reduce((a, b) => a + b, 0);
      const netoAPagar = totalPagos * 0.92;
      const costoTotal = totalPagos * 1.3855;

      return {
        id: trabajador.id,
        salarioBase,
        salarioHora,
        totalHoras,
        horasExtraOrdinaria: extraDiurnas,
        valorExtraOrdinaria: pagos.horasExtraOrdinarias,
        horasExtraNocturna: extraNocturnas,
        valorExtraNocturna: pagos.horasExtraNocturnas,
        horasExtraOrdinariaDominical: extraDiurnasDominicales,
        valorExtraOrdinariaDominical: pagos.horasExtraFestivasDiurnas,
        horasExtraNocturnaDominical: extraNocturnasDominicales,
        valorExtraNocturnaDominical: pagos.horasExtraFestivasNocturnas,
        horasRecargoNocturno: recargoNocturno,
        valorRecargoNocturno: pagos.recargoNocturno,
        horasRecargoDominical: recargoDominicalDiurno,
        valorRecargoDominical: pagos.recargoFestivoDiurno,
        horasRecargoNocturnoDominical: recargoDominicalNocturno,
        valorRecargoNocturnoDominical: pagos.recargoFestivoNocturno,
        netoAPagar,
        costoTotal,
        detalleTurnos
      };
    });

    const totales = resumenEmpleados.reduce((acc, emp) => {
      acc.totalHoras += parseFloat(emp.totalHoras);
      acc.totalNomina += emp.netoAPagar;
      return acc;
    }, { totalHoras: 0, totalNomina: 0 });

    return {
      resumenEmpleados,
      totales: {
        totalHoras: totales.totalHoras.toFixed(2),
        totalNomina: Math.round(totales.totalNomina)
      }
    };
  }
}

module.exports = new CalculoHorasService();
