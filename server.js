const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();

const port = process.env.URL || "https://diagnosticolaboral-backend.onrender.com";
const {syncDatabase} = require("./src/models/index.js");

const corsOptions = {
    origin: "https://diagnostico-laboral.vercel.app", // Reemplaza con la URL de tu frontend
    methods: "GET, POST, PUT, DELETE",
    allowedHeaders: "Content-Type"
};

app.use(cors(corsOptions));
app.use(express.json());

app.use('/api/empleadores', require('./src/routes/empleadores.js'));
app.use('/api/preguntas', require('./src/routes/preguntas.js'));
app.use('/api/respuestas', require('./src/routes/respuestas.js'));



syncDatabase(); // Sincroniza la base de datos al iniciar el servidor


// Simulación de almacenamiento en memoria
// let preguntas = [];
// let respuestas = [];
// let empleadores = []; // Nueva estructura para almacenar empleadores




// // ENDPOINTS PARA EMPLEADORES

// // Crear un nuevo empleador
// app.post("/empleadores", (req, res) => {
//     const { tipo, tipoDocumento, nombre, identificacion, trabajadores, contratos } = req.body;
    
//     // Validaciones en el servidor
//     const errores = {};
    
//     if (!tipo) errores.tipo = "Tipo de empleador es requerido";
//     if (!nombre || !nombre.trim()) errores.nombre = "Nombre es requerido";
//     if (!tipoDocumento) errores.tipoDocumento = "Tipo de documento es requerido";
//     if (!identificacion) errores.identificacion = "Identificación es requerida";
//     if (!trabajadores) errores.trabajadores = "Número de trabajadores es requerido";
//     if (!contratos || contratos.length === 0) errores.contratos = "Debe seleccionar al menos un tipo de contrato";

//     // Si hay errores, retornar respuesta de error
//     if (Object.keys(errores).length > 0) {
//         return res.status(400).json({ 
//             exito: false,
//             mensaje: "Datos inválidos",
//             errores
//         });
//     }

//     // Verificar si ya existe un empleador con la misma identificación
//     const empleadorExistente = empleadores.find(e => e.identificacion === identificacion);
//     if (empleadorExistente) {
//         return res.status(400).json({
//             exito: false,
//             mensaje: "Ya existe un empleador con esta identificación",
//             errores: { identificacion: "Identificación ya registrada" }
//         });
//     }

//     // Crear nuevo empleador
//     const nuevoEmpleador = {
//         id: empleadores.length + 1,
//         tipo,
//         tipoDocumento,
//         nombre,
//         identificacion,
//         trabajadores: parseInt(trabajadores),
//         contratos,
//         fechaCreacion: new Date()
//     };

//     empleadores.push(nuevoEmpleador);
//     console.log("Nuevo empleador registrado:", nuevoEmpleador);
    
//     res.status(201).json({
//         exito: true,
//         mensaje: "Información del empleador guardada correctamente",
//         empleador: nuevoEmpleador
//     });
// });

// // Obtener todos los empleadores
// app.get("/empleadores", (req, res) => {
//     res.json(empleadores);
// });

// // Obtener un empleador por ID
// app.get("/empleadores/:id", (req, res) => {
//     const { id } = req.params;
//     const empleador = empleadores.find(e => e.id == id);
    
//     if (!empleador) {
//         return res.status(404).json({
//             exito: false,
//             mensaje: "Empleador no encontrado"
//         });
//     }
    
//     res.json({
//         exito: true,
//         empleador
//     });
// });

// // Obtener un empleador por identificación
// app.get("/empleadores/identificacion/:identificacion", (req, res) => {
//     const { identificacion } = req.params;
//     const empleador = empleadores.find(e => e.identificacion === identificacion);
    
//     if (!empleador) {
//         return res.status(404).json({
//             exito: false,
//             mensaje: "Empleador no encontrado"
//         });
//     }
    
//     res.json({
//         exito: true,
//         empleador
//     });
// });

// // Actualizar un empleador
// app.put("/empleadores/:id", (req, res) => {
//     const { id } = req.params;
//     const { tipo, tipoDocumento, nombre, identificacion, trabajadores, contratos } = req.body;
    
