const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const { mongoDB } = require('./conexionMongo');
const { obtenerMySQL } = require('./conexionSQL');
const path = require('path');

// Importar rutas
const usuariosRoutes = require('./routes/usuarios.routes');
const amistadesRoutes = require('./routes/amistades.routes');
const conversacionesRoutes = require('./routes/conversaciones.routes');
const juegosRoutes = require('./routes/juegos.routes');
const emailRoutes = require('./routes/email.routes');
const copiaSeguridadRoutes = require('./routes/copiaSeguridad.routes');

// Importar sockets
const { configurarSockets } = require('./sockets/chatSockets');

// Crear aplicación Express y servidor HTTP
const app = express();
const server = http.createServer(app);

// Configurar Socket.io con CORS
const io = socketIO(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});

// Middleware CORS para API REST
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Middleware para parsear JSON
app.use(express.json());

// Servir archivos estáticos
app.use(express.static('public'));

// Middleware para pasar la conexión de MongoDB y Socket.io a las rutas
app.use((req, res, next) => {
    req.mongoDB = mongoDB;
    req.mysqlDB = obtenerMySQL();
    req.io = io;
    next();
});

// Configurar rutas de la API
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/amistades', amistadesRoutes);
app.use('/api/conversaciones', conversacionesRoutes);
app.use('/api/juegos', juegosRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/copiaSeguridad', copiaSeguridadRoutes);

// Configurar eventos de Socket.io
configurarSockets(io, mongoDB);

// Puerto del servidor
const PORT = 6101;

// Iniciar servidor
server.listen(PORT, () => {
    console.log(`Servidor ejecutándose en puerto ${PORT}`);
    console.log(`WebSocket listo para conexiones`);
});