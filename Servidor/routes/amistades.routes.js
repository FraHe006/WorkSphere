const express = require('express');
const router = express.Router();
const amistadController = require('../controllers/amistades.controller');

// ==================== SOLICITUDES ====================
// Enviar solicitud de amistad
router.post('/enviar', amistadController.enviarSolicitud);

// Obtener solicitudes pendientes recibidas
router.get('/solicitudes/:usuarioId', amistadController.obtenerSolicitudes);

// Aceptar solicitud
router.put('/aceptar/:solicitudId', amistadController.aceptarSolicitud);

// Rechazar solicitud
router.put('/rechazar/:solicitudId', amistadController.rechazarSolicitud);

// ==================== AMISTADES ====================
// Obtener lista de amigos
router.get('/:usuarioId', amistadController.obtenerAmigos);

// Eliminar amistad
router.delete('/:usuarioId/:amigoId', amistadController.eliminarAmistad);

module.exports = router;