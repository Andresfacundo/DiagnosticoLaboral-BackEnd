const { DataTypes } = require("sequelize");
const sequelize = require("../../db");
const Empleador = require("./Empleador");

const Respuesta = sequelize.define("Respuesta", {
  fecha: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  respuestas: { type: DataTypes.JSON, allowNull: false },
});

Respuesta.belongsTo(Empleador, { foreignKey: "empleadorId" });

module.exports = Respuesta;
