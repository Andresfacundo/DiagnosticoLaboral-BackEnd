let empleados = [];
let currentId = 1;

function getEmpleados() {
  return empleados;
}

function addEmpleado(data) {
  const empleado = {
    id: String(currentId++),
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
