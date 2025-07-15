const Trabajadores = require('../models/Trabajadores.js');

const { parseFechaExcel, calcularEdad, calcularAntiguedad } = require('../utils/fechasUtils.js');

const procesarFilaTrabajador = async (row) => {
    const fechaNacimiento = parseFechaExcel(row['Fecha Nacimento (dd/mm/yyyy)']);
    const fechaContratacion = parseFechaExcel(row['Fecha de Contratación (dd/mm/yyyy)*']);
    const fechaRetiro = parseFechaExcel(row['Fecha de retiro']);
    const status = row['Status'];

    const edad = calcularEdad(fechaNacimiento);
    const antiguedad = calcularAntiguedad(fechaContratacion, fechaRetiro, status);

    return await Trabajadores.create({
        nombre: row['Nombre*'],
        apellidos: row['Apellidos*'],
        tipoDocumento: row['Tipo de documento*'],
        numeroDocumento: row['Número documento*'],
        tipoContrato: row['Tipo de Contrato*'],
        terminoContrato: row['Término del Contrato*'],
        fechaContratacion,
        fechaFinalizacionContrato: parseFechaExcel(row['Fecha finalización contrato (dd/mm/yyyy)']),
        tipoSalario: row['Tipo Salario*'],
        salarioMensual: row['Salario/Honorarios mensuales*'],
        subsidioTransporte: row['Subsidio de Transporte (SI/NO)*'],
        centroTrabajo: row['Centro de trabajo (Nivel de Riesgo)*'],
        permitirAccesoOnline: row['¿Permitir acceso online?'],
        correoElectronico: row['Correo electrónico'],
        diasVacacionesAcumulados: row['¿Días de vacaciones acumulados?'],
        banco: row['Banco'],
        tipoCuenta: row['Tipo de Cuenta'],
        numeroCuenta: row['Número de cuenta'],
        fechaNacimiento,
        direccion: row['Dirección'],
        celular: row['Celular'],
        sede: row['Sede'],
        area: row['Area'],
        cargo: row['Cargo'],
        centroCostos: row['Centro de Costos'],
        eps: row['EPS'],
        pensiones: row['Pensiones'],
        cesantias: row['Cesantias'],
        empleador: row['Empleador'],
        genero: row['Género'],
        clasificacionPersonal: row['Clasificación personal'],
        auxilioNoConstitutivoSalario: row['Auxilio no contitutivo de salario'],
        montoAuxilioNoConstitutivoSalario: row['Monto auxilio no constitutivo de salario'],
        deseaAfiliarBeneficiarios: row['Desea afiliar a beneficiarios Si/no'],
        beneficiarios: row['Padres,  conyuge o compañero permanente y hijos'],
        anexosEps: row['Anexos EPS:'],
        deseaAfiliarBeneficiarios2: row['Desea afiliar a beneficiarios si/no'],
        beneficiarios2: row['Padres,  conyuge o compañero permanente y hijos2'],
        anexosCcf: row['Anexos CCF:'],
        fechaRetiro,
        causalTerminacion: row['Causal de terminación'],
        motivoRetiro: row['Motivo de retiro'],
        recomendado: row['Recomendado'],
        status,
        antiguedad,
        edad,
        contratoNo: row['Contrato No.']
    });
};

module.exports = {
    procesarFilaTrabajador
};
