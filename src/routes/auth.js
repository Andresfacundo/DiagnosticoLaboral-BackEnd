const { Router } = require('express');
const { crearUsuario, login } = require('../controllers/authController');
const { verificarAuth, esSuperAdmin } = require('../middlewares/authMiddleware');

const router = Router();

// Ruta pública para login
router.post('/login', login);

// Ruta protegida para crear usuarios - solo superadmin
router.post('/usuarios', [verificarAuth, esSuperAdmin], crearUsuario);

module.exports = router;