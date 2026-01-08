const { Router } = require('express');
const { crearUsuario, login, logout, listarPendientes, perfil, aprobarUsuario, rechazarUsuario } = require('../controllers/authController');
const { verificarAuth, esAdmin } = require('../middlewares/authMiddleware');


const router = Router();

// Ruta pública para login
router.post('/login', login);
router.post('/usuarios', crearUsuario);
router.post('/logout', verificarAuth, logout);

//rutas par admin
router.get('/usuarios/pendientes', [verificarAuth, esAdmin], listarPendientes);
router.patch('/usuarios/:id/aprobar', [verificarAuth, esAdmin], aprobarUsuario);
router.delete('/usuarios/:id', [verificarAuth, esAdmin], rechazarUsuario);

module.exports = router;