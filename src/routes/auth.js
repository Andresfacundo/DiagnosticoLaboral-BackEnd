const { Router } = require('express');
const { crearUsuario, login, logout } = require('../controllers/authController');
const { verificarAuth, esAdmin } = require('../middlewares/authMiddleware');

const router = Router();

// Ruta pública para login
router.post('/login', login);
router.post('/logout', verificarAuth, logout);

// Ruta protegida para crear usuarios - solo admin
router.post('/usuarios', [verificarAuth, esAdmin], crearUsuario);

module.exports = router;