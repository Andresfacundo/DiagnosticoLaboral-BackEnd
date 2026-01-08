const { DataTypes } = require("sequelize");
const sequelize = require("../../db");

const DetalleTurnoNomina = sequelize.define("DetalleTurnoNomina", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  fecha: { type: DataTypes.DATEONLY, allowNull: false },
  horaInicio: { type: DataTypes.STRING, allowNull: false },
  horaFin: { type: DataTypes.STRING, allowNull: false },

  categoria: {
    type: DataTypes.ENUM(
      "extra_ordinaria",
      "extra_nocturna",
      "extra_ordinaria_dominical",
      "extra_nocturna_dominical",       
    ),
    allowNull: false
  },

  horas: { type: DataTypes.FLOAT, allowNull: false },
  valor: { type: DataTypes.FLOAT, allowNull: false }
});



module.exports = DetalleTurnoNomina;
