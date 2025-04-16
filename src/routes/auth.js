const { Router } = require('express');
const { crearUsuario, login, logout } = require('../controllers/authController');
const { verificarAuth, esSuperAdmin } = require('../middlewares/authMiddleware');

const router = Router();

// Ruta pública para login
router.post('/login', login);
router.post('/logout', verificarAuth, logout);

// Ruta protegida para crear usuarios - solo superadmin
router.post('/usuarios', [verificarAuth, esSuperAdmin], crearUsuario);

module.exports = router;