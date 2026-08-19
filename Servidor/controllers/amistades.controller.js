// ObjectId convierte un id en texto al tipo que MongoDB usa internamente.
const { ObjectId } = require('mongodb');

// ── Enviar una solicitud de amistad ──────────────────────────────────────────
exports.enviarSolicitud = async (req, res) => {
    try {
        console.log('📨 Solicitud recibida:', req.body);
        // Datos que llegan: quién envía, quién recibe y el motivo.
        const { remitenteId, destinatarioId, razon } = req.body;

        // Validación: hacen falta ambos usuarios.
        if (!remitenteId || !destinatarioId) {
            return res.status(400).json({ error: 'Se requieren ambos IDs' });
        }

        // Validación: la razón debe existir y no estar vacía.
        if (!razon || typeof razon !== 'string' || razon.trim().length === 0) {
            return res.status(400).json({ error: 'Se requiere una razón para la solicitud' });
        }

        // Validación: longitud mínima de la razón.
        if (razon.trim().length < 5) {
            return res.status(400).json({ error: 'La razón debe tener al menos 5 caracteres' });
        }

        // Validación: longitud máxima de la razón.
        if (razon.trim().length > 500) {
            return res.status(400).json({ error: 'La razón no puede exceder 500 caracteres' });
        }

        // No tiene sentido enviarse una solicitud a uno mismo.
        if (remitenteId === destinatarioId) {
            return res.status(400).json({ error: 'No puedes enviarte solicitud a ti mismo' });
        }

        const db = await req.mongoDB();
        const amistades = db.collection('amistades');

        // Comprobamos si ya existe una relación entre estos dos usuarios,
        // sin importar quién fue el remitente y quién el destinatario.
        const existente = await amistades.findOne({
            $or: [
                { remitenteId, destinatarioId },
                { remitenteId: destinatarioId, destinatarioId: remitenteId }
            ]
        });

        // Si ya hay solicitud o amistad, no creamos otra.
        if (existente) {
            return res.status(409).json({ error: 'Ya existe una solicitud o amistad con este usuario' });
        }

        // Creamos la solicitud en estado "pendiente".
        const nuevaSolicitud = {
            remitenteId,
            destinatarioId,
            razon: razon.trim(),
            estado: 'pendiente',
            createdAt: new Date()
        };

        // Guardamos la solicitud y devolvemos su id.
        const resultado = await amistades.insertOne(nuevaSolicitud);
        res.status(201).json({
            mensaje: 'Solicitud enviada',
            solicitudId: resultado.insertedId
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// ── Obtener las solicitudes pendientes que ha recibido un usuario ─────────────
exports.obtenerSolicitudes = async (req, res) => {
    try {
        const db = await req.mongoDB();
        const amistades = db.collection('amistades');
        const usuarios = db.collection('usuarios');

        // Buscamos las solicitudes pendientes dirigidas a este usuario.
        const solicitudes = await amistades.find({
            destinatarioId: req.params.usuarioId,
            estado: 'pendiente'
        }).toArray();

        // Para cada solicitud añadimos los datos del usuario que la envió
        // (sin incluir la contraseña).
        const solicitudesConDatos = await Promise.all(
            solicitudes.map(async (sol) => {
                const remitente = await usuarios.findOne(
                    { _id: new ObjectId(sol.remitenteId) },
                    { projection: { password: 0 } }
                );
                return { ...sol, remitente };
            })
        );

        res.json(solicitudesConDatos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ── Aceptar una solicitud (y crear la conversación privada) ───────────────────
exports.aceptarSolicitud = async (req, res) => {
    try {
        const db = await req.mongoDB();
        const amistades = db.collection('amistades');
        const conversaciones = db.collection('conversaciones');

        // Buscamos la solicitud por su id.
        const solicitud = await amistades.findOne({
            _id: new ObjectId(req.params.solicitudId)
        });

        if (!solicitud) {
            return res.status(404).json({ error: 'Solicitud no encontrada' });
        }

        // Marcamos la solicitud como aceptada y guardamos la fecha.
        await amistades.updateOne(
            { _id: new ObjectId(req.params.solicitudId) },
            { $set: { estado: 'aceptada', aceptadaAt: new Date() } }
        );

        // Comprobamos si ya existe una conversación entre los dos usuarios.
        const conversacionExistente = await conversaciones.findOne({
            participantes: { $all: [solicitud.remitenteId, solicitud.destinatarioId], $size: 2 }
        });

        // Si no existe, creamos una conversación privada vacía para que puedan chatear.
        if (!conversacionExistente) {
            const nuevaConversacion = {
                participantes: [solicitud.remitenteId, solicitud.destinatarioId],
                titulo: 'Conversación privada',
                mensajes: [],
                createdAt: new Date(),
                updatedAt: new Date()
            };
            await conversaciones.insertOne(nuevaConversacion);
        }

        res.json({ mensaje: 'Solicitud aceptada y conversación creada' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// ── Rechazar una solicitud (la borra) ─────────────────────────────────────────
exports.rechazarSolicitud = async (req, res) => {
    try {
        const db = await req.mongoDB();
        const amistades = db.collection('amistades');

        // Borramos directamente la solicitud por su id.
        const resultado = await amistades.deleteOne({
            _id: new ObjectId(req.params.solicitudId)
        });

        // Si no se borró nada, es que no existía.
        if (resultado.deletedCount === 0) {
            return res.status(404).json({ error: 'Solicitud no encontrada' });
        }

        res.json({ mensaje: 'Solicitud rechazada' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ── Obtener la lista de amigos de un usuario ──────────────────────────────────
exports.obtenerAmigos = async (req, res) => {
    try {
        const db = await req.mongoDB();
        const amistades = db.collection('amistades');
        const usuarios = db.collection('usuarios');

        // Buscamos todas las amistades aceptadas donde participa el usuario,
        // ya sea como remitente o como destinatario.
        const amistadesList = await amistades.find({
            $or: [
                { remitenteId: req.params.usuarioId, estado: 'aceptada' },
                { destinatarioId: req.params.usuarioId, estado: 'aceptada' }
            ]
        }).toArray();

        // Para cada amistad obtenemos los datos del "otro" usuario (el amigo).
        const amigos = await Promise.all(
            amistadesList.map(async (amistad) => {
                // El amigo es el que no es el propio usuario.
                const amigoId = amistad.remitenteId === req.params.usuarioId
                    ? amistad.destinatarioId
                    : amistad.remitenteId;

                return await usuarios.findOne(
                    { _id: new ObjectId(amigoId) },
                    { projection: { password: 0 } }
                );
            })
        );

        // Filtramos posibles nulos (usuarios borrados) antes de responder.
        res.json(amigos.filter(a => a !== null));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ── Eliminar una amistad existente ────────────────────────────────────────────
exports.eliminarAmistad = async (req, res) => {
    try {
        const { usuarioId, amigoId } = req.params;
        const db = await req.mongoDB();
        const amistades = db.collection('amistades');

        // Borramos la amistad aceptada entre ambos, en cualquier orden.
        const resultado = await amistades.deleteOne({
            $or: [
                { remitenteId: usuarioId, destinatarioId: amigoId, estado: 'aceptada' },
                { remitenteId: amigoId, destinatarioId: usuarioId, estado: 'aceptada' }
            ]
        });

        if (resultado.deletedCount === 0) {
            return res.status(404).json({ error: 'Amistad no encontrada' });
        }

        res.json({ mensaje: 'Amistad eliminada' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};