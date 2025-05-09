const DataTypes = require('sequelize');
const sequelize = require('../../db');

const Diagnostico = sequelize.define('Diagnostico',{
    resultado: { type: DataTypes.JSON, allowNull: false },
    creadoEn: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

module.exports = Diagnostico;
