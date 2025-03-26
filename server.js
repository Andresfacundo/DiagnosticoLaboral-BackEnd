const express = require("express");
const cors = require("cors");
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Simulación de almacenamiento en memoria
let preguntas = [];
let respuestas = [];

// Obtener todas las preguntas
app.get("/preguntas", (req, res) => {
    res.json(preguntas);
});

// Agregar una nueva pregunta
app.post("/preguntas", (req, res) => {
    const { texto, peso } = req.body;
    const nuevaPregunta = { id: preguntas.length + 1, texto, peso };
    preguntas.push(nuevaPregunta);
    res.status(201).json(nuevaPregunta);
});

// Modificar una pregunta
app.put("/preguntas/:id", (req, res) => {
    const { id } = req.params;
    const { texto, peso } = req.body;
    const pregunta = preguntas.find(p => p.id == id);
    
    if (!pregunta) return res.status(404).json({ message: "Pregunta no encontrada" });
    
    pregunta.texto = texto;
    pregunta.peso = peso;
    res.json(pregunta);
});

// Eliminar una pregunta
app.delete("/preguntas/:id", (req, res) => {
    const { id } = req.params;
    preguntas = preguntas.filter(p => p.id != id);
    res.json({ message: "Pregunta eliminada" });
});

// Guardar respuestas
app.post("/respuestas", (req, res) => {
    const { empleadorId, respuestasUsuario } = req.body;
    respuestas.push({ empleadorId, respuestasUsuario });
    res.status(201).json({ message: "Respuestas guardadas" });
});

// Obtener respuestas por empleador
app.get("/respuestas/:empleadorId", (req, res) => {
    const { empleadorId } = req.params;
    const respuestasEmpleador = respuestas.find(r => r.empleadorId == empleadorId);
    res.json(respuestasEmpleador || { message: "No hay respuestas registradas" });
});

// Calcular diagnóstico
app.get("/diagnostico/:empleadorId", (req, res) => {
    const { empleadorId } = req.params;
    const respuestasEmpleador = respuestas.find(r => r.empleadorId == empleadorId);
    
    if (!respuestasEmpleador) return res.status(404).json({ message: "No hay respuestas para este empleador" });
    
    let totalPeso = 0;
    let totalPuntaje = 0;
    
    respuestasEmpleador.respuestasUsuario.forEach(r => {
        const pregunta = preguntas.find(p => p.id === r.preguntaId);
        if (pregunta) {
            totalPeso += pregunta.peso;
            totalPuntaje += (r.respuesta === "Sí" ? pregunta.peso : 0);
        }
    });
    
    const resultado = totalPeso > 0 ? (totalPuntaje / totalPeso) * 100 : 0;
    res.json({ empleadorId, resultado });
});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
