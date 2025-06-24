const empleadosService = require('../services/empleadosService.js');

const obtenerEmpleados = (req, res) => {
  res.json(empleadosService.getEmpleados());
};

const agregarEmpleado = (req, res) => {
  const nuevoEmpleado = empleadosService.addEmpleado(req.body);
  res.status(201).json(nuevoEmpleado);
};

module.exports = { obtenerEmpleados, agregarEmpleado };
