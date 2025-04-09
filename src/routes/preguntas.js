const express = require('express');
const router = express.Router();
const  Pregunta  = require('../models/Pregunta');

//crear pregunta

router.post('/', async (req, res) => {
    try {
        // Extraer datos de la solicitud
        const { texto, peso, categoria } = req.body;
        
        // Calcular los valores de respuesta automáticamente
        const respuestas = {
            "Si": parseFloat(peso),
            "Si parcialmente": parseFloat(peso) / 2,
            "No": 0,
            "N/A": 0
        };
        
        // Crear la nueva pregunta con los valores calculados
        const nueva = await Pregunta.create({
            texto,
            peso,
            categoria,
            respuestas
        });
        
        res.status(201).json(nueva);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

//listar todas las preguntas
router.get('/', async (req , res) =>{
    try{
        const todos = await Pregunta.findAll();
        res.json(todos);
    }catch(error){
        res.status(500).json({error: error.message})
    }
})

// editar una pregunta
router.put('/:id', async (req, res) => {
    try {
        const pregunta = await Pregunta.findByPk(req.params.id);
        if(!pregunta) return res.status(404).json({ error: 'Pregunta no encontrada' });
        await pregunta.update(req.body);
        res.json(pregunta);
    }catch(error){
        res.status(400).json({ error: err.message });
    }
});

// eliminar una pregunta
router.delete('/:id', async (req, res) => {
    try {
        const pregunta = await Pregunta.findByPk(req.params.id);
        if(!pregunta) return res.status(404).json({ error: 'Pregunta no encontrada' });
        
        await pregunta.destroy();
        res.json({ message: 'Pregunta eliminada' });
    }catch(error){
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;