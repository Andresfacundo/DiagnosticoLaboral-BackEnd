const procesarDatos = require("../utils/procesarDatos");
const Diagnostico = require("../models/Diagnostico");
const { Categoria } = require("../models"); // Importar el modelo de Categoria

async function procesarYGuardarDiagnostico(respuestas, preguntas) {
    // Obtener todas las categorías para el procesamiento
    const categorias = await Categoria.findAll();
    
    const resultado = procesarDatos(respuestas, preguntas, categorias);
    
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