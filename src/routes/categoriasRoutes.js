const express = require('express');
const router = express.Router();
const { crearCategoria, listarCategorias, crearRecomendacion, listarRecomendacionesPorCategoria, listarRecomendaciones } = require('../controllers/categoriaController');
const { verificarAuth, esAdmin } = require('../middlewares/authMiddleware');

// Crear categoría (solo admin)
router.post('/categorias', verificarAuth, esAdmin, crearCategoria);
// Listar categorías
router.get('/categorias', listarCategorias);
// Crear recomendación para una categoría (solo admin)
router.post('/:categoriaId/recomendaciones', verificarAuth, esAdmin, crearRecomendacion);
// Listar recomendaciones de una categoría
router.get('/:categoriaId/recomendaciones', listarRecomendacionesPorCategoria);

router.get('/recomendaciones', listarRecomendaciones)

module.exports = router;
