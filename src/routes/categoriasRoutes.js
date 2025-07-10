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
const { verificarAuth, esAdmin, permitirRoles } = require('../middlewares/authMiddleware');

router.post('/categorias', verificarAuth, esAdmin, crearCategoria);
router.get('/categorias', listarCategorias);
router.post('/:categoriaId/recomendaciones',  verificarAuth, permitirRoles('admin'), crearRecomendacion);
router.get('/:categoriaId/recomendaciones', listarRecomendacionesPorCategoria);
router.put('/categorias/:id', verificarAuth, permitirRoles('admin'), editarCategoria);
router.delete('/categorias/:id', verificarAuth, permitirRoles('admin'), eliminarCategoria);
router.get('/recomendaciones', listarRecomendaciones);
router.put('/recomendaciones/:id', verificarAuth, permitirRoles('admin'), editarRecomendacion);
router.delete('/recomendaciones/:id', verificarAuth, permitirRoles('admin'), eliminarRecomendacion);



module.exports = router;
