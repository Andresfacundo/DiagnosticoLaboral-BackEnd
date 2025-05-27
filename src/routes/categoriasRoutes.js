const express = require('express');
const router = express.Router();
const { 
    crearCategoria, 
    listarCategorias, 
    crearRecomendacion, 
    listarRecomendacionesPorCategoria, 
    listarRecomendaciones, 
    editarRecomendacion, 
    eliminarRecomendacion, 
    editarCategoria, 
    eliminarCategoria 
} = require('../controllers/categoriaController');
const { verificarAuth, esAdmin } = require('../middlewares/authMiddleware');

router.post('/categorias', verificarAuth, esAdmin, crearCategoria);
router.get('/categorias', listarCategorias);
router.post('/:categoriaId/recomendaciones',  crearRecomendacion);
router.get('/:categoriaId/recomendaciones', listarRecomendacionesPorCategoria);
router.put('/categorias/:id', verificarAuth, esAdmin, editarCategoria);
router.delete('/categorias/:id', verificarAuth, esAdmin, eliminarCategoria);
router.get('/recomendaciones', listarRecomendaciones);
router.put('/recomendaciones/:id', verificarAuth, esAdmin, editarRecomendacion);
router.delete('/recomendaciones/:id', verificarAuth, esAdmin, eliminarRecomendacion);



module.exports = router;
