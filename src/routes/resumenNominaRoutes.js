const express = require("express");
const router = express.Router();
const ResumenNominaController = require("../controllers/resumenNominaController");
const { verificarAuth } = require('../middlewares/authMiddleware');



router.post("/generar", verificarAuth, ResumenNominaController.generarResumen);

router.get("/", verificarAuth, ResumenNominaController.listarResumenes);

module.exports = router;
