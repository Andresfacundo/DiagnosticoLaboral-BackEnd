const { DataTypes } = require("sequelize");
const sequelize = require("../../db");

const ResumenNomina = sequelize.define("ResumenNomina", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  

  salarioBase: { type: DataTypes.FLOAT, defaultValue: 0 },
  salarioHora: { type: DataTypes.FLOAT, defaultValue: 0 },
  totalHoras: { type: DataTypes.FLOAT, defaultValue: 0 },

  // Horas Extras
  horasExtraOrdinaria: { type: DataTypes.FLOAT, defaultValue: 0 },
  valorExtraOrdinaria: { type: DataTypes.FLOAT, defaultValue: 0 },

  horasExtraNocturna: { type: DataTypes.FLOAT, defaultValue: 0 },
  valorExtraNocturna: { type: DataTypes.FLOAT, defaultValue: 0 },

  horasExtraOrdinariaDominical: { type: DataTypes.FLOAT, defaultValue: 0 },
  valorExtraOrdinariaDominical: { type: DataTypes.FLOAT, defaultValue: 0 },

  horasExtraNocturnaDominical: { type: DataTypes.FLOAT, defaultValue: 0 },
  valorExtraNocturnaDominical: { type: DataTypes.FLOAT, defaultValue: 0 },

  // Recargos
  horasRecargoNocturno: { type: DataTypes.FLOAT, defaultValue: 0 },
  valorRecargoNocturno: { type: DataTypes.FLOAT, defaultValue: 0 },

  horasRecargoDominical: { type: DataTypes.FLOAT, defaultValue: 0 },
  valorRecargoDominical: { type: DataTypes.FLOAT, defaultValue: 0 },

  horasRecargoNocturnoDominical: { type: DataTypes.FLOAT, defaultValue: 0 },
  valorRecargoNocturnoDominical: { type: DataTypes.FLOAT, defaultValue: 0 },

  // Totales
  netoAPagar: { type: DataTypes.FLOAT, defaultValue: 0 },
  costoTotal: { type: DataTypes.FLOAT, defaultValue: 0 }
}, { tableName: "resumen_nomina" });


module.exports = ResumenNomina;
