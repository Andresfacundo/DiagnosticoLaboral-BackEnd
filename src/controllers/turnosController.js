const Turno = require("../models/Turnos");
const TurnoService = require('../services/turnosService');

class TurnoController {
  async crear(req, res) {
    try {
      const service = new TurnoService();
      const turno = await service.add(req.params.trabajadorId, req.body, req.usuario.id);
      res.json({
        message: "Turno creado correctamente",
        data: turno
      });
    } catch (err) {
      res.status(400).json({
        error: err.message || "Error al crear el turno"
      });
    }
  }

  async listar(req, res) {
    try {
      const usuarioId = req.usuario.id;
      const { nombre, apellido, area, cc, diaInicio, diaFin } = req.query;
      const service = new TurnoService();
      const all = await service.getAll(usuarioId, { nombre, apellido, area, cc, diaInicio, diaFin });
      res.json(all);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
  async listarById(req, res) {
    try {
      const { id } = req.params
      const usuarioId = req.usuario.id;
      const service = new TurnoService();
      const all = await service.getById(id, usuarioId);
      res.json(all);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async actualizar(req, res) {
    try {
      const { id } = req.params;
      const usuarioId = req.usuario.id;
      const service = new TurnoService();
      const update = await service.update(id, req.body, usuarioId);
      res.json({
        message: "Turno actualizado correctamente",
        data: update
      });

    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const usuarioId = req.usuario.id;
      const service = new TurnoService();
      await service.delete(id, usuarioId);
      res.json({ message: "Turno eliminado" });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new TurnoController();
