const ResumenNominaService = require("../services/resumenNominaService");

class ResumenNominaController {
  async generarResumen(req, res) {
    try {
      const usuarioId = req.usuario.id;
      await ResumenNominaService.generarYGuardarResumen(usuarioId);
      return res.status(200).json({ message: "Resumen de nómina generado/actualizado con éxito" });
    } catch (error) {
      console.error("Error al generar resumen de nómina:", error);
      return res.status(400).json({ error: "Hubo un problema al generar el resumen de nómina" });
    }
  }

  async listarResumenes(req, res) {
    try {
      const usuarioId = req.usuario.id;
      const { nombre, apellido, area, cc, diaInicio, diaFin } = req.query;
      const resumenes = await ResumenNominaService.listarResumenes(usuarioId, { nombre, apellido, area, cc, diaInicio, diaFin });
      return res.status(200).json(resumenes);
    } catch (error) {
      console.error("Error al listar resúmenes:", error);
      return res.status(400).json({ error: "Hubo un problema al listar los resúmenes" });
    }
  }
}

module.exports = new ResumenNominaController();


