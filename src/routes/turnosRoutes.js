const express = require('express');
const router = express.Router();
const turnosController = require('../controllers/turnosController.js');

router.get('/', turnosController.obtenerTurnos);
router.post('/', turnosController.agregarTurno);
router.put('/:id', turnosController.actualizarTurno);
router.delete('/:id', turnosController.eliminarTurno);

module.exports = router;
