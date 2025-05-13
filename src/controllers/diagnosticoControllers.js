const {
    procesarYGuardarDiagnostico,
    obtenerDiagnosticoPorEmpleador,
    eliminarDiagnosticoPorId
} = require("../services/historialServices");

const procesarDiagnostico = async (req, res) => {
    try {
        const { respuestas, preguntas } = req.body;
        const resultado = await procesarYGuardarDiagnostico(respuestas, preguntas);
        res.status(201).json(resultado);
    } catch (error) {
        res.status(500).json({ message: "Error al procesar el diagnóstico", error });
    }
};

const getDiagnosticos = async (req, res) => {
    try {
        const diagnosticos = await obtenerDiagnosticoPorEmpleador();
        res.json(diagnosticos);
    } catch (error) {
        console.error("Error al obtener los diagnósticos:", error);
        res.status(500).json({ 
            message: "Error al obtener los diagnósticos", 
            error: error.message
        });
    }
};

const getDiagnosticoById = async (req, res) => {
    try {
        const { id } = req.params;
        const diagnostico = await obtenerDiagnosticoPorEmpleador(id);
        if (!diagnostico) {
            return res.status(404).json({ message: "Diagnóstico no encontrado" });
        }
        res.json(diagnostico);
    } catch (error) {
        console.error("Error al obtener el diagnóstico por ID:", error);
        res.status(500).json({ 
            message: "Error al obtener el diagnóstico", 
            error: error.message
        });
    }
};

const eliminarDiagnostico = async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await eliminarDiagnosticoPorId(id);
        if (!resultado) {
            return res.status(404).json({ message: "Diagnóstico no encontrado" });
        }
        res.json({ message: "Diagnóstico eliminado correctamente" });
    } catch (error) {
        console.error("Error al eliminar el diagnóstico:", error);
        res.status(500).json({ 
            message: "Error al eliminar el diagnóstico",             
            error: error.message
        });
    }
};

module.exports = {
    procesarDiagnostico,
    getDiagnosticos,
    getDiagnosticoById,
    eliminarDiagnostico
};

