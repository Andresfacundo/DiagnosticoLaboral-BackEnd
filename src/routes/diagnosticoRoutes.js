const express = require("express");
const router = express.Router();
const {
    procesarDiagnostico,
    getDiagnosticos,
    getDiagnosticoById,    
    eliminarDiagnostico
} = require("../controllers/diagnosticoControllers");

router.post("/", procesarDiagnostico);
router.get("/", getDiagnosticos);
router.get("/:id", getDiagnosticoById);
router.delete("/:id", eliminarDiagnostico);

module.exports = router;
