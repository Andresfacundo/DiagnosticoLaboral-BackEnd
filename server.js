const express = require("express");
const cors = require("cors");
const app = express();
const port = 3000;

const corsOptions = {
    origin: "http://localhost:5173", // Reemplaza con la URL de tu frontend
    methods: "GET, POST, PUT, DELETE",
    allowedHeaders: "Content-Type"
};

app.use(cors(corsOptions));
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
    if (!texto || !peso) return res.status(400).json({ message: "Texto y peso son obligatorios" });

    const nuevaPregunta = { id: preguntas.length + 1, texto, peso: Number(peso) }; // 👈 Convertir peso a número

    preguntas.push(nuevaPregunta);
    console.log(preguntas);
    res.status(201).json(nuevaPregunta);
});

// Modificar una pregunta
app.put("/preguntas/:id", (req, res) => {
    const { id } = req.params;
    const { texto, peso } = req.body;
    const pregunta = preguntas.find(p => p.id == id);
    
    if (!pregunta) return res.status(404).json({ message: "Pregunta no encontrada" });
    if (!texto || !peso) return res.status(400).json({ message: "Texto y peso son obligatorios" });

    pregunta.texto = texto;
    pregunta.peso = peso;
    res.json(pregunta);
});

// Eliminar una pregunta
app.delete("/preguntas/:id", (req, res) => {
    const { id } = req.params;
    const index = preguntas.findIndex(p => p.id == id);
    
    if (index === -1) return res.status(404).json({ message: "Pregunta no encontrada" });

    preguntas.splice(index, 1);
    res.json({ message: "Pregunta eliminada" });
});

// Guardar respuestas
app.post("/respuestas", (req, res) => {
    const { respuestasUsuario } = req.body;
    if (!respuestasUsuario || !Array.isArray(respuestasUsuario)) {
        return res.status(400).json({ message: "Respuestas inválidas" });
    }

    respuestas.push(respuestasUsuario);
    res.status(201).json({ message: "Respuestas guardadas" });
});

// Obtener todas las respuestas
app.get("/respuestas", (req, res) => {
    if (respuestas.length === 0) return res.json({ message: "No hay respuestas registradas" });
    res.json(respuestas);
});

// Calcular diagnóstico
app.get("/diagnostico", (req, res) => {
    if (respuestas.length === 0) return res.status(404).json({ message: "No hay respuestas registradas" });

    let totalPeso = 0;
    let totalPuntaje = 0;

    respuestas.forEach(respuesta => {
        respuesta.forEach(r => {
            const pregunta = preguntas.find(p => p.id === Number(r.preguntaId));
            if (pregunta) {
                totalPeso += Number(pregunta.peso);
                if (r.respuesta === "Si") {
                    totalPuntaje += Number(pregunta.peso); 
                }
            }
        });
    });

    console.log("Total Peso:", totalPeso); 
    console.log("Total Puntaje:", totalPuntaje);

    const resultado = parseInt(totalPeso > 0 ? (totalPuntaje / totalPeso) * 100 : 0);
    res.json({ resultado });
    
});


app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});