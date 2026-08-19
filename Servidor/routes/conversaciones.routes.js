const express = require('express');
const router = express.Router();
const conversacionesController = require('../controllers/conversaciones.controller');

// Crear conversación
router.post('/', conversacionesController.crearConversacion);

// Obtener conversaciones de un usuario
router.get('/usuario/:usuarioId', conversacionesController.obtenerConversacionesUsuario);

// Obtener conversación por ID
router.get('/:id', conversacionesController.obtenerConversacionPorId);

// Agregar mensaje
router.post('/:id/mensajes', conversacionesController.agregarMensaje);

// Actualizar conversación
router.put('/:id', conversacionesController.actualizarConversacion);

// Eliminar conversación
router.delete('/:id', conversacionesController.eliminarConversacion);

// Buscar o crear conversación entre dos usuarios
router.post('/buscar-o-crear', conversacionesController.buscarOCrearConversacion);

module.exports = router;