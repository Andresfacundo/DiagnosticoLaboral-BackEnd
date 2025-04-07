const express = require("express");
const router = express.Router();
const Respuesta = require("../models/Respuesta");
const Empleador = require("../models/Empleador");


// Guardar respuestas de diagnóstico
router.post("/:empleadorId", async (req, res) => {
  try {
    const { respuestas } = req.body;
    const { empleadorId } = req.params;

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
  const todas = await Respuesta.findAll();
  res.json(todas);
});

router.get("/:id" , async (req, res) =>{
  try {
    const { id } = req.params;
    const respuesta = await Respuesta.findByPk(id);
    res.json(respuesta);
    if (!respuesta) {
      return res.status(404).json({ error: "Respuesta no encontrada" });
    }
  }catch (error) {
    res.status(500).json({ error: error.message });
  }
})

module.exports = router;
