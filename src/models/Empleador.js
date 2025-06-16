const DataTypes = require('sequelize');
const sequelize = require('../../db');

const Empleador = sequelize.define('Empleador', {
    tipo: { type: DataTypes.STRING, allowNull: false },
    tipoDocumento: { type: DataTypes.STRING, allowNull: false },
    nombres: { type: DataTypes.STRING, allowNull: false },
    identificacion: { type: DataTypes.STRING, allowNull: false},
    trabajadores: { type: DataTypes.INTEGER, allowNull: false },
    nombreDiligenciador: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false},
    telefono: { type: DataTypes.STRING, allowNull: false },
},{
    timestamps: true,
});

module.exports = Empleador;