const TrabajadorTurnos = require('../models/TrabajadorTurnos')


async function getTrabajador(usuarioId) {
  return await TrabajadorTurnos.findAll({
    where: { usuarioId }
  });
}
async function getTrabajadorById(id, usuarioId) {
  const trabajador = await TrabajadorTurnos.findOne({
    where :{ id, usuarioId }
  });
if (!trabajador) throw new Error("trabajador no encontrado");
return trabajador;
}

async function addTrabajador(data) {
  return await TrabajadorTurnos.create({
    nombre: data.nombre,
    apellido: data.apellido,
    cc: data.cc,
    clasificacionPersonal: data.clasificacionPersonal,
    area: data.area,
    salarioBase: parseFloat(data.salarioBase),
    color: data.color || null,
    usuarioId: data.usuarioId
  });
}

async function addTrabajadoresMasivos(lista) {
  const trabajadoresAgregados = lista.map(data => ({
    nombre: data.nombre,
    apellido: data.apellido,
    cc: data.cc,
    clasificacionPersonal: data.clasificacionPersonal,
    area: data.area,
    salarioBase: parseFloat(data.salarioBase),
    color: data.color || null,
    usuarioId: data.usuarioId
  }));

  return await TrabajadorTurnos.bulkCreate(trabajadoresAgregados);
}

async function patchTrabajador(id, usuarioId, data) {
  const trabajador = await TrabajadorTurnos.findOne({
    where: { id, usuarioId }
  });

  if (!trabajador) {
    throw new Error("Trabajador no encontrado");
  }
  await trabajador.update(data);

  return trabajador;

}

async function deleteTrabajador(id, usuarioId) {
  return await TrabajadorTurnos.destroy({
    where: { id, usuarioId }
  });
}

module.exports = {
  getTrabajador,
  getTrabajadorById,
  addTrabajador,
  addTrabajadoresMasivos,
  patchTrabajador,
  deleteTrabajador
};
