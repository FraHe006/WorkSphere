// services/emailService.js
const { execFile } = require('child_process');
const path = require('path');

const PYTHON_PATH = 'python3';
const SCRIPTS_DIR = path.join(__dirname, '..', 'python');

/**
 * Envía un correo electrónico usando el script de Python.
 *
 * @param {string} destinatario
 * @param {string} asunto
 * @param {string} cuerpo
 * @returns {Promise<object>}
 */
const enviarCorreo = (destinatario, asunto, cuerpo) => {
    return new Promise((resolve, reject) => {
        if (!destinatario || !asunto || !cuerpo) {
            return reject(new Error('Faltan campos obligatorios: destinatario, asunto, cuerpo'));
        }

        const datosEmail = JSON.stringify({ destinatario, asunto, cuerpo });
        const scriptPath = path.join(SCRIPTS_DIR, 'enviarCorreo.py');

        execFile(
            PYTHON_PATH,
            [scriptPath, datosEmail],
            { cwd: SCRIPTS_DIR, timeout: 20000, env: process.env },
            (err, stdout, stderr) => {
                if (stderr) {
                    console.log('[emailService] stderr:', stderr);
                }

                if (err) {
                    console.error('[emailService] Error ejecutando Python:', err);
                    return reject(new Error(stderr || err.message));
                }

                try {
                    const lineas = stdout.trim().split('\n').filter(l => l.trim() !== '');
                    const resultado = JSON.parse(lineas[lineas.length - 1]);

                    if (resultado.success) {
                        resolve(resultado);
                    } else {
                        reject(new Error(resultado.error || 'Error desconocido al enviar correo'));
                    }
                } catch (parseError) {
                    console.error('[emailService] stdout recibido:', stdout);
                    reject(new Error('Respuesta inválida del script de Python'));
                }
            }
        );
    });
};

const leerCorreos = (remitentes) => {
    return new Promise((resolve, reject) => {
        if (!Array.isArray(remitentes) || remitentes.length === 0) {
            return resolve({ success: true, correos: [] });
        }

        const datosRemitentes = JSON.stringify(remitentes);
        const scriptPath = path.join(SCRIPTS_DIR, 'leerCorreos.py');

        execFile(
            PYTHON_PATH,
            [scriptPath, datosRemitentes],
            { cwd: SCRIPTS_DIR, timeout: 30000, env: process.env },
            (err, stdout, stderr) => {
                if (stderr) {
                    console.log('[emailService] stderr:', stderr);
                }

                if (err) {
                    console.error('[emailService] Error ejecutando Python:', err);
                    return reject(new Error(stderr || err.message));
                }

                try {
                    const lineas = stdout.trim().split('\n').filter(l => l.trim() !== '');
                    const resultado = JSON.parse(lineas[lineas.length - 1]);

                    if (resultado.success) {
                        resolve(resultado);
                    } else {
                        reject(new Error(resultado.error || 'Error desconocido al leer correos'));
                    }
                } catch (parseError) {
                    console.error('[emailService] stdout recibido:', stdout);
                    reject(new Error('Respuesta inválida del script de Python'));
                }
            }
        );
    });
};


module.exports = { enviarCorreo, leerCorreos };