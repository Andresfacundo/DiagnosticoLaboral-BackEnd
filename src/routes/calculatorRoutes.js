const express = require('express');
const router = express.Router();
const calculatorController = require('../controllers/calculatorController.js');

router.post('/calcular', calculatorController.calculateSalary);

module.exports = router;