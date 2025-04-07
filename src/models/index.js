const sequelize = require("../../db");
const Empleador = require("./Empleador");
const Pregunta = require("./Pregunta");
const Respuesta = require("./Respuesta");

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
  syncDatabase
};
