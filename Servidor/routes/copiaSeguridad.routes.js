const express = require('express');
const router = express.Router();
const { ejecutarCopiaSeguridad } = require('../controllers/copiaSeguridad.controller');

// Realizar copia de seguridad
router.post('/', ejecutarCopiaSeguridad);

module.exports = router;