const { DataTypes } = require('sequelize');
const sequelize = require('../../db');

const Constants = sequelize.define('Constants', {
  salarioMinimo: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1750905
  },
  auxilioDeTransporte: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 249095
  },
  UVT: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 52374
  }
}, {
  timestamps: false
});

module.exports = Constants;
