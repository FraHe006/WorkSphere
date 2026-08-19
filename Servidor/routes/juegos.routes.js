const express = require('express');
const router = express.Router();
const juegos = require('../controllers/juegos.controller');

// Obtener todas las categorías
router.get('/categorias', juegos.obtenerCategorias);

// Crear nueva categoría
router.post('/categorias', juegos.crearCategoria);

// Actualizar categoría
router.put('/categorias/:id', juegos.actualizarCategoria);

// Contar juegos asociados a una categoría
router.get('/categorias/:id/juegos-count', juegos.contarJuegosPorCategoria);

// Eliminar categoría
router.delete('/categorias/:id', juegos.eliminarCategoria);

// Listar tipos de juego
router.get('/tipos', juegos.listarTipos);

// Listar y buscar juegos
router.get('/', juegos.listarJuegos);

// Obtener juego por código
router.get('/:codigo', juegos.obtenerActividadPorCodigo);

// Crear juego de verdadero/falso
router.post('/verdadero-falso', juegos.crearVerdaderoFalso);

// Crear juego de unir conceptos
router.post('/unir-conceptos', juegos.crearUnirConceptos);

// Crear juego de rellenar frases
router.post('/rellenar-frases', juegos.crearRellenarFrases);

// Crear juego de conversación
router.post('/conversacion', juegos.crearConversacion);

// Cambiar validación de un juego
router.patch('/:codigo/validacion', juegos.cambiarValidacion);

// Obtener historial de validación
router.get('/:codigo/historial-validacion', juegos.obtenerHistorialValidacion);

module.exports = router;