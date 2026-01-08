// src/socket.js
let io = null;

function initSocket(server, options = {}) {
  const { Server } = require('socket.io');

  io = new Server(server, {
    cors: {
      origin: options.corsOrigin || "*",
      methods: ["GET", "POST","PUT","DELETE","PATCH"],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('Socket conectado:', socket.id);

    // puedes escuchar eventos desde el cliente si necesitas
    socket.on('disconnect', () => {
      console.log('Socket desconectado:', socket.id);
    });
  });

  return io;
}

function getIO() {
  if (!io) {
    throw new Error('Socket.io no inicializado. Llama a initSocket(server) primero.');
  }
  return io;
}

module.exports = { initSocket, getIO };
