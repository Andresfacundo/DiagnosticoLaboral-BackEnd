const express = require('express');
const router = express.Router();
const empleadosController = require('../controllers/empleadosController');

router.get('/', empleadosController.obtenerEmpleados);
router.post('/', empleadosController.agregarEmpleado);

module.exports = router;
