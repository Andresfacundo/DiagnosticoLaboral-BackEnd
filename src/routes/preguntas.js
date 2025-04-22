const express = require('express');
const router = express.Router();
const Pregunta = require('../models/Pregunta');
const { verificarAuth, esAdmin, esSuperAdmin } = require('../middlewares/authMiddleware');

//crear pregunta

router.post('/', verificarAuth, esAdmin, esSuperAdmin, async (req, res) => {
    try {
        // Extraer datos de la solicitud
        const { texto, peso, categoria } = req.body;

        // Calcular los valores de respuesta automáticamente
        const respuestas = {
            "Si": parseFloat(peso),
            "Parcialmente": parseFloat(peso) / 2,
            "No": 0,
            "No aplica": 0
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
router.get('/', async (req, res) => {
    try {
        const todos = await Pregunta.findAll();
        res.json(todos);
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
});
router.get('/categoria/:categoria', verificarAuth,esAdmin,esSuperAdmin, async (req, res) => {
    try {
        const { categoria } = req.params;
        const preguntas = await Pregunta.findAll({
            where: {  categoria }
        });
        res.json(preguntas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// editar una pregunta
router.put('/:id', verificarAuth,esAdmin,esSuperAdmin, async (req, res) => {
    try {
        const pregunta = await Pregunta.findByPk(req.params.id);
        if (!pregunta) return res.status(404).json({ error: 'Pregunta no encontrada' });
        await pregunta.update(req.body);
        res.json(pregunta);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// eliminar una pregunta
router.delete('/:id', verificarAuth,esAdmin,esSuperAdmin, async (req, res) => {
    try {
        const pregunta = await Pregunta.findByPk(req.params.id);
        if (!pregunta) return res.status(404).json({ error: 'Pregunta no encontrada' });

        await pregunta.destroy();
        res.json({ message: 'Pregunta eliminada' });
    } catch (error) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;