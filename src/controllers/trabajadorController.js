const Trabajador = require("../models/TrabajadorTurnos");
const trabajadorService = require('../services/trabajadorService');
const ExcelJS = require('exceljs');

class TrabajadorController {
  async crear(req, res) {
    try {
      const usuarioId = req.usuario.id;
      const created = await Trabajador.create({
        ...req.body,
        usuarioId
      });
      res.json({
        msg: "Trabajador creado correctamente",
        created
      });
    } catch (err) {
      res.status(500).json({ error: err.message }); 
    }
  }

  async addEmpleadosMasivos(req, res) {
    try {

      if (!req.file) {
        return res.status(400).json({ error: "Debe subir un archivo excel" });
      }

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(req.file.buffer);
      const worksheet = workbook.getWorksheet("Trabajadores");            

      if (!worksheet) {
        return res.status(400).json({ error: "La plantilla no tiene la hoja 'Trabajadores'" });

      }

      const trabajadores = [];
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;

        const trabajador = {
          nombre: row.getCell(1).value,
          apellido: row.getCell(2).value,
          cc: row.getCell(3).value,
          clasificacionPersonal: row.getCell(4).value,
          area: row.getCell(5).value,
          salarioBase: row.getCell(6).value,
          color: row.getCell(7).value,
          usuarioId: req.usuario.id,
        };
        trabajadores.push(trabajador);
      });

      if (trabajadores.length === 0) {
        return res.status(400).json({ error: "El archivo está vacío mal estructurado" });
      }
      const result = await trabajadorService.addTrabajadoresMasivos(trabajadores);

      res.status(201).json(result);

    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }


  async listar(req, res) {
    try {
      const usuarioId = req.usuario.id
      const all = await trabajadorService.getTrabajador(usuarioId);
      res.json(all);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
  async listarById(req, res) {
    try {
      const { id } = req.params;
      const usuarioId = req.usuario.id
      const trabajador = await trabajadorService.getTrabajadorById(id, usuarioId)
      res.json(trabajador);
    } catch (error) {
      res.status(400).json({error: error.message})

    }
  }
  async patchTrabajador(req, res) {
    try {
      const { id } = req.params;
      const usuarioId = req.usuario.id;
      const update = await trabajadorService.patchTrabajador(id, usuarioId, req.body);
      res.json(update);

    } catch (error) {
      res.status(400).json({ error: error.message })

    }
  }
  async eliminar(req, res) {
    try {
      const { id } = req.params;
      const usuarioId = req.usuario.id
      const deleted = await trabajadorService.deleteTrabajador(id, usuarioId);
      if (deleted) res.json({ message: "Trabajador eliminado" });
      else res.status(404).json({ error: "Trabajador no encontrado" })

    } catch (error) {
      res.status(400).json({ error: error.message });

    }
  }


}

module.exports = new TrabajadorController();
