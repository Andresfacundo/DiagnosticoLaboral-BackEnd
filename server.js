// const express = require("express");
// const cors = require("cors");
// const app = express();
// require("dotenv").config();
// const crearSuperAdmin = require('./scripts.js');
// const { syncDatabase } = require("./src/models/index.js");
// const contactoRoutes = require('./src/routes/contactoRoutes.js');
// const intereses = require('./src/routes/interesesRoutes.js');
// const calculatorRoutes = require("./src/routes/calculatorRoutes");
// const categorias = require("./src/routes/categoriasRoutes.js");
// const sendEmail = require('./src/routes/sendEmailRoutes.js');
// // const trabajadoresExcel = require('./src/routes/trabajadoresRoutes.js');
// // const turnosRoutes = require('./src/routes/turnosRoutes');
// const resumenRoutes = require('./src/routes/resumenRoutes');
// const trabajadorTurnoExcel = require('./src/routes/trabajadoresTurnosExcelRouter.js');
// const trimString = require("./src/middlewares/trimStrings.js");
// const resumenNomina = require('./src/routes/resumenNominaRoutes.js');
// const trabajadorRoutes = require('./src/routes/trabajadorRoutes.js');
// const turnosRoutes = require('./src/routes/turnosRoutes.js');
// const detalleTurnoNominaRoutes = require("./src/routes/detalleTurnoNominaRoutes.js");
// const tokenBlackList = require('./src/models/TokenBlackList.js');
// const port = process.env.DB_PORT;



// const corsOptions = {
//   origin: [
//     `${process.env.URL}`,
//     `${process.env.URL_TWO}`,
//   ],
//   methods: "GET, POST, PUT, DELETE,PATCH",
//   allowedHeaders: "Content-Type, Authorization, x-token, sessionid"
// };

// app.use(cors(corsOptions));
// app.use(express.json());
// app.use(trimString);

// app.use('/api/contacto', contactoRoutes);
// app.use('/api/intereses', intereses);
// app.use('/api/auth', require('./src/routes/auth.js'));
// app.use('/api/empleadores', require('./src/routes/empleadores.js'));
// app.use('/api/preguntas', require('./src/routes/preguntas.js'));
// app.use('/api/respuestas', require('./src/routes/respuestas.js',));
// app.use('/api/diagnostico', require('./src/routes/diagnosticoRoutes.js'));
// app.use("/api", calculatorRoutes);
// app.use("/api/", categorias)
// app.use('/api/send-email', sendEmail);
// // app.use('/api/resumen', resumenRoutes);
// app.use('/api/trabajadores', trabajadorTurnoExcel);
// app.use('/api/resumen', resumenNomina);
// app.use('/api/trabajador', trabajadorRoutes);
// app.use('/api/turno', turnosRoutes);
// app.use("/api/detalle-turnos", detalleTurnoNominaRoutes);
// // app.use('/api/trabajadores', trabajadoresExcel);
// // app.use('/api', require('./src/routes/empleadoresRoutes.js'));

// app.get('/', (req, res) => {
//   res.status(200).json({ status: 'Server is running' });
// });

// setInterval(async () => {
//   await tokenBlackList.cleanExpired();  
// }, 60 * 60 * 1000);


// async function iniciarServidor() {
//   await syncDatabase();

//   try {
//     await crearSuperAdmin();
//   } catch (error) {
//     console.error('Error al crear superadmin:', error);
//   }

//   app.listen(port, () => {
//     console.log(`Servidor corriendo en puerto ${port}`);
//   });
// }

// iniciarServidor();

const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const crearSuperAdmin = require("./scripts.js");
const { syncDatabase } = require("./src/models/index.js");
const trimString = require("./src/middlewares/trimStrings.js");
const tokenBlackList = require("./src/models/TokenBlackList.js");

const contactoRoutes = require("./src/routes/contactoRoutes.js");
const intereses = require("./src/routes/interesesRoutes.js");
const calculatorRoutes = require("./src/routes/calculatorRoutes.js");
const categorias = require("./src/routes/categoriasRoutes.js");
const sendEmail = require("./src/routes/sendEmailRoutes.js");
const resumenNomina = require("./src/routes/resumenNominaRoutes.js");
const trabajadorTurnoExcel = require("./src/routes/trabajadoresTurnosExcelRouter.js");
const trabajadorRoutes = require("./src/routes/trabajadorRoutes.js");
const turnosRoutes = require("./src/routes/turnosRoutes.js");
const detalleTurnoNominaRoutes = require("./src/routes/detalleTurnoNominaRoutes.js");

const port = process.env.DB_PORT;
const URL = process.env.URL;
// const URL_TWO = process.env.URL_TWO;


const app = express();
const server = http.createServer(app);

// ==========================
// CONFIGURAR SOCKET.IO
// ==========================
const io = new Server(server, {
  cors: {
    origin: [
      URL,
      // URL_TWO

    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  },
});

const emitirNotificacion = (evento, data) => {
  io.emit(evento, data);
};

// Guardar el socket y el emisor en la app
app.set("io", io);
app.set("emitirNotificacion", emitirNotificacion);

// Eventos de conexión de sockets
io.on("connection", (socket) => {
  console.log(`Usuario conectado: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`Usuario desconectado: ${socket.id}`);
  });
});

// ==========================
// CONFIGURAR MIDDLEWARES
// ==========================
const corsOptions = {
  origin: [
    URL,
    // URL_TWO
  ],
  methods: "GET, POST, PUT, DELETE, PATCH",
  allowedHeaders: "Content-Type, Authorization, x-token, sessionid",
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(trimString);

// ==========================
// CONFIGURAR RUTAS
// ==========================
app.use("/api/contacto", contactoRoutes);
app.use("/api/intereses", intereses);
app.use("/api/auth", require("./src/routes/auth.js"));
app.use("/api/empleadores", require("./src/routes/empleadores.js"));
app.use("/api/preguntas", require("./src/routes/preguntas.js"));
app.use("/api/respuestas", require("./src/routes/respuestas.js"));
app.use("/api/diagnostico", require("./src/routes/diagnosticoRoutes.js"));
app.use("/api", calculatorRoutes);
app.use("/api/", categorias);
app.use("/api/send-email", sendEmail);
app.use("/api/trabajadores", trabajadorTurnoExcel);
app.use("/api/resumen", resumenNomina);
app.use("/api/trabajador", trabajadorRoutes);
app.use("/api/turno", turnosRoutes);
app.use("/api/detalle-turnos", detalleTurnoNominaRoutes);

// ==========================
// RUTA TESTING
// ==========================
app.get("/", (req, res) => {
  res.status(200).json({ status: "Server is running" });
});

// ==========================
// LIMPIEZA DE TOKENS EXPIRADOS
// ==========================
setInterval(async () => {
  await tokenBlackList.cleanExpired();
}, 60 * 60 * 1000); // cada hora

// ==========================
// INICIO DEL SERVIDOR
// ==========================
async function iniciarServidor() {
  await syncDatabase();

  try {
    await crearSuperAdmin();
  } catch (error) {
    console.error("Error al crear superadmin:", error);
  }

  server.listen(port, () => {
    console.log(`Servidor corriendo en puerto ${port}`);
  });
}

iniciarServidor();
