require('dotenv').config();
const Usuario = require('./src/models/Usuario.js');
const sequelize = require('./db');

async function crearSuperAdmin() {
  try {
    await sequelize.sync();
    // Crear superadmin
    await Usuario.create({
      email: process.env.EMAIL,
      password: process.env.PASSWORD,
      nombre: process.env.NOMBRE,
      rol: 'superadmin',
    });
    
    console.log('Superadministrador creado exitosamente');
    return true; // Return success instead of exiting
  } catch (error) {
    console.error('Error al crear superadministrador:', error);
    return false;
  }
}

module.exports = crearSuperAdmin;
