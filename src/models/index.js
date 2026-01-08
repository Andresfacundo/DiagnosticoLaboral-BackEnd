const sequelize = require("../../db");
const Empleador = require("./Empleador");
const Pregunta = require("./Pregunta");
const Respuesta = require("./Respuesta");
const Usuario = require('./Usuario');
const intereses = require('./interesesModels');
const Constants = require("./Constants");
const Categoria = require('./Categoria');
const Recomendacion = require('./Recomendacion');
const Diagnostico = require('./Diagnostico');
const TrabajadorTurnos = require('./TrabajadorTurnos');
const Turnos = require('./Turnos');
const ResumenNomina = require('./ResumenNomina');
const DetalleTurnoNomina = require('./DetalleTurnoNomina');

Usuario.hasMany(TrabajadorTurnos, { foreignKey: "usuarioId" });
TrabajadorTurnos.belongsTo(Usuario, { foreignKey: "usuarioId" });

TrabajadorTurnos.hasMany(Turnos, { foreignKey: "trabajadorId", onDelete: "CASCADE", hooks: true });
Turnos.belongsTo(TrabajadorTurnos, { foreignKey: "trabajadorId" });

TrabajadorTurnos.hasMany(ResumenNomina, { foreignKey: "trabajadorId", onDelete: "CASCADE", hooks: true });
ResumenNomina.belongsTo(TrabajadorTurnos, { foreignKey: "trabajadorId" });

ResumenNomina.hasMany(DetalleTurnoNomina, { foreignKey: "resumenNominaId", onDelete: "CASCADE", hooks: true });
DetalleTurnoNomina.belongsTo(ResumenNomina, { foreignKey: "resumenNominaId" });

Turnos.hasMany(DetalleTurnoNomina, { foreignKey: "turnoId", onDelete: "CASCADE", hooks: true });
DetalleTurnoNomina.belongsTo(Turnos, { foreignKey: "turnoId" });

TrabajadorTurnos.hasMany(DetalleTurnoNomina, { foreignKey: "trabajadorId", onDelete: "CASCADE", hooks: true });
DetalleTurnoNomina.belongsTo(TrabajadorTurnos, { foreignKey: "trabajadorId" });





const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log("Conexión establecida con MySQL");

    await sequelize.sync({ alter: true });
    console.log("Tablas sincronizadas correctamente");
  } catch (error) {
    console.error(" Error al sincronizar con la base de datos:", error);
  }
};

module.exports = {
  Empleador,
  Diagnostico,
  Pregunta,
  Respuesta,
  intereses,
  Usuario,
  Constants,
  Categoria,
  Recomendacion,
  TrabajadorTurnos,
  Turnos,
  ResumenNomina,
  DetalleTurnoNomina,
  syncDatabase
};
