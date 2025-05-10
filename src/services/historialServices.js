const procesarDatos = require("../utils/procesarDatos");
const Diagnostico = require("../models/Diagnostico");

async function procesarYGuardarDiagnostico(respuestas, preguntas) {
    const resultado = procesarDatos(respuestas, preguntas);
    
    await Diagnostico.create({
        resultado,
        creadoEn: new Date()
    });

    return resultado;
}

async function obtenerDiagnosticoPorEmpleador(id = null) {
    if (id) {
        return await Diagnostico.findOne({ where: { id } });
    }
    return await Diagnostico.findAll({ 
        order: [['creadoEn', 'DESC']],
    });
}

module.exports = {
    procesarYGuardarDiagnostico,
    obtenerDiagnosticoPorEmpleador
};
