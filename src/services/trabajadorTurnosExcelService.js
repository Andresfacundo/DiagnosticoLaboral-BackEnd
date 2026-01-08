const ExcelJS = require("exceljs");

async function generarPlantillaExcel() {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Trabajadores");

    worksheet.columns = [
        { header: "Nombre", key: "nombre", width: 20 },
        { header: "Apellido", key: "apellido", with: 20 },
        { header: "Documento de identidad", key: "cc", width: 25 },
        { header: "Clasificación del personal", key: "clasificacionPersonal", width: 25 },
        { header: "Área", key: "area", width: 20 },
        { header: "Salario base", key: "salarioBase", width: 20 },
        { header: "Color", key: "color", width: 30 },
    ]

    worksheet.addRow({
        nombre: "Ejemplo",        
        apellido: "Ejemplo",
        cc: "123253748697",
        clasificionPersonal: "ordinario",
        area: "ejemplo",
        salarioBase: 1423500,
        color: "#FF5733",
    })
    return workbook
}

module.exports = { generarPlantillaExcel };