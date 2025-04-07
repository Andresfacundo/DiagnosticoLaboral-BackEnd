const express = require("express");
const router = express.Router();
const { Respuesta, Empleador } = require("../models/Respuesta");

// Guardar respuestas de diagnóstico
router.post("/", async (req, res) => {
  try {
    const { empleadorId, respuestas } = req.body;

    const nueva = await Respuesta.create({
      empleadorId,
      respuestas
    });

    res.status(201).json(nueva);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Obtener todas las respuestas
router.get("/", async (req, res) => {
  const todas = await Respuesta.findAll({ include: Empleador });
  res.json(todas);
});

module.exports = router;
