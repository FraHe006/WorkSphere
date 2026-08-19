// conexionSQL.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'dam2.colexio-karbo.com',
    port: '3333',
    user: 'dam2',
    password: 'Ka3b0134679',
    database: 'proyecto_hfranz',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Probar conexión al iniciar
pool.getConnection()
    .then(connection => {
        console.log('SQL Conectado correctamente');
        connection.release();
    })
    .catch(err => {
        console.error('Error al conectar SQL:', err);
    });

module.exports = { obtenerMySQL: () => pool };