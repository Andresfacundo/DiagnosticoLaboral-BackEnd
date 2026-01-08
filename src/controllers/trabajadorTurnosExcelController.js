const trabajadorExcel = require("../services/trabajadorTurnosExcelService");

async function descargarPlantilla(req, res) {
    try {
        const workbook = await trabajadorExcel.generarPlantillaExcel();

        res.setHeader(
            "Content-Disposition",
            "attachment; filename=PlantillaTrabajadores.xlsx"
        );
        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );


        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        res.status(500).json({ error: "Error al generar la plantilla" });
    }

}
module.exports = { descargarPlantilla };