//     const empleadorIndex = empleadores.findIndex(e => e.id == id);
    
//     if (empleadorIndex === -1) {
//         return res.status(404).json({
//             exito: false,
//             mensaje: "Empleador no encontrado"
//         });
//     }

//     // Validaciones
//     const errores = {};
    
//     if (!tipo) errores.tipo = "Tipo de empleador es requerido";
//     if (!nombre || !nombre.trim()) errores.nombre = "Nombre es requerido";
//     if (!tipoDocumento) errores.tipoDocumento = "Tipo de documento es requerido";
//     if (!identificacion) errores.identificacion = "Identificación es requerida";
//     if (!trabajadores) errores.trabajadores = "Número de trabajadores es requerido";
//     if (!contratos || contratos.length === 0) errores.contratos = "Debe seleccionar al menos un tipo de contrato";

//     // Si hay errores, retornar respuesta de error
//     if (Object.keys(errores).length > 0) {
//         return res.status(400).json({ 
//             exito: false,
//             mensaje: "Datos inválidos",
//             errores
//         });
//     }

//     // Verificar si la nueva identificación ya existe y no es la misma del empleador actual
//     const empleadorConMismaId = empleadores.find(e => 
//         e.identificacion === identificacion && e.id != id
//     );
    
//     if (empleadorConMismaId) {
//         return res.status(400).json({
//             exito: false,
//             mensaje: "Ya existe otro empleador con esta identificación",
//             errores: { identificacion: "Identificación ya registrada" }
//         });
//     }

//     // Actualizar empleador
//     const empleadorActualizado = {
//         ...empleadores[empleadorIndex],
//         tipo,
//         tipoDocumento,
//         nombre,
//         identificacion,
//         trabajadores: parseInt(trabajadores),
//         contratos,
//         fechaActualizacion: new Date()
//     };

//     empleadores[empleadorIndex] = empleadorActualizado;
//     console.log("Empleador actualizado:", empleadorActualizado);
    
//     res.json({
//         exito: true,
//         mensaje: "Información del empleador actualizada correctamente",
//         empleador: empleadorActualizado
//     });
// });

// // Eliminar un empleador
// app.delete("/empleadores/:id", (req, res) => {
//     const { id } = req.params;
//     const empleadorIndex = empleadores.findIndex(e => e.id == id);
    
//     if (empleadorIndex === -1) {
//         return res.status(404).json({
//             exito: false,
//             mensaje: "Empleador no encontrado"
//         });
//     }

//     empleadores.splice(empleadorIndex, 1);
    
//     res.json({
//         exito: true,
//         mensaje: "Empleador eliminado correctamente"
//     });
// });



// // Obtener todas las preguntas
// app.get("/preguntas", (req, res) => {
//     res.json(preguntas);
// });

// // Agregar una nueva pregunta
// app.post("/preguntas", (req, res) => {
//     const { texto, peso, categoria, respuestas: respuestasPersonalizadas } = req.body;
//     if (!texto || peso === undefined || !categoria) {
//         return res.status(400).json({ message: "Texto, peso y categoría son obligatorios" });
//     }
//     if (isNaN(peso) || peso < 0 || peso > 3) {
//         return res.status(400).json({ message: "El peso debe estar entre 0 y 3" });
//     }

//     const nuevaPregunta = { 
//         id: preguntas.length + 1, 
//         texto, 
//         peso: Number(peso), 
//         categoria
//     };

//     // Si se proporcionan respuestas personalizadas, añadirlas a la pregunta
//     if (respuestasPersonalizadas) {
//         nuevaPregunta.respuestas = respuestasPersonalizadas;
//     }

//     preguntas.push(nuevaPregunta);
//     res.status(201).json(nuevaPregunta);
// });

// // Modificar una pregunta
// app.put("/preguntas/:id", (req, res) => {
//     const { id } = req.params;
//     const { texto, peso, categoria, respuestas: respuestasPersonalizadas } = req.body;
//     const pregunta = preguntas.find(p => p.id == id);
    
