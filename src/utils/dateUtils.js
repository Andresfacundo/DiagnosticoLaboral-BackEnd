const { parseISO, startOfWeek, formatISO } = require("date-fns");


function agruparTurnosPorSemana(turnos) {
  const semanas = {};
  turnos.forEach(turno => {
    // diaInicio esperado en formato yyyy-mm-dd
    const fecha = parseISO(turno.diaInicio);
    const inicioSemana = startOfWeek(fecha, { weekStartsOn: 1 }); 
    const claveSemana = formatISO(inicioSemana, { representation: "date" });
    if (!semanas[claveSemana]) semanas[claveSemana] = [];
    semanas[claveSemana].push(turno);
  });
  return semanas;
}


function horaStringADecimal(horaStr) {
  // if(!horaStr) return 0;
  const [h, m] = horaStr.split(":").map(Number);
  return h + (m / 60);
}

module.exports = { agruparTurnosPorSemana, horaStringADecimal };
