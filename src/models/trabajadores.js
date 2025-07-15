const { DataTypes } = require('sequelize');
const sequelize = require('../../db.js');
const Empleador = require('./Empleadores.js');

const Trabajadores = sequelize.define('Trabajadores', {
    nombre: { type: DataTypes.STRING, },
    apellidos: { type: DataTypes.STRING, },
    tipoDocumento: { type: DataTypes.STRING, },
    numeroDocumento: { type: DataTypes.INTEGER },
    tipoContrato: { type: DataTypes.STRING, },
    terminoContrato: { type: DataTypes.STRING },
    fechaContratacion: { type: DataTypes.DATEONLY, },
    fechaFinalizacionContrato: { type: DataTypes.DATEONLY },
    tipoSalario: { type: DataTypes.STRING },
    salarioMensual: { type: DataTypes.INTEGER },
    subsidioTransporte: { type: DataTypes.STRING },
    centroTrabajo: { type: DataTypes.STRING },
    permitirAccesoOnline: { type: DataTypes.STRING },
    correoElectronico: { type: DataTypes.STRING },
    diasVacacionesAcumulados: { type: DataTypes.FLOAT },
    banco: { type: DataTypes.STRING },
    tipoCuenta: { type: DataTypes.STRING },
    numeroCuenta: { type: DataTypes.STRING },
    fechaNacimiento: { type: DataTypes.DATEONLY },
    direccion: { type: DataTypes.STRING },
    celular: { type: DataTypes.STRING },
    sede: { type: DataTypes.STRING },
    area: { type: DataTypes.STRING },
    cargo: { type: DataTypes.STRING },
    centroCostos: { type: DataTypes.STRING },
    eps: { type: DataTypes.STRING },
    pensiones: { type: DataTypes.STRING },
    cesantias: { type: DataTypes.STRING },
    empleador: { type: DataTypes.STRING },
    genero: { type: DataTypes.STRING },
    clasificacionPersonal: { type: DataTypes.STRING },
    auxilioNoConstitutivoSalario: { type: DataTypes.STRING },
    montoAuxilioNoConstitutivoSalario: { type: DataTypes.INTEGER },
    deseaAfiliarBeneficiarios: { type: DataTypes.STRING },
    beneficiarios: { type: DataTypes.STRING },
    anexosEps: { type: DataTypes.STRING },
    deseaAfiliarBeneficiarios2: { type: DataTypes.STRING },
    beneficiarios2: { type: DataTypes.STRING },
    anexosCcf: { type: DataTypes.STRING },
    fechaRetiro: { type: DataTypes.DATEONLY },
    causalTerminacion: { type: DataTypes.STRING },
    motivoRetiro: { type: DataTypes.STRING },
    recomendado: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING },
    antiguedad: { type: DataTypes.FLOAT },
    edad: { type: DataTypes.INTEGER},
    contratoNo: { type: DataTypes.STRING }
}, {
    tableName: 'Trabajadores',
    timestamps: false
});

// Trabajadores.belongsTo(Empleador, {
//   foreignKey: 'empleadorId',
//   as: 'empleador'
// });

module.exports = Trabajadores;
