// 'exec' permite ejecutar comandos del sistema operativo desde Node.
const { exec } = require('child_process');
// 'path' ayuda a construir rutas de archivo de forma segura entre sistemas.
const path = require('path');

// Ejecuta el script copiaSeguridad.sh y devuelve su salida al cliente.
const ejecutarCopiaSeguridad = (req, res) => {
    // Construye la ruta al script, que está una carpeta por encima de este archivo.
    const scriptPath = path.join(__dirname, '..', 'copiaSeguridad.sh');

    // Lanza el script con bash. El callback recibe el error, la salida normal y la de error.
    exec(`bash "${scriptPath}"`, (error, stdout, stderr) => {
        // Si el script falla, respondemos con error 500 e incluimos el detalle.
        if (error) {
            console.error('Error en backup:', error);
            return res.status(500).json({ error: 'Backup failed', detail: stderr });
        }
        // Si todo va bien, devolvemos la salida del script como confirmación.
        res.json({ message: 'Backup completado', output: stdout });
    });
};

// Exportamos la función para usarla en las rutas.
module.exports = { ejecutarCopiaSeguridad };