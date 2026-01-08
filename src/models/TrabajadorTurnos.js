const { DataTypes } = require("sequelize");
const sequelize = require("../../db");

const Trabajador = sequelize.define("Trabajador", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nombre: { type: DataTypes.STRING, allowNull: false },
  apellido: { type: DataTypes.STRING, allowNull: false },
  cc: { type: DataTypes.STRING, allowNull: false },
  area: { type: DataTypes.STRING, allowNull: true },
  salarioBase: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
  clasificacionPersonal: { type: DataTypes.STRING, allowNull: true },
  color: { type: DataTypes.STRING, allowNull: true },


}, { tableName: "trabajadores" }); 

module.exports = Trabajador;