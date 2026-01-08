const { DataTypes } = require("sequelize");
const sequelize = require("../../db");

const Turno = sequelize.define("Turno", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  diaInicio: { type: DataTypes.DATEONLY, allowNull: false },
  diaFin: { type: DataTypes.DATEONLY, allowNull: false },
  horaInicio: { type: DataTypes.STRING, allowNull: false },
  horaFin: { type: DataTypes.STRING, allowNull: false },  
  minutosDescanso: { type: DataTypes.INTEGER, defaultValue: 0 },
  inicioDescanso: { type: DataTypes.STRING, allowNull: true },  
  tiempoTrabajado: { type: DataTypes.FLOAT, allowNull: false },
}, { tableName: "turnos" }); 


module.exports = Turno;
