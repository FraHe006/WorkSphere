const { ObjectId } = require('mongodb');

// ── Crear una conversación con una lista de participantes ─────────────────────
exports.crearConversacion = async (req, res) => {
    try {
        const { participantes, titulo } = req.body;

        // Hacen falta al menos 2 participantes para una conversación.
        if (!participantes || !Array.isArray(participantes) || participantes.length < 2) {
            return res.status(400).json({ error: 'Se requieren al menos 2 participantes' });
        }

        const db = await req.mongoDB();
        const conversaciones = db.collection('conversaciones');

        // Si ya existe una conversación con esos participantes, no creamos otra.
        const conversacionExistente = await conversaciones.findOne({
            participantes: { $all: participantes }
        });

        if (conversacionExistente) {
            return res.json({
                mensaje: 'Conversación ya existe',
                conversacionId: conversacionExistente._id
            });
        }

        // Creamos la conversación vacía (sin mensajes todavía).
        const nuevaConversacion = {
            participantes,
            titulo: titulo || 'Conversación',
            mensajes: [],
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const resultado = await conversaciones.insertOne(nuevaConversacion);
        res.status(201).json({
            mensaje: 'Conversación creada',
            conversacionId: resultado.insertedId
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ── Obtener todas las conversaciones de un usuario (una por cada amigo) ────────
exports.obtenerConversacionesUsuario = async (req, res) => {
    try {
        const db = await req.mongoDB();
        const conversaciones = db.collection('conversaciones');
        const amistades = db.collection('amistades');
        const usuarios = db.collection('usuarios');

        console.log('Cargando conversaciones para usuario:', req.params.usuarioId);

        // Primero buscamos las amistades aceptadas del usuario.
        const amistadesList = await amistades.find({
            $or: [
                { remitenteId: req.params.usuarioId, estado: 'aceptada' },
                { destinatarioId: req.params.usuarioId, estado: 'aceptada' }
            ]
        }).toArray();

        // Sacamos el id de cada amigo (el participante que no es el propio usuario).
        const idsAmigos = amistadesList.map(amistad =>
            amistad.remitenteId === req.params.usuarioId
                ? amistad.destinatarioId
                : amistad.remitenteId
        );

        // Si no tiene amigos, devolvemos una lista vacía.
        if (idsAmigos.length === 0) {
            return res.json([]);
        }

        // Para cada amigo, buscamos su conversación; si no existe, la creamos.
        const conversacionesConAmigos = await Promise.all(
            idsAmigos.map(async (amigoId) => {
                let conversacion = await conversaciones.findOne({
                    participantes: { $all: [req.params.usuarioId, amigoId], $size: 2 }
                });

                // Si aún no había conversación con este amigo, la creamos vacía.
                if (!conversacion) {
                    const nuevaConv = {
                        participantes: [req.params.usuarioId, amigoId],
                        titulo: 'Conversación privada',
                        mensajes: [],
                        createdAt: new Date(),
                        updatedAt: new Date()
                    };
                    const resultado = await conversaciones.insertOne(nuevaConv);
                    conversacion = { ...nuevaConv, _id: resultado.insertedId };
                }

                // Buscamos al amigo para usar su nombre como título de la conversación.
                const amigo = await usuarios.findOne(
                    { _id: new ObjectId(amigoId) },
                    { projection: { password: 0 } }
                );

                return {
                    ...conversacion,
                    titulo: amigo ? amigo.nombre : 'Usuario'
                };
            })
        );

        // Ordenamos las conversaciones de la más reciente a la más antigua.
        conversacionesConAmigos.sort((a, b) =>
            new Date(b.updatedAt) - new Date(a.updatedAt)
        );

        res.json(conversacionesConAmigos);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// ── Obtener una conversación concreta por su id ───────────────────────────────
exports.obtenerConversacionPorId = async (req, res) => {
    try {
        const db = await req.mongoDB();
        const conversaciones = db.collection('conversaciones');

        const conversacion = await conversaciones.findOne({
            _id: new ObjectId(req.params.id)
        });

        if (!conversacion) {
            return res.status(404).json({ error: 'Conversación no encontrada' });
        }

        res.json(conversacion);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ── Agregar un mensaje a una conversación ─────────────────────────────────────
exports.agregarMensaje = async (req, res) => {
    try {
        const { usuarioId, nombreUsuario, texto } = req.body;
        const db = await req.mongoDB();
        const conversaciones = db.collection('conversaciones');

        // Construimos el mensaje con un id propio y la fecha actual.
        const mensaje = {
            id: new ObjectId(),
            usuarioId,
            nombreUsuario,
            texto,
            timestamp: new Date()
        };

        // Añadimos el mensaje al array "mensajes" y actualizamos la fecha de la conversación.
        const resultado = await conversaciones.updateOne(
            { _id: new ObjectId(req.params.id) },
            {
                $push: { mensajes: mensaje },
                $set: { updatedAt: new Date() }
            }
        );

        // Si no se encontró la conversación, avisamos.
        if (resultado.matchedCount === 0) {
            return res.status(404).json({ error: 'Conversación no encontrada' });
        }

        res.status(201).json({ mensaje: 'Mensaje agregado', mensajeId: mensaje.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ── Actualizar el título de una conversación ──────────────────────────────────
exports.actualizarConversacion = async (req, res) => {
    try {
        const { titulo } = req.body;
        const db = await req.mongoDB();
        const conversaciones = db.collection('conversaciones');

        const resultado = await conversaciones.updateOne(
            { _id: new ObjectId(req.params.id) },
            {
                $set: {
                    titulo,
                    updatedAt: new Date()
                }
            }
        );

        if (resultado.matchedCount === 0) {
            return res.status(404).json({ error: 'Conversación no encontrada' });
        }

        res.json({ mensaje: 'Conversación actualizada' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ── Eliminar una conversación ─────────────────────────────────────────────────
exports.eliminarConversacion = async (req, res) => {
    try {
        const db = await req.mongoDB();
        const conversaciones = db.collection('conversaciones');

        const resultado = await conversaciones.deleteOne({
            _id: new ObjectId(req.params.id)
        });

        if (resultado.deletedCount === 0) {
            return res.status(404).json({ error: 'Conversación no encontrada' });
        }

        res.json({ mensaje: 'Conversación eliminada' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ── Buscar la conversación entre dos usuarios o crearla si no existe ───────────
exports.buscarOCrearConversacion = async (req, res) => {
    try {
        const { usuario1Id, usuario2Id } = req.body;

        // Hacen falta los dos usuarios.
        if (!usuario1Id || !usuario2Id) {
            return res.status(400).json({ error: 'Se requieren ambos IDs de usuario' });
        }

        const db = await req.mongoDB();
        const conversaciones = db.collection('conversaciones');

        // Buscamos una conversación que tenga exactamente a esos dos participantes.
        const conversacionExistente = await conversaciones.findOne({
            participantes: { $all: [usuario1Id, usuario2Id], $size: 2 }
        });

        // Si existe, la devolvemos tal cual.
        if (conversacionExistente) {
            return res.json({
                mensaje: 'Conversación encontrada',
                conversacionId: conversacionExistente._id,
                conversacion: conversacionExistente
            });
        }

        // Si no existe, creamos una nueva conversación privada.
        const nuevaConversacion = {
            participantes: [usuario1Id, usuario2Id],
            titulo: 'Conversación privada',
            mensajes: [],
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const resultado = await conversaciones.insertOne(nuevaConversacion);

        res.status(201).json({
            mensaje: 'Conversación creada',
            conversacionId: resultado.insertedId,
            conversacion: nuevaConversacion
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};