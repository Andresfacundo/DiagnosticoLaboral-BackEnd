const express = require("express");
const router = express.Router();
const {
    procesarDiagnostico,
    getDiagnosticos,
    getDiagnosticoById,    
    eliminarDiagnostico
} = require("../controllers/diagnosticoControllers");
const { verificarAuth, esAdmin } = require("../middlewares/authMiddleware");

router.post("/:empleadorId", procesarDiagnostico);
router.get("/", getDiagnosticos);
router.get("/:id", getDiagnosticoById);
router.delete("/:id", verificarAuth, esAdmin, eliminarDiagnostico);

module.exports = router;
