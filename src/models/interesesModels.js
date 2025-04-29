const {DataTypes} = require('sequelize');
const sequelize = require('../../db');

const intereses = sequelize.define('interese',{
    nombre : {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

module.exports = intereses;