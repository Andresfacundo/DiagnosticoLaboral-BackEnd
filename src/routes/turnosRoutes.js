const express = require("express");
const router = express.Router();
const TurnoController = require("../controllers/turnosController");
const { verificarAuth } = require('../middlewares/authMiddleware');

router.post("/:trabajadorId", verificarAuth, TurnoController.crear);
router.get("/", verificarAuth, TurnoController.listar);
router.get("/:id", verificarAuth, TurnoController.listarById);
router.patch('/:id', verificarAuth, TurnoController.actualizar);
router.delete('/:id', verificarAuth, TurnoController.delete);

module.exports = router;
