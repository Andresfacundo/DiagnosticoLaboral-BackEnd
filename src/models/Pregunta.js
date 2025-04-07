const DataTypes = require('sequelize');
const sequelize = require('../../db');

const Pregunta = sequelize.define('Pregunta',{
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    texto:{
        type: DataTypes.STRING,
        allowNull: false },
    peso: {
        type: DataTypes.FLOAT,
        allowNull: false },
    categoria: { 
        type: DataTypes.STRING, 
        allowNull: false }

});
module.exports = Pregunta;