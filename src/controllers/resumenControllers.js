const resumenService = require("../services/resumenService");

const obtenerResumen = (req, res) => {
  try {
    const { empleados, turnos } = req.body;
    if (!empleados || !turnos) {
      return res.status(400).json({ error: "Faltan empleados o turnos" });
    }
    const { resumenEmpleados, totales } = resumenService.calcularResumenEmpleados(empleados, turnos);
    res.status(200).json({ resumenEmpleados, totales });
  } catch (error) {
    console.error("Error al calcular el resumen:", error);
    res.status(500).json({ error: "Error al calcular el resumen de nómina." });
  }
};

module.exports = { obtenerResumen};
