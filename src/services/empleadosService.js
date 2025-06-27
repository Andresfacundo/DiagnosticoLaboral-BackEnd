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
    salarioBase: parseFloat(data.salarioBase) // Ahora se guarda el salario base mensual
  };
  empleados.push(empleado);
  return empleado;
}

module.exports = { getEmpleados, addEmpleado };
