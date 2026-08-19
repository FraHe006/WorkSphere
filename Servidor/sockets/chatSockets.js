const { ObjectId } = require('mongodb');

// Array global de usuarios conectados
const usuarios = [];

function configurarSockets(io, mongoDB) {
    io.on("connection", (socket) => {
        console.log(`Nueva conexión: ${socket.id}`);

        const nuevoUsuario = {
            id: socket.id,
            nombre: "Anónimo",
            usuarioId: null,
            conversacionActiva: null
        };

        usuarios.push(nuevoUsuario);

        // Autenticación
        socket.on("autenticar", async (usuarioId) => {
            try {
                const db = await mongoDB();
                const usuariosDB = db.collection('usuarios');
                const usuario = await usuariosDB.findOne({ _id: new ObjectId(usuarioId) });

                if (usuario) {
                    nuevoUsuario.usuarioId = usuarioId;
                    nuevoUsuario.nombre = usuario.nombre;

                    socket.emit("autenticado", {
                        nombre: usuario.nombre,
                        usuarioId: usuarioId
                    });

                    console.log(`Usuario autenticado: ${usuario.nombre} (${usuarioId})`);
                } else {
                    socket.emit("error autenticacion", "Usuario no encontrado");
                }
            } catch (error) {
                console.error("Error al autenticar:", error);
                socket.emit("error autenticacion", "Error al autenticar");
            }
        });

        // Iniciar conversación
        socket.on("iniciar conversacion", async (data) => {
            try {
                const { conversacionId, participanteId } = data;
                const db = await mongoDB();
                const conversaciones = db.collection('conversaciones');

                if (conversacionId) {
                    const conversacion = await conversaciones.findOne({
                        _id: new ObjectId(conversacionId)
                    });

                    if (conversacion) {
                        nuevoUsuario.conversacionActiva = conversacionId;
                        socket.join(conversacionId);

                        socket.emit("conversacion iniciada", {
                            conversacionId: conversacionId,
                            mensajes: conversacion.mensajes
                        });

                        console.log(`${nuevoUsuario.nombre} se unió a conversación ${conversacionId}`);
                    }
                } else if (participanteId && nuevoUsuario.usuarioId) {
                    let conversacion = await conversaciones.findOne({
                        participantes: {
                            $all: [nuevoUsuario.usuarioId, participanteId],
                            $size: 2
                        }
                    });

                    if (!conversacion) {
                        const nuevaConv = {
                            participantes: [nuevoUsuario.usuarioId, participanteId],
                            titulo: 'Conversación privada',
                            mensajes: [],
                            createdAt: new Date(),
                            updatedAt: new Date()
                        };
                        const resultado = await conversaciones.insertOne(nuevaConv);
                        conversacion = { ...nuevaConv, _id: resultado.insertedId };
                    }

                    nuevoUsuario.conversacionActiva = conversacion._id.toString();
                    socket.join(nuevoUsuario.conversacionActiva);

                    socket.emit("conversacion iniciada", {
                        conversacionId: conversacion._id,
                        mensajes: conversacion.mensajes
                    });

                    console.log(`Conversación iniciada: ${nuevoUsuario.conversacionActiva}`);
                }
            } catch (error) {
                console.error("Error al iniciar conversación:", error);
                socket.emit("error conversacion", "Error al iniciar conversación");
            }
        });

        // Enviar mensaje
        socket.on("mensaje cliente", async (mensaje) => {
            if (!mensaje || !mensaje.trim()) return;

            if (!nuevoUsuario.conversacionActiva) {
                socket.emit("servidor aviso", "No estás en ninguna conversación");
                return;
            }

            if (!nuevoUsuario.usuarioId) {
                socket.emit("servidor aviso", "Debes autenticarte primero");
                return;
            }

            const msg = mensaje.trim();

            try {
                const db = await mongoDB();
                const conversaciones = db.collection('conversaciones');

                const nuevoMensaje = {
                    id: new ObjectId(),
                    usuarioId: nuevoUsuario.usuarioId,
                    nombreUsuario: nuevoUsuario.nombre,
                    texto: msg,
                    timestamp: new Date()
                };

                await conversaciones.updateOne(
                    { _id: new ObjectId(nuevoUsuario.conversacionActiva) },
                    {
                        $push: { mensajes: nuevoMensaje },
                        $set: { updatedAt: new Date() }
                    }
                );

                io.to(nuevoUsuario.conversacionActiva).emit("mensaje servidor", {
                    id: nuevoMensaje.id.toString(),
                    usuarioId: nuevoMensaje.usuarioId,
                    usuario: nuevoMensaje.nombreUsuario,
                    texto: msg,
                    timestamp: nuevoMensaje.timestamp
                });

                console.log(`💬 [${nuevoUsuario.conversacionActiva}] ${nuevoUsuario.nombre}: ${msg}`);
            } catch (error) {
                console.error("Error al guardar mensaje:", error);
                socket.emit("servidor aviso", "Error al enviar mensaje");
            }
        });

        // Obtener historial
        socket.on("obtener historial", async (conversacionId) => {
            try {
                const db = await mongoDB();
                const conversaciones = db.collection('conversaciones');

                const conversacion = await conversaciones.findOne({
                    _id: new ObjectId(conversacionId)
                });

                if (conversacion) {
                    socket.emit("historial mensajes", conversacion.mensajes);
                } else {
                    socket.emit("servidor aviso", "Conversación no encontrada");
                }
            } catch (error) {
                console.error("Error al obtener historial:", error);
                socket.emit("servidor aviso", "Error al obtener historial");
            }
        });

        // Salir de conversación
        socket.on("salir conversacion", () => {
            if (nuevoUsuario.conversacionActiva) {
                socket.leave(nuevoUsuario.conversacionActiva);
                console.log(`${nuevoUsuario.nombre} salió de conversación ${nuevoUsuario.conversacionActiva}`);
                nuevoUsuario.conversacionActiva = null;
            }
        });

        // Obtener usuarios online
        socket.on("obtener usuarios online", () => {
            const usuariosOnline = usuarios
                .filter(u => u.usuarioId !== null)
                .map(u => ({
                    id: u.usuarioId,
                    nombre: u.nombre
                }));

            socket.emit("usuarios online", usuariosOnline);
        });

        // Desconexión
        socket.on("disconnect", () => {
            const index = usuarios.findIndex(u => u.id === socket.id);
            if (index !== -1) {
                const usuarioDesconectado = usuarios.splice(index, 1)[0];
                console.log(`${usuarioDesconectado.nombre} se ha desconectado. Quedan: ${usuarios.length}`);

                if (usuarioDesconectado.usuarioId) {
                    io.emit("usuario desconectado", {
                        usuarioId: usuarioDesconectado.usuarioId,
                        nombre: usuarioDesconectado.nombre
                    });
                }
            }
        });
    });
}

module.exports = { configurarSockets };