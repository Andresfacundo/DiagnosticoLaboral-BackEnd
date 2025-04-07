const DataTypes = require('sequelize');
const sequelize = require('../../db');

const Empleador = sequelize.define('Empleador', {
    tipo: { type: DataTypes.STRING, allowNull: false },
    tipoDocumento: { type: DataTypes.STRING, allowNull: false },
    nombres: { type: DataTypes.STRING, allowNull: false },
    identificacion: { type: DataTypes.STRING, allowNull: false, unique: true },
    trabajadores: { type: DataTypes.INTEGER, allowNull: false },
    contratos: { type: DataTypes.JSON, allowNull: false },

},{
    timestamps: true,
});

module.exports = Empleador;