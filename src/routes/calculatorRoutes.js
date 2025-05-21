const express = require('express');
const router = express.Router();
const calculatorController = require('../controllers/calculatorController.js');

router.post('/calcular', calculatorController.calculateSalary);

router.get('/constants',calculatorController.getConstants);

router.patch('/constants', calculatorController.updateConstants);

module.exports = router;