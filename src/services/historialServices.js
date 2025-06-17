const procesarDatos = require("../utils/procesarDatos");
const Diagnostico = require("../models/Diagnostico");
const { Categoria } = require("../models"); 
const Empleador = require("../models/Empleador");

async function procesarYGuardarDiagnostico(respuestas, preguntas, empleadorId) {
    // Obtener todas las categorías para el procesamiento
    const categorias = await Categoria.findAll();
    
    const resultado = procesarDatos(respuestas, preguntas, categorias);
    
    await Diagnostico.create({
        resultado,
        creadoEn: new Date(),
        empleadorId
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

        const empleadorId = diagnostico.empleadorId;


        await diagnostico.destroy();

        const empleador = await Empleador.findByPk(empleadorId);
        if (empleador) {
            await empleador.destroy();
        }

        return { diagnosticoEliminado: diagnostico, empleadorEliminado: empleador };
    } catch (error) {
        console.error("Error al eliminar el diagnóstico y el empleador:", error);
        throw error;
    }
};

module.exports = {
    procesarYGuardarDiagnostico,
    obtenerDiagnosticoPorEmpleador,
    eliminarDiagnosticoPorId
};