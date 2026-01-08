const express = require("express");
const router = express.Router();
const trabajadorTurnosExcel = require("../controllers/trabajadorTurnosExcelController");

router.get("/plantilla",trabajadorTurnosExcel.descargarPlantilla);

module.exports = router;
