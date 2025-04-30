const sequelize = require("../../db");
const Empleador = require("./Empleador");
const Pregunta = require("./Pregunta");
const Respuesta = require("./Respuesta");
const Usuario = require('./Usuario');
const intereses = require('./interesesModels');
// const TokenBlacklist = require("./TokenBlackList");

// Aquí puedes establecer asociaciones si necesitas más relaciones

const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Conexión establecida con MySQL");

    await sequelize.sync({ alter: true }); // crea o actualiza tablas automáticamente
    console.log("✅ Tablas sincronizadas correctamente");
  } catch (error) {
    console.error("❌ Error al sincronizar con la base de datos:", error);
  }
};

module.exports = {
  Empleador,
  Pregunta,
  Respuesta,
  intereses,
  Usuario,
  // TokenBlacklist,
  syncDatabase
};
