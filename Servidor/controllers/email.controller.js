// Importamos las funciones del servicio que realmente habla con el servidor de correo.
const { enviarCorreo, leerCorreos } = require('../services/emailService');

/**
 * POST /api/email/enviar
 * Body: { destinatario, asunto, cuerpo }
 * Envía un correo a un destinatario.
 */
exports.enviarEmail = async (req, res) => {
    console.log('>>> Entrando a enviarEmail, body:', req.body);
    try {
        // Sacamos del cuerpo de la petición los datos del correo.
        const { destinatario, asunto, cuerpo } = req.body;
        // Llamamos al servicio que envía el correo y esperamos el resultado.
        const resultado = await enviarCorreo(destinatario, asunto, cuerpo);
        console.log('RESULTADO ENVIAR CORREO:', resultado);
        // Devolvemos el resultado al cliente.
        res.json(resultado);
    } catch (err) {
        // Si algo falla, registramos el error y respondemos con un 500.
        console.error('[emailController] Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// Devuelve los correos recibidos, opcionalmente filtrados por remitentes.
exports.obtenerCorreosRecibidos = async (req, res) => {
    try {
        // Lista de remitentes por la que filtrar (puede venir vacía).
        const { remitentes } = req.body;
        // Si no llega lista de remitentes, usamos un array vacío por defecto.
        const resultado = await leerCorreos(remitentes || []);
        res.json(resultado);
    } catch (err) {
        console.error('[emailController] Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};