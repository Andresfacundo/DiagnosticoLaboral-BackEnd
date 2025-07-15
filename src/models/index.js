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
// const TokenBlacklist = require("./TokenBlackList");
const Trabajador = require('./Trabajadores'); 
const Empleadores = require('./Empleadores.js'); // Asegúrate de que la ruta sea correcta


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
  Diagnostico,
  Pregunta,
  Respuesta,
  intereses,
  Usuario,
  Constants,
  Categoria,
  Recomendacion,
  // TokenBlacklist,
  Trabajador,
  Empleadores,
  syncDatabase
};
