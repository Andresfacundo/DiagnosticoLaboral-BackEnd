// const { DataTypes } = require('sequelize');
// const sequelize = require('../../db');
// const Trabajador = require('./Trabajadores.js'); // Import Trabajador model

// const Empleador = sequelize.define('empleadores', {
//     nombre: {
//         type: DataTypes.STRING,
//         allowNull: false,

//     },
//     tipoDocumento: {
//         type: DataTypes.STRING,
//         allowNull: false
//     },
//     numeroDocumento: {
//         type: DataTypes.STRING,
//         allowNull: false,
//     },
//     representante: {
//         type: DataTypes.STRING
//     },
//     tipoDocumentoRepresentante: {
//         type: DataTypes.STRING
//     },
//     identificacionRepresentante: {
//         type: DataTypes.STRING
//     },
//     telefono: {
//         type: DataTypes.STRING
//     },
//     correoElectronico: {
//         type: DataTypes.STRING
//     },
//     direccion: {
//         type: DataTypes.STRING
//     },
//     ciudad: {
//         type: DataTypes.STRING
//     },
//     periodicidadPago: {
//         type: DataTypes.STRING
//     },
//     // firma: {
//     //     type: DataTypes.STRING
//     // }
// }, {
//     timestamps: true
// });

// Empleador.hasMany(Trabajador, {
//   foreignKey: 'empleadorId',
//   as: 'trabajadores'
// });

// module.exports = Empleador;
