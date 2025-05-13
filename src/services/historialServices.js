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

const eliminarDiagnosticoPorId = async (id) => {
    try {
        const diagnostico = await Diagnostico.findByPk(id);
        if (!diagnostico) return null;

        await diagnostico.destroy(); 

        return diagnostico;
    } catch (error) {
        console.error("Error al eliminar el diagnóstico por ID:", error);
        throw error;
    }
};


module.exports = {
    procesarYGuardarDiagnostico,
    obtenerDiagnosticoPorEmpleador,
    eliminarDiagnosticoPorId
};
