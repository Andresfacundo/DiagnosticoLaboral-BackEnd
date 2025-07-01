const empleadosService = require('../services/empleadosService.js');

const obtenerEmpleados = (req, res) => {
  res.json(empleadosService.getEmpleados());
};

const agregarEmpleado = (req, res) => {
  const nuevoEmpleado = empleadosService.addEmpleado(req.body);
  res.status(201).json(nuevoEmpleado);
};

const agregarEmpleadosMasivos = (req, res) => {
  const lista = req.body;
  if(!Array.isArray(lista)){
    return res.status(400).json({ error: 'Se esperaba un array de empleados'});

  }

  const nuevosEmpleados = empleadosService.addEmpleadosMasivos(lista);
  res.status(201).json(nuevosEmpleados);
};


module.exports = { obtenerEmpleados, agregarEmpleado, agregarEmpleadosMasivos };
