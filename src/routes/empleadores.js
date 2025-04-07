const express = require('express');
const router = express.Router();
const Empleador = require('../models/Empleador');


router.post('/', async (req , res ) => {
    console.log(req.body);
    try {
        const nuevo = await Empleador.create(req.body);
        res.status(201).json(nuevo);        
    } catch (error) {
        res.status(400).json({error: error.message})
    }

});

router.get('/', async (req, res) =>{
    try {
        const todos = await Empleador.findAll();
        res.json(todos);

    }catch (error) {
        res.status(500).json({error: error.message})
    }
});
router.get('/:id' , async(req,res) =>{
    try {
        const{ id } = req.params;
        const empleador = await Empleador.findByPk(id);
        if (!empleador) {
            return res.status(404).json({ error: 'Empleador no encontrado' });
        }
        res.json(empleador);

    }catch (error) {
        res.status(500).json({ error: error.message });
    }

})

module.exports = router;
