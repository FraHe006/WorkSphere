const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuarios.controller');

// ==================== AUTENTICACIÓN ====================
router.post('/login', usuariosController.login);

// ==================== ACCESO COLABORAR ====================
router.get('/verificar-acceso-colaborar/:id', usuariosController.verificarAccesoColaborar);

// ==================== CRUD USUARIOS NORMALES ====================
router.post('/', usuariosController.crearUsuario);
router.get('/', usuariosController.obtenerUsuarios);
router.get('/existe-email/:email', usuariosController.verificarEmailExiste);
router.get('/:id', usuariosController.obtenerUsuarioPorId);
router.put('/:id', usuariosController.actualizarUsuario);
router.get('/:id/vidas', usuariosController.obtenerVidas);
router.post('/:id/perder-vida', usuariosController.perderVida);
router.post('/:id/incrementar-racha', usuariosController.incrementarRacha);

// ==================== CRUD USUARIOS VALIDADOS ====================
router.post('/validados/crear', usuariosController.crearUsuarioValidado);
router.get('/validados/lista', usuariosController.obtenerUsuariosValidados);
router.get('/validados/:id', usuariosController.obtenerUsuarioValidadoPorId);
router.put('/validados/:id', usuariosController.actualizarUsuarioValidado);
router.delete('/validados/:id', usuariosController.eliminarUsuarioValidado);
router.post('/:id/contactos-email', usuariosController.agregarContactoEmail);
router.delete('/:id/contactos-email', usuariosController.eliminarContactoEmail);

module.exports = router;