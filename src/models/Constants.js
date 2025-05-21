const { DataTypes } = require('sequelize');
const sequelize = require('../../db');

const Constants = sequelize.define('Constants', {
  salarioMinimo: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1423500
  },
  auxilioDeTransporte: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 200000
  },
  UVT: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 49799
  }
}, {
  timestamps: false
});

module.exports = Constants;
