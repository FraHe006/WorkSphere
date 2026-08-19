const { enviarCorreo } = require('../services/emailService');

// ── Helpers internos ──────────────────────────────────────────────────────────

/**
 * Envía un correo notificando al autor que su juego está pendiente de validar.
 */
const notificarPendienteValidacion = async (correo_autor, titulo, codigo) => {
    try {
        const asunto = 'Tu actividad ha sido enviada para validar';
        const cuerpo =
            `Hola,\n\n` +
            `Tu actividad "${titulo}" (código: ${codigo}) ha sido recibido correctamente ` +
            `y está pendiente de validación por parte de un usuario validado.\n\n` +
            `Te avisaremos por correo en cuanto sea validado.\n\n` +
            `¡Que tenga un buen día!`;

        await enviarCorreo(correo_autor, asunto, cuerpo);
    } catch (error) {
        console.error('Error al enviar correo de pendiente de validación:', error);
        // No bloqueamos la creación del juego si falla el correo.
    }
};

/**
 * Genera un código público para el juego.
 * Formato: {PREFIJO}-{AÑO}-{ID con ceros a la izquierda}
 * Ej: VF-2024-00042
 */
const generarCodigo = (prefijo, id) => {
    const año = new Date().getFullYear();
    // padStart(5, '0') rellena con ceros a la izquierda hasta tener 5 dígitos.
    return `${prefijo}-${año}-${String(id).padStart(5, '0')}`;
};

// Mapeo de tipo_id a prefijo (basado en la tabla tipos_juego)
// 1 = Verdadero y Falso → VF
// 2 = Unir Conceptos → UC
// 3 = Rellenar Frases → RF
// 4 = Conversacion → CONV
const obtenerPrefijo = (tipo_id) => {
    const prefijos = {
        1: 'VF',   // Verdadero y Falso
        2: 'UC',   // Unir Conceptos
        3: 'RF',   // Rellenar Frases
        4: 'CONV'  // Conversacion
    };
    // Si el tipo no está en la lista, usamos 'XX' como prefijo por defecto.
    return prefijos[tipo_id] || 'XX';
};

