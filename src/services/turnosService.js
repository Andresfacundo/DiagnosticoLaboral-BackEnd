let turnos = [];
let currentId = 1;

function getTurnos() {
  return turnos;
}

function addTurno(data) {
  const turno = {
    id: String(currentId++),
    empleadoId: data.empleadoId,
    horaInicio: data.horaInicio,
    horaFin: data.horaFin,
    dia: data.dia,
    minutosDescanso: parseInt(data.minutosDescanso)
  };
  turnos.push(turno);
  return turno;
}

function updateTurno(id, data) { 
  const idx = turnos.findIndex(t => t.id === id);
  if (idx === -1) return null;
  turnos[idx] = { ...turnos[idx], ...data, id }; // Mantén el id original
  return turnos[idx];
}

function deleteTurno(id) {
  const idx = turnos.findIndex(t => t.id === id);
  if (idx === -1) return false;
  turnos.splice(idx, 1);
  return true;
}


module.exports = { getTurnos, addTurno , updateTurno, deleteTurno };
