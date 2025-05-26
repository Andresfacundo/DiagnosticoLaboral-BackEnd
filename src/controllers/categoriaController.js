const { Categoria, Recomendacion } = require('../models');

// Crear una nueva categoría
const crearCategoria = async (req, res) => {
  try {
    const { nombre } = req.body;
    if (!nombre) return res.status(400).json({ error: 'El nombre es obligatorio' });
    const categoria = await Categoria.create({ nombre });
    res.status(201).json(categoria);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Listar todas las categorías
const listarCategorias = async (req, res) => {
  try {
    const categorias = await Categoria.findAll();
    res.json(categorias);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Crear una recomendación para una categoría
const crearRecomendacion = async (req, res) => {
  try {
    const { texto, categoriaId } = req.body;
    if (!texto || !categoriaId) return res.status(400).json({ error: 'Texto y categoriaId son obligatorios' });
    // Verificar que la categoría exista
    const categoria = await Categoria.findByPk(categoriaId);
    if (!categoria) return res.status(404).json({ error: 'Categoría no encontrada' });
    const recomendacion = await Recomendacion.create({ texto, categoriaId });
    res.status(201).json(recomendacion);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const listarRecomendaciones = async (req, res) => {
  try {
    const recomendaciones = await Recomendacion.findAll();
    res.json(recomendaciones);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Listar recomendaciones por categoría
const listarRecomendacionesPorCategoria = async (req, res) => {
  try {
    const { categoriaId } = req.params;
    const recomendaciones = await Recomendacion.findAll({ where: { categoriaId } });
    res.json(recomendaciones);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  crearCategoria,
  listarCategorias,
  crearRecomendacion,
  listarRecomendacionesPorCategoria,
  listarRecomendaciones
};
