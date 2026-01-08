const express = require("express");
const DetalleTurnoNominaController = require("../controllers/detalleTurnoNominaController");
const { verificarAuth } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", verificarAuth, DetalleTurnoNominaController.listarTodos);

module.exports = router;
