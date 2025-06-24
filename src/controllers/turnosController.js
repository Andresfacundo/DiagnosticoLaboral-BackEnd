const turnosService = require('../services/turnosService.js');

const obtenerTurnos = (req, res) => {
  res.json(turnosService.getTurnos());
};

const agregarTurno = (req, res) => {
  const nuevoTurno = turnosService.addTurno(req.body);
  res.status(201).json(nuevoTurno);
};

const actualizarTurno = (req, res) => {
  const { id } = req.params;
  const turnoActualizado = turnosService.updateTurno(id, req.body);
  if (!turnoActualizado) {
    return res.status(404).json({ error: 'Turno no encontrado' });
  }
  res.json(turnoActualizado);
};
const eliminarTurno = (req, res) => {
  const { id } = req.params;
  const eliminado = turnosService.deleteTurno(id);
  if (!eliminado) {
    return res.status(404).json({ error: 'Turno no encontrado' });
  }
  res.status(204).send();
};


module.exports = { obtenerTurnos, agregarTurno , actualizarTurno, eliminarTurno };