// ── Listar Tipos ───────────────────────────────────────────────────────────
// Devuelve los tipos de juego disponibles (Verdadero/Falso, etc.).
exports.listarTipos = async (req, res) => {
    try {
        const [tipos] = await req.mysqlDB.query(
            `SELECT id, nombre FROM tipos_juego ORDER BY nombre`
        );
        res.json(tipos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ── Obtener todas las categorías ────────────────────────────────────────────
exports.obtenerCategorias = async (req, res) => {
    try {
        const [categorias] = await req.mysqlDB.query(
            `SELECT id, categoria FROM categorias ORDER BY categoria`
        );
        res.json(categorias);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ── Crear Verdadero/Falso ──────────────────────────────────────────────────
exports.crearVerdaderoFalso = async (req, res) => {
    const db = req.mysqlDB;
    // Pedimos una conexión del pool para poder usar una transacción.
    const conn = await db.getConnection();
    try {
        const { titulo, correo_autor, categoria_id, preguntas } = req.body;

        // Validación: título, autor y al menos una pregunta.
        if (!titulo || !correo_autor || !Array.isArray(preguntas) || preguntas.length === 0) {
            return res.status(400).json({ error: 'Faltan campos obligatorios: titulo, correo_autor, preguntas' });
        }

        // Cada pregunta debe tener enunciado y respuesta.
        for (const [i, p] of preguntas.entries()) {
            if (!p.enunciado || p.respuesta === undefined) {
                return res.status(400).json({ error: `Pregunta ${i + 1}: falta enunciado o respuesta` });
            }
        }

        // Iniciamos la transacción: si algo falla, se deshace todo.
        await conn.beginTransaction();

        const tipo_id = 1; // Verdadero y Falso
        const prefijo = obtenerPrefijo(tipo_id);

        // Insertamos el juego con un código temporal, porque aún no sabemos su id.
        const [resJuego] = await conn.query(
            `INSERT INTO juegos (codigo, tipo_id, titulo, correo_autor, categoria_id)
             VALUES ('TEMP', ?, ?, ?, ?)`,
            [tipo_id, titulo, correo_autor, categoria_id || null]
        );

        // Ya tenemos el id generado; con él construimos el código definitivo.
        const juego_id = resJuego.insertId;
        const codigo = generarCodigo(prefijo, juego_id);

        // Actualizamos el juego con su código real.
        await conn.query(`UPDATE juegos SET codigo = ? WHERE id = ?`, [codigo, juego_id]);

        // Preparamos todas las preguntas como filas y las insertamos de una vez.
        const filas = preguntas.map((p, i) => [
            juego_id, i, p.enunciado, p.respuesta ? 1 : 0, p.explicacion || null
        ]);
        await conn.query(
            `INSERT INTO vf_preguntas (juego_id, orden, enunciado, respuesta, explicacion) VALUES ?`,
            [filas]
        );

        // Confirmamos los cambios en la base de datos.
        await conn.commit();
        // Avisamos al autor de que su juego está pendiente de validación.
        await notificarPendienteValidacion(correo_autor, titulo, codigo);
        res.status(201).json({ mensaje: 'Juego creado', codigo });

    } catch (error) {
        // Si algo falló, deshacemos toda la transacción.
        await conn.rollback();
        console.error('Error al crear verdadero/falso:', error);
        res.status(500).json({ error: error.message });
    } finally {
        // Pase lo que pase, devolvemos la conexión al pool.
        conn.release();
    }
};

// ── Crear Unir Conceptos ───────────────────────────────────────────────────
exports.crearUnirConceptos = async (req, res) => {
    const db = req.mysqlDB;
    const conn = await db.getConnection();
    try {
        const { titulo, correo_autor, categoria_id, parejas } = req.body;

        // Validación: título, autor y al menos una pareja.
        if (!titulo || !correo_autor || !Array.isArray(parejas) || parejas.length === 0) {
            return res.status(400).json({ error: 'Faltan campos obligatorios: titulo, correo_autor, parejas' });
        }

        // Cada pareja debe tener término y definición.
        for (const [i, p] of parejas.entries()) {
            if (!p.termino || !p.definicion) {
                return res.status(400).json({ error: `Pareja ${i + 1}: falta término o definición` });
            }
        }

        await conn.beginTransaction();

        const tipo_id = 2; // Unir Conceptos
        const prefijo = obtenerPrefijo(tipo_id);

        // Mismo patrón: insertar con código temporal y luego ponerle el real.
        const [resJuego] = await conn.query(
            `INSERT INTO juegos (codigo, tipo_id, titulo, correo_autor, categoria_id)
             VALUES ('TEMP', ?, ?, ?, ?)`,
            [tipo_id, titulo, correo_autor, categoria_id || null]
        );

        const juego_id = resJuego.insertId;
        const codigo = generarCodigo(prefijo, juego_id);

        await conn.query(`UPDATE juegos SET codigo = ? WHERE id = ?`, [codigo, juego_id]);

        // Insertamos todas las parejas de golpe.
        const filas = parejas.map((p, i) => [
            juego_id, i, p.termino, p.definicion, p.explicacion || null
        ]);
        await conn.query(
            `INSERT INTO uc_parejas (juego_id, orden, termino, definicion, explicacion) VALUES ?`,
            [filas]
        );

        await conn.commit();
        await notificarPendienteValidacion(correo_autor, titulo, codigo);
        res.status(201).json({ mensaje: 'Juego creado', codigo });

    } catch (error) {
        await conn.rollback();
        console.error('Error al crear unir conceptos:', error);
        res.status(500).json({ error: error.message });
    } finally {
        conn.release();
    }
};

// ── Crear Rellenar Frases ──────────────────────────────────────────────────
exports.crearRellenarFrases = async (req, res) => {
    const db = req.mysqlDB;
    const conn = await db.getConnection();
    try {
        const { titulo, correo_autor, categoria_id, preguntas } = req.body;

        // Validación: título, autor y al menos una pregunta.
        if (!titulo || !correo_autor || !Array.isArray(preguntas) || preguntas.length === 0) {
            return res.status(400).json({ error: 'Faltan campos obligatorios: titulo, correo_autor, preguntas' });
        }

        // Cada pregunta debe tener frase y respuesta.
        for (const [i, p] of preguntas.entries()) {
            if (!p.frase || !p.respuesta) {
                return res.status(400).json({ error: `Pregunta ${i + 1}: falta frase o respuesta` });
            }
        }

        await conn.beginTransaction();

        const tipo_id = 3; // Rellenar Frases
        const prefijo = obtenerPrefijo(tipo_id);

        const [resJuego] = await conn.query(
            `INSERT INTO juegos (codigo, tipo_id, titulo, correo_autor, categoria_id)
             VALUES ('TEMP', ?, ?, ?, ?)`,
            [tipo_id, titulo, correo_autor, categoria_id || null]
        );

        const juego_id = resJuego.insertId;
        const codigo = generarCodigo(prefijo, juego_id);

        await conn.query(`UPDATE juegos SET codigo = ? WHERE id = ?`, [codigo, juego_id]);

        const filas = preguntas.map((p, i) => [
            juego_id, i, p.frase, p.respuesta, p.explicacion || null
        ]);
        await conn.query(
            `INSERT INTO rf_preguntas (juego_id, orden, frase, respuesta, explicacion) VALUES ?`,
            [filas]
        );

        await conn.commit();
        await notificarPendienteValidacion(correo_autor, titulo, codigo);
        res.status(201).json({ mensaje: 'Juego creado', codigo });

    } catch (error) {
        await conn.rollback();
        console.error('Error al crear rellenar frases:', error);
        res.status(500).json({ error: error.message });
    } finally {
        conn.release();
    }
};

// ── Crear Conversación ─────────────────────────────────────────────────────
// Este tipo es más complejo: tiene puntuadores, diálogos con opciones y despedida.
exports.crearConversacion = async (req, res) => {
    const db = req.mysqlDB;
    const conn = await db.getConnection();
    try {
        const { titulo, correo_autor, categoria_id, puntuadores, dialogos, despedida } = req.body;

        // Validación: título, autor y al menos un puntuador.
        if (!titulo || !correo_autor || !Array.isArray(puntuadores) || puntuadores.length === 0) {
            return res.status(400).json({ error: 'Faltan campos: titulo, correo_autor, puntuadores' });
        }

        // Y al menos un diálogo.
        if (!Array.isArray(dialogos) || dialogos.length === 0) {
            return res.status(400).json({ error: 'Faltan diálogos' });
        }

        await conn.beginTransaction();

        const tipo_id = 4; // Conversación
        const prefijo = obtenerPrefijo(tipo_id);

        const [resJuego] = await conn.query(
            `INSERT INTO juegos (codigo, tipo_id, titulo, correo_autor, categoria_id)
             VALUES ('TEMP', ?, ?, ?, ?)`,
            [tipo_id, titulo, correo_autor, categoria_id || null]
        );

        const juego_id = resJuego.insertId;
        const codigo = generarCodigo(prefijo, juego_id);

        await conn.query(`UPDATE juegos SET codigo = ? WHERE id = ?`, [codigo, juego_id]);

        // Insertamos los puntuadores (perfiles de resultado según la puntuación).
        for (const p of puntuadores) {
            await conn.query(
                `INSERT INTO conv_puntuadores (juego_id, letra, nombre, rango_min, rango_max, desenlace)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [juego_id, p.letra, p.nombre, p.rango_min, p.rango_max, p.desenlace]
            );
        }

        // Insertamos cada diálogo y, dentro de cada uno, sus opciones de respuesta.
        for (const [i, d] of dialogos.entries()) {
            const [resDialog] = await conn.query(
                `INSERT INTO conv_dialogos (juego_id, orden, prompt)
                 VALUES (?, ?, ?)`,
                [juego_id, i, d.prompt]
            );

            const dialogo_id = resDialog.insertId;

            // Cada opción tiene pesos (peso_a, peso_b, peso_c) que suman a cada perfil.
            for (const o of d.opciones) {
                await conn.query(
                    `INSERT INTO conv_opciones (dialogo_id, letra, texto, explicacion, peso_a, peso_b, peso_c)
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [dialogo_id, o.letra, o.texto, o.explicacion || null, o.peso_a || 0, o.peso_b || 0, o.peso_c || 0]
                );
            }
        }

        // La despedida es opcional; solo la guardamos si existe.
        if (despedida) {
            await conn.query(
                `INSERT INTO conv_despedida (juego_id, mensaje) VALUES (?, ?)`,
                [juego_id, despedida]
            );
        }

        await conn.commit();
        await notificarPendienteValidacion(correo_autor, titulo, codigo);
        res.status(201).json({ mensaje: 'Juego creado', codigo });

    } catch (error) {
        await conn.rollback();
        console.error('Error al crear conversación:', error);
        res.status(500).json({ error: error.message });
    } finally {
        conn.release();
    }
};

// ── Listar Juegos ──────────────────────────────────────────────────────────
// Devuelve juegos, con filtros opcionales por tipo, categoría, autor o estado.
exports.listarJuegos = async (req, res) => {
    try {
        const { tipo, categoria, correo, validado } = req.query;

        // 'tipo' llega como clave (ej: 'verdadero_falso') → se traduce al nombre de la BD.
        const _TIPO_META = {
            'verdadero_falso': 'Verdadero y Falso',
            'unir_conceptos': 'Unir Conceptos',
            'rellenar_frase': 'Rellenar Frases',
            'conversacion': 'Conversacion',
        };

        // Consulta base; WHERE 1=1 permite ir añadiendo condiciones con AND fácilmente.
        let sql = `
            SELECT j.id, j.codigo, j.titulo, j.correo_autor,
                   j.validado, j.creado_el,
                   t.nombre AS tipo
            FROM juegos j
            JOIN tipos_juego t  ON t.id = j.tipo_id
            LEFT JOIN categorias c ON c.id = j.categoria_id
            WHERE 1=1
        `;
        const params = [];

        // Filtro por tipo de juego.
        if (tipo) {
            const nombreTipo = _TIPO_META[tipo] ?? tipo;
            sql += ' AND t.nombre = ?';
            params.push(nombreTipo);
        }
        // Filtro por nombre de categoría.
        if (categoria) {
            // 'categoria' llega como nombre (ej: 'Derecho'), no como id.
            sql += ' AND c.categoria = ?';
            params.push(categoria);
        }
        // Filtro por autor.
        if (correo) {
            sql += ' AND j.correo_autor = ?';
            params.push(correo);
        }
        // Filtro por estado de validación.
        if (validado !== undefined) {
            // validado: 0 = pendiente, 1 = validado, 2 = rechazado
            let estado;
            if (validado === 'true') estado = 1;
            else if (validado === 'false') estado = 0;
            else estado = parseInt(validado, 10);
            sql += ' AND j.validado = ?';
            params.push(estado);
        }

        const [juegos] = await req.mysqlDB.query(sql, params);
        res.json(juegos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ── Obtener Juego por Código ───────────────────────────────────────────────
// Devuelve el juego completo con todo su contenido según el tipo.
exports.obtenerActividadPorCodigo = async (req, res) => {
    const db = req.mysqlDB;
    try {
        const { codigo } = req.params;

        // Primero traemos los datos generales del juego.
        const [[juego]] = await db.query(
            `SELECT j.id, j.codigo, j.titulo, j.correo_autor, j.validado,
                    j.creado_el, j.actualizado_el,
                    t.id AS tipo_id, t.nombre AS tipo
             FROM juegos j
             JOIN tipos_juego t ON t.id = j.tipo_id
             WHERE j.codigo = ?`,
            [codigo]
        );

        if (!juego) return res.status(404).json({ error: 'Juego no encontrado' });

        // Según el tipo, añadimos su contenido específico antes de responder.
        switch (juego.tipo_id) {
            case 1: {
                const [preguntas] = await db.query(
                    `SELECT id, orden, enunciado, respuesta, explicacion
                     FROM vf_preguntas WHERE juego_id = ? ORDER BY orden`,
                    [juego.id]
                );
                return res.json({ ...juego, preguntas });
            }
            case 2: {
                const [parejas] = await db.query(
                    `SELECT id, orden, termino, definicion, explicacion
                     FROM uc_parejas WHERE juego_id = ? ORDER BY orden`,
                    [juego.id]
                );
                return res.json({ ...juego, parejas });
            }
            case 3: {
                const [preguntas] = await db.query(
                    `SELECT id, orden, frase, respuesta, explicacion
                     FROM rf_preguntas WHERE juego_id = ? ORDER BY orden`,
                    [juego.id]
                );
                return res.json({ ...juego, preguntas });
            }
            case 4: {
                const [puntuadores] = await db.query(
                    `SELECT id, letra, nombre, rango_min, rango_max, desenlace
                     FROM conv_puntuadores WHERE juego_id = ? ORDER BY letra`,
                    [juego.id]
                );
                const [dialogos] = await db.query(
                    `SELECT id, orden, prompt
                     FROM conv_dialogos WHERE juego_id = ? ORDER BY orden`,
                    [juego.id]
                );
                // Para cada diálogo, cargamos sus opciones.
                for (const dialogo of dialogos) {
                    const [opciones] = await db.query(
                        `SELECT id, letra, texto, explicacion,
                                peso_a, peso_b, peso_c
                         FROM conv_opciones WHERE dialogo_id = ? ORDER BY letra`,
                        [dialogo.id]
                    );
                    dialogo.opciones = opciones;
                }
                // Mensaje de despedida (puede no existir).
                const [[despedidaRow]] = await db.query(
                    `SELECT mensaje FROM conv_despedida WHERE juego_id = ?`,
                    [juego.id]
                );
                return res.json({
                    ...juego,
                    puntuadores,
                    dialogos,
                    despedida: despedidaRow?.mensaje ?? null,
                });
            }
            default:
                // Tipo desconocido: devolvemos solo los datos generales.
                return res.json(juego);
        }
    } catch (error) {
        console.error('Error al obtener juego:', error);
        res.status(500).json({ error: error.message });
    }
};

// ── Cambiar Validación ─────────────────────────────────────────────────────
// Aprueba o rechaza un juego, guarda el cambio en el historial y avisa al autor.
exports.cambiarValidacion = async (req, res) => {
    const db = req.mysqlDB;
    const conn = await db.getConnection();
    try {
        const { codigo } = req.params;
        const { validado, cambiado_por } = req.body;

        // validado: 1 = aprobado, 2 = rechazado
        const nuevoEstado = parseInt(validado, 10);

        await conn.beginTransaction();

        // Buscamos el juego y su estado actual.
        const [juegos] = await conn.query(
            `SELECT id, validado, titulo, correo_autor FROM juegos WHERE codigo = ?`,
            [codigo]
        );

        if (juegos.length === 0) {
            await conn.rollback();
            return res.status(404).json({ error: 'Juego no encontrado' });
        }

        const juego = juegos[0];
        const estado_anterior = juego.validado;

        // Actualizamos el estado de validación del juego.
        await conn.query(
            `UPDATE juegos SET validado = ? WHERE codigo = ?`,
            [nuevoEstado, codigo]
        );

        // Registramos el cambio en el historial (quién y de qué estado a qué estado).
        await conn.query(
            `INSERT INTO historial_validacion (juego_id, estado_anterior, estado_nuevo, cambiado_por)
             VALUES (?, ?, ?, ?)`,
            [juego.id, estado_anterior, nuevoEstado, cambiado_por]
        );

        await conn.commit();

        // Avisamos al autor por correo según el resultado, solo si el estado cambió.
        try {
            if (nuevoEstado === 1 && estado_anterior !== 1) {
                const asunto = '¡Tu juego ha sido validado!';
                const cuerpo =
                    `Hola,\n\n` +
                    `Tu actividad "${juego.titulo}" (código: ${codigo}) ha sido validado ` +
                    `y ya está disponible.\n\n` +
                    `¡Que tenga un buen día!`;
                await enviarCorreo(juego.correo_autor, asunto, cuerpo);
            } else if (nuevoEstado === 2 && estado_anterior !== 2) {
                const asunto = 'Tu actividad ha sido rechazada';
                const cuerpo =
                    `Hola,\n\n` +
                    `Tu actividad "${juego.titulo}" (código: ${codigo}) ha sido rechazada ` +
                    `por un usuario validado.\n\n` +
                    `¡Que tenga un buen día!`;
                await enviarCorreo(juego.correo_autor, asunto, cuerpo);
            }
        } catch (mailError) {
            console.error('Error al enviar correo de validación:', mailError);
        }

        res.json({ mensaje: 'Validación actualizada' });

    } catch (error) {
        await conn.rollback();
        res.status(500).json({ error: error.message });
    } finally {
        conn.release();
    }
};

// ── Obtener Historial de Validación ────────────────────────────────────────
// Devuelve todos los cambios de validación de un juego, del más reciente al más antiguo.
exports.obtenerHistorialValidacion = async (req, res) => {
    try {
        const { codigo } = req.params;

        // Buscamos el id del juego a partir de su código.
        const [juegos] = await req.mysqlDB.query(
            `SELECT id FROM juegos WHERE codigo = ?`,
            [codigo]
        );

        if (juegos.length === 0) {
            return res.status(404).json({ error: 'Juego no encontrado' });
        }

        // Traemos su historial ordenado por fecha descendente.
        const [historial] = await req.mysqlDB.query(
            `SELECT * FROM historial_validacion WHERE juego_id = ? ORDER BY cambiado_el DESC`,
            [juegos[0].id]
        );

        res.json(historial);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Crear nueva categoría
 * POST /api/categorias
 * Body: { categoria: "Nombre de la categoría" }
 */
exports.crearCategoria = async (req, res) => {
    try {
        const db = req.mysqlDB;
        const { categoria } = req.body;

        // El nombre no puede estar vacío.
        if (!categoria || !categoria.trim()) {
            return res.status(400).json({ error: 'El nombre de la categoría es requerido' });
        }

        // Comprobamos que no exista ya una categoría con ese nombre.
        const [[existe]] = await db.query(
            `SELECT id FROM categorias WHERE categoria = ?`,
            [categoria.trim()]
        );

        if (existe) {
            return res.status(409).json({ error: 'La categoría ya existe' });
        }

        const [resultado] = await db.query(
            `INSERT INTO categorias (categoria) VALUES (?)`,
            [categoria.trim()]
        );

        res.status(201).json({
            mensaje: 'Categoría creada',
            id: resultado.insertId,
            categoria: categoria.trim()
        });

    } catch (error) {
        console.error('Error al crear categoría:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Actualizar categoría
 * PUT /api/categorias/:id
 * Body: { categoria: "Nuevo nombre" }
 */
exports.actualizarCategoria = async (req, res) => {
    try {
        const db = req.mysqlDB;
        const { categoria } = req.body;
        const { id } = req.params;

        if (!categoria || !categoria.trim()) {
            return res.status(400).json({ error: 'El nombre de la categoría es requerido' });
        }

        // Comprobamos que la categoría a editar exista.
        const [[existe]] = await db.query(
            `SELECT id FROM categorias WHERE id = ?`,
            [id]
        );

        if (!existe) {
            return res.status(404).json({ error: 'Categoría no encontrada' });
        }

        // Comprobamos que el nuevo nombre no choque con otra categoría distinta.
        const [[duplicada]] = await db.query(
            `SELECT id FROM categorias WHERE categoria = ? AND id != ?`,
            [categoria.trim(), id]
        );

        if (duplicada) {
            return res.status(409).json({ error: 'Ya existe otra categoría con ese nombre' });
        }

        await db.query(
            `UPDATE categorias SET categoria = ? WHERE id = ?`,
            [categoria.trim(), id]
        );

        res.json({
            mensaje: 'Categoría actualizada',
            id,
            categoria: categoria.trim()
        });

    } catch (error) {
        console.error('Error al actualizar categoría:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Contar juegos asociados a una categoría
 * GET /api/categorias/:id/juegos-count
 * Devuelve el número de juegos que se eliminarán en cascada
 */
exports.contarJuegosPorCategoria = async (req, res) => {
    try {
        const db = req.mysqlDB;
        const { id } = req.params;

        // COUNT(*) cuenta cuántos juegos usan esta categoría.
        const [[resultado]] = await db.query(
            `SELECT COUNT(*) as count FROM juegos WHERE categoria_id = ?`,
            [id]
        );

        res.json({ count: resultado.count });

    } catch (error) {
        console.error('Error al contar juegos:', error);
        res.status(500).json({ error: error.message });
    }
};


exports.eliminarCategoria = async (req, res) => {
    const db = req.mysqlDB;
    const conn = await db.getConnection();
    try {
        const { id } = req.params;

        // Comprobamos que la categoría exista.
        const [[existe]] = await conn.query(
            `SELECT id FROM categorias WHERE id = ?`,
            [id]
        );

        if (!existe) {
            return res.status(404).json({ error: 'Categoría no encontrada' });
        }

        await conn.beginTransaction();

        // Obtenemos los juegos de esta categoría para borrar también su contenido.
        const [juegosAsociados] = await conn.query(
            `SELECT id, tipo_id FROM juegos WHERE categoria_id = ?`,
            [id]
        );

        for (const juego of juegosAsociados) {
            switch (juego.clave) {
                case 'verdadero_falso':
                    await conn.query(`DELETE FROM vf_preguntas WHERE juego_id = ?`, [juego.id]);
                    break;
                case 'unir_conceptos':
                    await conn.query(`DELETE FROM uc_parejas WHERE juego_id = ?`, [juego.id]);
                    break;
                case 'rellenar_frase':
                    await conn.query(`DELETE FROM rf_preguntas WHERE juego_id = ?`, [juego.id]);
                    break;
                case 'conversacion':
                    // Primero las opciones de cada diálogo...
                    const [dialogos] = await conn.query(
                        `SELECT id FROM conv_dialogos WHERE juego_id = ?`,
                        [juego.id]
                    );
                    const dialogoIds = dialogos.map(d => d.id);
                    if (dialogoIds.length > 0) {
                        await conn.query(
                            `DELETE FROM conv_opciones WHERE dialogo_id IN (?)`,
                            [dialogoIds]
                        );
                    }
                    // ...luego los diálogos...
                    await conn.query(`DELETE FROM conv_dialogos WHERE juego_id = ?`, [juego.id]);
                    // ...y por último puntuadores y despedida.
                    await conn.query(`DELETE FROM conv_puntuadores WHERE juego_id = ?`, [juego.id]);
                    await conn.query(`DELETE FROM conv_despedida WHERE juego_id = ?`, [juego.id]);
                    break;
            }
        }

        // Borramos el historial de validación de todos esos juegos.
        const [idsJuegos] = await conn.query(
            `SELECT id FROM juegos WHERE categoria_id = ?`,
            [id]
        );
        const idsArray = idsJuegos.map(j => j.id);
        if (idsArray.length > 0) {
            await conn.query(
                `DELETE FROM historial_validacion WHERE juego_id IN (?)`,
                [idsArray]
            );
        }

        // Borramos los juegos de la categoría.
        await conn.query(`DELETE FROM juegos WHERE categoria_id = ?`, [id]);

        // Y finalmente la categoría.
        await conn.query(`DELETE FROM categorias WHERE id = ?`, [id]);

        await conn.commit();

        res.json({
            mensaje: `Categoría eliminada. Se elimináron ${juegosAsociados.length} juego(s) relacionado(s)`,
            juegosEliminados: juegosAsociados.length
        });

    } catch (error) {
        await conn.rollback();
        console.error('Error al eliminar categoría:', error);
        res.status(500).json({ error: error.message });
    } finally {
        conn.release();
    }
};