//     if (!pregunta) return res.status(404).json({ message: "Pregunta no encontrada" });
//     if (!texto || peso === undefined || !categoria) return res.status(400).json({ message: "Texto, peso y categoría son obligatorios" });
//     if (isNaN(peso) || peso < 0 || peso > 3) return res.status(400).json({ message: "El peso debe estar entre 0 y 3" });

//     pregunta.texto = texto;
//     pregunta.peso = Number(peso);
//     pregunta.categoria = categoria;
    
//     // Si se proporcionan respuestas personalizadas, actualizarlas
//     if (respuestasPersonalizadas) {
//         pregunta.respuestas = respuestasPersonalizadas;
//     }
    
//     console.log("Pregunta actualizada:", pregunta);
//     res.json(pregunta);
// });

// // Eliminar una pregunta
// app.delete("/preguntas/:id", (req, res) => {
//     const { id } = req.params;
//     const index = preguntas.findIndex(p => p.id == id);
    
//     if (index === -1) return res.status(404).json({ message: "Pregunta no encontrada" });

//     preguntas.splice(index, 1);
//     res.json({ message: "Pregunta eliminada" });
// });

// // Guardar respuestas
// app.post("/respuestas", (req, res) => {
//     const { respuestasUsuario, empleadorId } = req.body;
//     if (!respuestasUsuario || !Array.isArray(respuestasUsuario)) {
//         return res.status(400).json({ message: "Respuestas inválidas" });
//     }

//     // Opcionalmente, vincular las respuestas a un empleador
//     const respuestaConMetadata = {
//         id: respuestas.length + 1,
//         fecha: new Date(),
//         empleadorId: empleadorId, // Puede ser undefined si no se proporciona
//         respuestas: respuestasUsuario
//     };

//     respuestas.push(respuestaConMetadata);
//     res.status(201).json({ 
//         message: "Respuestas guardadas",
//         respuestaId: respuestaConMetadata.id
//     });
// });


// // Obtener todas las respuestas
// app.get("/respuestas", (req, res) => {
//     if (respuestas.length === 0) return res.json({ message: "No hay respuestas registradas" });
//     res.json(respuestas);
// });

// // Obtener respuestas por empleador
// // app.get("/respuestas/empleador/:empleadorId", (req, res) => {
// //     const { empleadorId } = req.params;
// //     const respuestasEmpleador = respuestas.filter(r => r.empleadorId == empleadorId);
    
// //     // if (respuestasEmpleador.length === 0) {
// //     //     return res.status(404).json({ 
// //     //         message: "No hay respuestas registradas para este empleador" 
// //     //     });
// //     // }
    
// //     res.json(respuestasEmpleador);
// // });

// app.get("/respuestas/diagnostico/:empleadorId", async (req, res) => {
//     const { empleadorId } = req.params;
    
//     try {
//         // Obtener las respuestas del empleador
//         const respuestasEmpleador = respuestas
//             .filter(r => r.empleadorId == empleadorId);
        
//         if (respuestasEmpleador.length === 0) {
//             return res.json({ 
//                 empleadorId,
//                 respuestas: [],
//                 resultado: 0,
//                 mensaje: "No hay respuestas registradas para este empleador" 
//             });
//         }

//         let totalPeso = 0;
//         let totalPuntaje = 0;

//         // Procesar cada conjunto de respuestas
//         respuestasEmpleador.forEach(respuesta => {
//             // Ajuste para manejar diferentes formatos de respuestas
//             const respuestasArray = Array.isArray(respuesta.respuestas) 
//                 ? respuesta.respuestas 
//                 : [respuesta];
            
//             respuestasArray.forEach(r => {
//                 const preguntaId = r.preguntaId || r.id;
//                 const pregunta = preguntas.find(p => p.id === Number(preguntaId));
                
//                 if (pregunta) {
//                     totalPeso += Number(pregunta.peso);
                    
