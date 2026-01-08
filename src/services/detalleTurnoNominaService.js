const DetalleTurnoNomina = require("../models/DetalleTurnoNomina");
const Trabajador = require("../models/TrabajadorTurnos");
const Turno = require("../models/Turnos");
const { Op } = require("sequelize");

class DetalleTurnoNominaService {

    async listarTodos(usuarioId, filtros = {}) {

        const whereTrabajador = { usuarioId };
        const whereTurno = {};

        if (filtros.nombre) {
            whereTrabajador.nombre = { [Op.like]: `%${filtros.nombre}%` };
        }
        if (filtros.apellido) {
            whereTrabajador.apellido = { [Op.like]: `%${filtros.apellido}%` };
        }
        if (filtros.area) {
            whereTrabajador.area = { [Op.like]: `%${filtros.area}%` };
        }
        if (filtros.cc) {
            whereTrabajador.cc = { [Op.like]: `%${filtros.cc}%` };
        }
        if (filtros.diaInicio) {
            whereTurno.diaInicio = { [Op.gte]: filtros.diaInicio };
        }
        if (filtros.diaFin) {
            whereTurno.diaFin = { [Op.lte]: filtros.diaFin };
        }



        return await DetalleTurnoNomina.findAll({  
       
            include: [
                { model: Trabajador, attributes: ["id", "nombre", "apellido", "cc", "area"], where: whereTrabajador },
                { model: Turno, attributes: ["id", "diaInicio", "horaInicio", "horaFin"], where: whereTurno }
            ],
            order: [["fecha", "ASC"]]
        });
    }


}

module.exports = new DetalleTurnoNominaService();
