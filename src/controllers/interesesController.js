const Intereses = require('../models/interesesModels');

const getIntereses = async (req , res) => {
    const intereses = await Intereses.findAll();
    res.json(intereses);
};

const addInteres = async (req , res ) => {
    const { nombre } = req.body;
    if (!nombre) return res.status(400).json({ mensaje: 'Nombre de interes requerido'});

    const nuevo = await Intereses.create({ nombre });
    res.status(201).json(nuevo);
};

const deleteIntereses = async ( req , res ) => {
    const { id } = req.params;
    await Intereses.destroy({ where: { id } });
    res.json({ mensaje: 'Interés eliminado'});
};

module.exports = { getIntereses, addInteres, deleteIntereses };
