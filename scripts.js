require('dotenv').config();
const Usuario = require('./src/models/usuario');
const sequelize = require('./db');

async function crearSuperAdmin() {
  try {
    await sequelize.sync();

    // Crear superadmin
    await Usuario.create({
      email: process.env.EMAIL,
      password: process.env.PASSWORD, // Se encriptará automáticamente
      nombre: process.env.NOMBRE,
      rol: 'superadmin', // Por defecto 'superadmin'
    });

    console.log('Superadministrador creado exitosamente');
  } catch (error) {
    console.error('Error al crear superadministrador:', error);
  } finally {
    process.exit();    
  }
}

crearSuperAdmin();
