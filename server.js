const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const crearSuperAdmin = require('./scripts.js')

const port = process.env.DB_PORT;

const {syncDatabase} = require("./src/models/index.js");
const { verificarAuth, esAdmin } = require("./src/middlewares/authMiddleware.js");

const corsOptions = {
    origin: `${process.env.URL}`,
    methods: "GET, POST, PUT, DELETE",
    allowedHeaders: "Content-Type, Authorization, x-token" // Añadir x-token para autenticación
};

app.use(cors(corsOptions));
app.use(express.json());


app.use('/api/auth', require('./src/routes/auth.js'));
app.use('/api/empleadores',  require('./src/routes/empleadores.js'));
app.use('/api/preguntas',  require('./src/routes/preguntas.js'));
app.use('/api/respuestas' , require('./src/routes/respuestas.js',));

app.get('/', (req, res) => {
    res.status(200).json({ status: 'Server is running' });
  });

  async function iniciarServidor() {
    await syncDatabase();
    
    // Crear superadmin SIN llamar a process.exit()
    try {
      await crearSuperAdmin();
    } catch (error) {
      console.error('Error al crear superadmin:', error);
    }
    
    // Iniciar servidor después de crear el superadmin
    app.listen(port, () => {
      console.log(`Servidor corriendo en puerto ${port}`);
    });
  }
  
  iniciarServidor();