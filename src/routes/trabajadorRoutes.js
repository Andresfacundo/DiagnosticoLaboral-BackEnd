const express = require("express");
const router = express.Router();
const TrabajadorController = require("../controllers/trabajadorController");
const upload = require('../middlewares/uploads');
const { verificarAuth } = require('../middlewares/authMiddleware');

router.post("/", verificarAuth,TrabajadorController.crear);
router.post('/carga-masiva',verificarAuth, upload.single("file"), TrabajadorController.addEmpleadosMasivos);
router.get("/", verificarAuth, TrabajadorController.listar);
router.get("/:id", verificarAuth, TrabajadorController.listarById);
router.patch('/:id', verificarAuth, TrabajadorController.patchTrabajador);
router.delete('/:id', verificarAuth, TrabajadorController.eliminar);


module.exports = router;
