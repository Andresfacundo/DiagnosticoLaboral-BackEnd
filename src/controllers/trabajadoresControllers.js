// const XLSX = require('xlsx');
// const fs = require('fs');
// const  procesarFilaTrabajador  = require('../services/trabajadorServices.js')


// exports.cargarExcel = async (req, res) => {
//     try {
//         if (!req.file) {
//             return res.status(400).json({ error: 'No se envió ningún archivo.' });
//         }

//         const workbook = XLSX.readFile(req.file.path);
//         const sheetName = workbook.SheetNames[0];
//         const worksheet = workbook.Sheets[sheetName];
//         const data = XLSX.utils.sheet_to_json(worksheet);

//         if (!Array.isArray(data) || data.length === 0) {
//             fs.unlinkSync(req.file.path);
//             return res.status(400).json({ error: 'El archivo Excel está vacío o mal formateado.' });
//         }

//         const resultados = [];
//         for (const row of data) {
//             try {
//                 const trabajador = await procesarFilaTrabajador.procesarFilaTrabajador(row);
//                 resultados.push(trabajador);
//             } catch (err) {
//                 resultados.push({ error: err.message, row });
//             }
//         }

//         fs.unlinkSync(req.file.path);
//         res.status(200).json({ mensaje: 'Archivo procesado', resultados });
//     } catch (error) {
//         if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
//         res.status(500).json({ error: error.message });
//     }
// };