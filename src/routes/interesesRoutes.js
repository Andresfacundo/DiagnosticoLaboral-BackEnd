const express = require('express');
const router = express.Router();
const {  getIntereses, addInteres, deleteIntereses } = require('../controllers/interesesController');

router.get('/', getIntereses);
router.post('/', addInteres);
router.delete('/:id', deleteIntereses);

module.exports = router;
