const express = require('express');
const router = express.Router();
const calculatorController = require('../controllers/calculatorController.js');
const { verificarAuth, permitirRoles, esAdmin } = require('../middlewares/authMiddleware.js');

router.post('/calcular', calculatorController.calculateSalary);

router.get('/constants', verificarAuth, permitirRoles('admin','asociado'),calculatorController.getConstants);

router.patch('/constants', verificarAuth, permitirRoles('admin'),calculatorController.updateConstants);

module.exports = router;
