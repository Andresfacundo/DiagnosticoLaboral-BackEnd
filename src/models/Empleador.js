const DataTypes = require('sequelize');
const sequelize = require('../../db');

const Empleador = sequelize.define('Empleador', {
    tipo: { type: DataTypes.STRING, allowNull: true },
    tipoDocumento: { type: DataTypes.STRING, allowNull: true },
    nombres: { type: DataTypes.STRING, allowNull: true },
    identificacion: { type: DataTypes.STRING, allowNull: true},
    trabajadores: { type: DataTypes.INTEGER, allowNull: true },
    nombreDiligenciador: { type: DataTypes.STRING, allowNull: true },
    email: { type: DataTypes.STRING, allowNull: true},
    telefono: { type: DataTypes.STRING, allowNull: true },
},{
    timestamps: true,
});

module.exports = Empleador;