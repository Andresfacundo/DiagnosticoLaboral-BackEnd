const DetalleTurnoNominaService = require("../services/DetalleTurnoNominaService");

class DetalleTurnoNominaController {

  async listarTodos(req, res) {
    try {
      const usuarioId = req.usuario.id;
      const { nombre, apellido, area, cc, diaInicio, diaFin } = req.query;
      const detalles = await DetalleTurnoNominaService.listarTodos(usuarioId, { nombre, apellido, area, cc, diaInicio, diaFin });
      return res.status(200).json(detalles);
    } catch (error) {
      console.error("Error al listar todos los detalles:", error);
      return res.status(400).json({ message: error.message });
    }
  }

}

module.exports = new DetalleTurnoNominaController();

