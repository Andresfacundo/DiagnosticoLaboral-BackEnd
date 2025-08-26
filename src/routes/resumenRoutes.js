const express = require('express');
const router = express.Router();

const resumenController = require('../controllers/resumenControllers');


router.post('/', resumenController.obtenerResumen);

module.exports = router;
