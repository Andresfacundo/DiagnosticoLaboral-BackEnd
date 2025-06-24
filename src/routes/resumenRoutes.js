const express = require('express');
const router = express.Router();

const resumenController = require('../controllers/resumenControllers');

// Ruta GET para obtener el resumen completo
router.post('/', resumenController.obtenerResumen);

module.exports = router;
