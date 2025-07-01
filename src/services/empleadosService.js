const { v4: uuidv4 } = require('uuid');
let empleados = [];

function getEmpleados() {
  return empleados;
}

function addEmpleado(data) {
  const empleado = {
    id: uuidv4(),
    nombre: data.nombre,
    apellido: data.apellido,
    cc: data.cc,
    clasificacionPersonal: data.clasificacionPersonal,
    area: data.area,
    salarioBase: parseFloat(data.salarioBase) 
  };
  empleados.push(empleado);
  return empleado;
}

function addEmpleadosMasivos(lista) {
  const empleadosAgregados = lista.map(data => ({
    id: uuidv4(),
    nombre: data.nombre,
    apellido: data.apellido,
    cc: data.cc,
    clasificacionPersonal: data.clasificacionPersonal,
    area: data.area,
    salarioBase: parseFloat(data.salarioBase)
  }));

  empleados.push(...empleadosAgregados);
  return empleadosAgregados;
}

module.exports = { getEmpleados, addEmpleado, addEmpleadosMasivos };