//                     // Si la pregunta tiene respuestas personalizadas, usar ese valor
//                     if (pregunta.respuestas && pregunta.respuestas[r.respuesta] !== undefined) {
//                         totalPuntaje += Number(pregunta.respuestas[r.respuesta]);
//                     } else {
//                         // Si no, usar la lógica original
//                         if (r.respuesta === "Si" || r.respuesta === "Sí") {
//                             totalPuntaje += Number(pregunta.peso);
//                         } else if (r.respuesta === "Si parcialmente" || r.respuesta === "Sí parcialmente") {
//                             totalPuntaje += Number(pregunta.peso) / 2;
//                         }
//                         // Para "No" y "N/A" se suma 0
//                     }
//                 }
//             });
//         });

//         const resultado = totalPeso > 0 ? Math.round((totalPuntaje / totalPeso) * 100) : 0;
        
//         // Devolver respuestas y resultado calculado
//         res.json({
//             empleadorId,
//             respuestas: respuestasEmpleador,
//             resultado,
//             totalPeso,
//             totalPuntaje
//         });
//     } catch (error) {
//         console.error("Error al calcular diagnóstico:", error);
//         res.status(500).json({ 
//             mensaje: "Error al calcular diagnóstico", 
//             error: error.message 
//         });
//     }
// });


// // Calcular diagnóstico
// app.get("/diagnostico", (req, res) => {
//     if (respuestas.length === 0) return res.status(404).json({ message: "No hay respuestas registradas" });

//     let totalPeso = 0;
//     let totalPuntaje = 0;

//     respuestas.forEach(respuesta => {
//         // Ajuste para manejar el nuevo formato de respuestas
//         const respuestasArray = respuesta.respuestas || respuesta;
        
//         respuestasArray.forEach(r => {
//             const pregunta = preguntas.find(p => p.id === Number(r.preguntaId));
//             if (pregunta) {
//                 totalPeso += Number(pregunta.peso);
                
//                 // Si la pregunta tiene respuestas personalizadas, usar ese valor
//                 if (pregunta.respuestas && pregunta.respuestas[r.respuesta] !== undefined) {
//                     totalPuntaje += Number(pregunta.respuestas[r.respuesta]);
//                 } else {
//                     // Si no, usar la lógica original
//                     if (r.respuesta === "Si") {
//                         totalPuntaje += Number(pregunta.peso);
//                     } else if (r.respuesta === "Si parcialmente") {
//                         totalPuntaje += Number(pregunta.peso) / 2;
//                     }
//                     // Para "No" y "N/A" se suma 0
//                 }
//             }
//         });
//     });

//     console.log("Total Peso:", totalPeso); 
//     console.log("Total Puntaje:", totalPuntaje);

//     const resultado = parseInt(totalPeso > 0 ? (totalPuntaje / totalPeso) * 100 : 0);
//     res.json({ resultado });
// });

// // Calcular diagnóstico para un empleador específico
// app.get("/diagnostico/empleador/:empleadorId", (req, res) => {
//     const { empleadorId } = req.params;
//     const respuestasEmpleador = respuestas
//         .filter(r => r.empleadorId == empleadorId)
//         .map(r => r.respuestas || r);
    
//     if (respuestasEmpleador.length === 0) {
//         return res.status(404).json({ 
//             message: "No hay respuestas registradas para este empleador" 
//         });
//     }

//     let totalPeso = 0;
//     let totalPuntaje = 0;

//     respuestasEmpleador.forEach(respuesta => {
//         respuesta.forEach(r => {
//             const pregunta = preguntas.find(p => p.id === Number(r.preguntaId));
//             if (pregunta) {
//                 totalPeso += Number(pregunta.peso);
                
//                 if (pregunta.respuestas && pregunta.respuestas[r.respuesta] !== undefined) {
//                     totalPuntaje += Number(pregunta.respuestas[r.respuesta]);
//                 } else {
//                     if (r.respuesta === "Si") {
//                         totalPuntaje += Number(pregunta.peso);
//                     } else if (r.respuesta === "Si parcialmente") {
//                         totalPuntaje += Number(pregunta.peso) / 2;
//                     }
//                 }
//             }
//         });
//     });

//     const resultado = parseInt(totalPeso > 0 ? (totalPuntaje / totalPeso) * 100 : 0);
    
//     res.json({
//         empleadorId,
//         resultado
//     });
// });

app.listen(port, () => {
    console.log(`Servidor corriendo en:${port}`);
});