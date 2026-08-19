const express = require('express');
const router = express.Router();
const emailController = require('../controllers/email.controller');

// Enviar email
router.post('/enviar', emailController.enviarEmail);

// Obtener correos recibidos
router.post('/recibidos', emailController.obtenerCorreosRecibidos);

module.exports = router;