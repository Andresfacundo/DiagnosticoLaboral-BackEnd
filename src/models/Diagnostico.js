const DataTypes = require('sequelize');
const sequelize = require('../../db');
const Empleador = require('./Empleador'); // Assuming Empleador is defined in the same directory

const Diagnostico = sequelize.define('Diagnostico',{
    resultado: { type: DataTypes.JSON, allowNull: false },
    creadoEn: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    empleadorId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: Empleador,
            key: 'id'
        }
    }
});

Diagnostico.belongsTo(Empleador,{ foreignKey: 'empleadorId'});
Empleador.hasMany(Diagnostico,{ foreignKey: 'empleadorId'});

module.exports = Diagnostico;
