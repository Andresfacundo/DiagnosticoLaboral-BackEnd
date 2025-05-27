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

// Editar una categoría
const editarCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;
    const categoria = await Categoria.findByPk(id);
    if (!categoria) return res.status(404).json({ error: 'Categoría no encontrada' });
    categoria.nombre = nombre || categoria.nombre;
    await categoria.save();
    res.json(categoria);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Eliminar una categoría
const eliminarCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const categoria = await Categoria.findByPk(id);
    if (!categoria) return res.status(404).json({ error: 'Categoría no encontrada' });
    await categoria.destroy();
    res.json({ mensaje: 'Categoría eliminada correctamente' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Crear una recomendación para una categoría
const crearRecomendacion = async (req, res) => {
  try {
    const { texto } = req.body;
    const { categoriaId } = req.params;
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

// Editar una recomendación
const editarRecomendacion = async (req, res) => {
  try {
    const { id } = req.params;
    const { texto, categoriaId } = req.body;
    const recomendacion = await Recomendacion.findByPk(id);
    if (!recomendacion) return res.status(404).json({ error: 'Recomendación no encontrada' });
    if (categoriaId) {
      const categoria = await Categoria.findByPk(categoriaId);
      if (!categoria) return res.status(404).json({ error: 'Categoría no encontrada' });
      recomendacion.categoriaId = categoriaId;
    }
    recomendacion.texto = texto || recomendacion.texto;
    await recomendacion.save();
    res.json(recomendacion);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Eliminar una recomendación
const eliminarRecomendacion = async (req, res) => {
  try {
    const { id } = req.params;
    const recomendacion = await Recomendacion.findByPk(id);
    if (!recomendacion) return res.status(404).json({ error: 'Recomendación no encontrada' });
    await recomendacion.destroy();
    res.json({ mensaje: 'Recomendación eliminada correctamente' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  crearCategoria,
  listarCategorias,
  crearRecomendacion,
  listarRecomendacionesPorCategoria,
  listarRecomendaciones,
  editarCategoria,
  eliminarCategoria,
  editarRecomendacion,
  eliminarRecomendacion
};
