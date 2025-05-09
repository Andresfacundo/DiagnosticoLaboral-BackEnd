const express = require("express");
const router = express.Router();
const {
    procesarDiagnostico,
    getDiagnosticos,
    getDiagnosticoById
} = require("../controllers/diagnosticoControllers");

router.post("/", procesarDiagnostico);
router.get("/", getDiagnosticos);
router.get("/:id", getDiagnosticoById);

module.exports = router;
