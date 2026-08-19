const { ObjectId } = require('mongodb');
// bcrypt sirve para cifrar (hashear) las contraseñas y compararlas de forma segura.
const bcrypt = require('bcrypt');
// Servicio de correo, usado para enviar el email de bienvenida.
const { enviarCorreo } = require('../services/emailService');

// ==================== CRUD USUARIOS NORMALES ====================

// ── Crear un usuario normal ───────────────────────────────────────────────────
exports.crearUsuario = async (req, res) => {
    try {
        const { nombre, email, password } = req.body;

        // Los tres campos son obligatorios.
        if (!nombre || !email || !password) {
            return res.status(400).json({ error: 'Faltan campos requeridos' });
        }

        const db = await req.mongoDB();
        const usuarios = db.collection('usuarios');

        // No permitimos dos usuarios con el mismo email.
        const existente = await usuarios.findOne({ email });
        if (existente) {
            return res.status(409).json({ error: 'El usuario ya existe' });
        }

        // Ciframos la contraseña antes de guardarla (nunca se guarda en texto plano).
        const passwordHasheado = await bcrypt.hash(password, 10);

        const nuevoUsuario = {
            nombre,
            email,
            password: passwordHasheado,
            createdAt: new Date()
        };

        const resultado = await usuarios.insertOne(nuevoUsuario);
        res.status(201).json({
            mensaje: 'Usuario creado exitosamente',
            usuarioId: resultado.insertedId
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ── Obtener todos los usuarios ────────────────────────────────────────────────
exports.obtenerUsuarios = async (req, res) => {
    try {
        const db = await req.mongoDB();
        const usuarios = db.collection('usuarios');
        // Ojo: aquí se devuelven todos los campos, incluida la contraseña hasheada.
        const listaUsuarios = await usuarios.find({}).toArray();
        res.json(listaUsuarios);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ── Obtener un usuario por su id ──────────────────────────────────────────────
exports.obtenerUsuarioPorId = async (req, res) => {
    try {
        const db = await req.mongoDB();
        const usuarios = db.collection('usuarios');

        // projection password: 0 → no devolvemos la contraseña.
        const usuario = await usuarios.findOne(
            { _id: new ObjectId(req.params.id) },
            { projection: { password: 0 } }
        );

        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json(usuario);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ── Actualizar un usuario ─────────────────────────────────────────────────────
exports.actualizarUsuario = async (req, res) => {
    try {
        const { nombre, email, password, imagenPerfil, descripcion } = req.body;
        const db = await req.mongoDB();
        const usuarios = db.collection('usuarios');

        // Construimos el objeto de actualización solo con los campos que llegan.
        const actualizacion = {};
        if (nombre) actualizacion.nombre = nombre;
        if (email) actualizacion.email = email;
        // Si cambia la contraseña, la volvemos a hashear.
        if (password) actualizacion.password = await bcrypt.hash(password, 10);
        if (imagenPerfil !== undefined) actualizacion.imagenPerfil = imagenPerfil;
        if (descripcion !== undefined) actualizacion.descripcion = descripcion;
        actualizacion.updatedAt = new Date();

        const resultado = await usuarios.updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: actualizacion }
        );

        if (resultado.matchedCount === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json({ mensaje: 'Usuario actualizado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ── Iniciar sesión (login) ────────────────────────────────────────────────────
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email y contraseña son requeridos' });
        }

        const db = await req.mongoDB();
        const usuarios = db.collection('usuarios');

        // Buscamos al usuario por email.
        const usuario = await usuarios.findOne({ email });

        // Si no existe, damos un error genérico (no decimos si falla email o contraseña).
        if (!usuario) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Comparamos la contraseña recibida con el hash guardado.
        const passwordValido = await bcrypt.compare(password, usuario.password);
        if (!passwordValido) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Quitamos la contraseña del objeto antes de devolverlo.
        const { password: _, ...usuarioSinPassword } = usuario;
        res.json(usuarioSinPassword);
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// ==================== ACCESO COLABORAR ====================

/**
 * Verificar si un usuario tiene acceso al área de colaboración.
 * Acceso concedido si: validado === true  OR  admin === true
 *
 * GET /api/usuarios/verificar-acceso-colaborar/:id
 *
 * Respuesta OK  → { tieneAcceso: true, rol: 'admin'|'validado' }
 * Respuesta 403 → { tieneAcceso: false, error: '...' }
 */
exports.verificarAccesoColaborar = async (req, res) => {
    try {
        const db = await req.mongoDB();
        const usuarios = db.collection('usuarios');

        const usuario = await usuarios.findOne(
            { _id: new ObjectId(req.params.id) },
            { projection: { password: 0 } }
        );

        if (!usuario) {
            return res.status(404).json({ tieneAcceso: false, error: 'Usuario no encontrado' });
        }

        // Un administrador siempre tiene acceso.
        if (usuario.admin === true) {
            return res.json({ tieneAcceso: true, rol: 'admin' });
        }

        // Un usuario validado también tiene acceso.
        if (usuario.validado === true) {
            return res.json({ tieneAcceso: true, rol: 'validado' });
        }

        // En cualquier otro caso, denegamos el acceso.
        return res.status(403).json({
            tieneAcceso: false,
            error: 'Acceso denegado. Necesitas ser usuario validado o administrador.'
        });
    } catch (error) {
        console.error('Error al verificar acceso colaborar:', error);
        res.status(500).json({ tieneAcceso: false, error: 'Error interno del servidor' });
    }
};

// ==================== CRUD USUARIOS VALIDADOS ====================

/**
 * Crear usuario validado
 * Se crea directamente con validado: true
 */
exports.crearUsuarioValidado = async (req, res) => {
    try {
        const { nombre, email, password, imagenPerfil, descripcion } = req.body;

        if (!nombre || !email || !password) {
            return res.status(400).json({ error: 'Faltan campos requeridos (nombre, email, password)' });
        }

        const db = await req.mongoDB();
        const usuarios = db.collection('usuarios');

        const existente = await usuarios.findOne({ email });
        if (existente) {
            return res.status(409).json({ error: 'El usuario ya existe' });
        }

        const passwordHasheado = await bcrypt.hash(password, 10);

        // Se crea ya con validado: true para que tenga permisos de colaboración.
        const nuevoUsuario = {
            nombre,
            email,
            password: passwordHasheado,
            imagenPerfil: imagenPerfil || null,
            descripcion: descripcion || null,
            validado: true,
            createdAt: new Date()
        };

        const resultado = await usuarios.insertOne(nuevoUsuario);

        // Enviar correo de bienvenida con los datos de la cuenta.
        try {
            const asunto = 'Bienvenido/a - Datos de tu cuenta';
            const cuerpo =
                `Hola ${nombre},\n\n` +
                `Tu cuenta ha sido creada y validada correctamente. Estos son tus datos de acceso:\n\n` +
                `Email: ${email}\n` +
                `Contraseña: ${password}\n\n` +
                `Por seguridad, te recomendamos cambiar la contraseña tras tu primer inicio de sesión.\n\n` +
                `¡Que tenga un gran día!.`;

            await enviarCorreo(email, asunto, cuerpo);
        } catch (mailError) {
            console.error('Error al enviar correo de bienvenida:', mailError);
            // No bloqueamos la creación del usuario si falla el envío del correo.
        }

        res.status(201).json({
            mensaje: 'Usuario validado creado exitosamente',
            usuarioId: resultado.insertedId
        });
    } catch (error) {
        console.error('Error al crear usuario validado:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Obtener todos los usuarios validados
 */
exports.obtenerUsuariosValidados = async (req, res) => {
    try {
        const db = await req.mongoDB();
        const usuarios = db.collection('usuarios');

        // Solo los que tienen validado: true, y sin la contraseña.
        const usuariosValidados = await usuarios.find(
            { validado: true },
            { projection: { password: 0 } }
        ).toArray();

        res.json(usuariosValidados);
    } catch (error) {
        console.error('Error al obtener usuarios validados:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Obtener usuario validado por ID
 */
exports.obtenerUsuarioValidadoPorId = async (req, res) => {
    try {
        const db = await req.mongoDB();
        const usuarios = db.collection('usuarios');

        // Debe coincidir el id Y estar validado.
        const usuario = await usuarios.findOne(
            { _id: new ObjectId(req.params.id), validado: true },
            { projection: { password: 0 } }
        );

        if (!usuario) {
            return res.status(404).json({ error: 'Usuario validado no encontrado' });
        }

        res.json(usuario);
    } catch (error) {
        console.error('Error al obtener usuario validado:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Actualizar usuario validado
 */
exports.actualizarUsuarioValidado = async (req, res) => {
    try {
        const { nombre, email, password, imagenPerfil, descripcion } = req.body;
        const db = await req.mongoDB();
        const usuarios = db.collection('usuarios');

        // Igual que actualizarUsuario, solo se tocan los campos que llegan.
        const actualizacion = {};
        if (nombre) actualizacion.nombre = nombre;
        if (email) actualizacion.email = email;
        if (password) actualizacion.password = await bcrypt.hash(password, 10);
        if (imagenPerfil !== undefined) actualizacion.imagenPerfil = imagenPerfil;
        if (descripcion !== undefined) actualizacion.descripcion = descripcion;
        actualizacion.updatedAt = new Date();

        // El filtro exige que el usuario esté validado.
        const resultado = await usuarios.updateOne(
            { _id: new ObjectId(req.params.id), validado: true },
            { $set: actualizacion }
        );

        if (resultado.matchedCount === 0) {
            return res.status(404).json({ error: 'Usuario validado no encontrado' });
        }

        res.json({ mensaje: 'Usuario validado actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar usuario validado:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Eliminar usuario validado
 */
exports.eliminarUsuarioValidado = async (req, res) => {
    try {
        const db = await req.mongoDB();
        const usuarios = db.collection('usuarios');

        // Solo borra si el id corresponde a un usuario validado.
        const resultado = await usuarios.deleteOne({
            _id: new ObjectId(req.params.id),
            validado: true
        });

        if (resultado.deletedCount === 0) {
            return res.status(404).json({ error: 'Usuario validado no encontrado' });
        }

        res.json({ mensaje: 'Usuario validado eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar usuario validado:', error);
        res.status(500).json({ error: error.message });
    }
};

// ── Comprobar si un email ya está registrado ──────────────────────────────────
exports.verificarEmailExiste = async (req, res) => {
    try {
        const db = await req.mongoDB();
        const usuarios = db.collection('usuarios');

        const usuario = await usuarios.findOne({ email: req.params.email });

        // !!usuario convierte el resultado en true/false (existe o no).
        res.json({ existe: !!usuario });
    } catch (error) {
        console.error('Error al verificar email:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// ==================== VIDAS Y RACHA (mecánica del juego) ====================

// ── Obtener las vidas y la racha de un usuario ────────────────────────────────
exports.obtenerVidas = async (req, res) => {
    try {
        const db = await req.mongoDB();
        const usuarios = db.collection('usuarios');
        const id = new ObjectId(req.params.id);

        let usuario = await usuarios.findOne({ _id: id });
        if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

        const hoy = HOY();
        const sets = {};

        // Si es la primera vez o ha cambiado el día, reiniciamos las vidas a 5.
        // (La racha no se toca aquí.)
        if (usuario.vidas === undefined || usuario.ultimaConexion !== hoy) {
            sets.vidas = 5;
            sets.ultimaConexion = hoy;
        }
        // Si nunca tuvo racha, la inicializamos a 0.
        if (usuario.racha === undefined) {
            sets.racha = 0;
        }

        // Solo escribimos en la BD si hay algo que cambiar.
        if (Object.keys(sets).length > 0) {
            await usuarios.updateOne({ _id: id }, { $set: sets });
            usuario = { ...usuario, ...sets };
        }

        res.json({ vidas: usuario.vidas, racha: usuario.racha });
    } catch (error) {
        console.error('Error en obtenerVidas:', error);
        res.status(500).json({ error: error.message });
    }
};

// ── Restar una (o dos) vidas al usuario ───────────────────────────────────────
exports.perderVida = async (req, res) => {
    try {
        const db = await req.mongoDB();
        const usuarios = db.collection('usuarios');
        const id = new ObjectId(req.params.id);
        const { tipo } = req.body;

        // Una conversación cuesta 2 vidas; cualquier otro tipo, 1.
        const coste = tipo === 'conversacion' ? 2 : 1;

        // findOneAndUpdate atómico: resta el coste pero nunca baja de 0, sin tocar la racha.
        const result = await usuarios.findOneAndUpdate(
            { _id: id },
            [
                {
                    $set: {
                        vidas: {
                            // Si vidas no existe, parte de 5; el resultado nunca es menor que 0.
                            $max: [0, { $subtract: [{ $ifNull: ['$vidas', 5] }, coste] }]
                        }
                    }
                }
            ],
            { returnDocument: 'after' } // devuelve el documento ya actualizado
        );

        if (!result) return res.status(404).json({ error: 'Usuario no encontrado' });

        res.json({ vidas: result.vidas, racha: result.racha ?? 0 });
    } catch (error) {
        console.error('Error en perderVida:', error);
        res.status(500).json({ error: error.message });
    }
};

// Devuelve la fecha de hoy en formato 'AAAA-MM-DD' (sin la hora).
const HOY = () => new Date().toISOString().slice(0, 10);

// ── Sumar 1 a la racha del usuario ────────────────────────────────────────────
exports.incrementarRacha = async (req, res) => {
    try {
        const db = await req.mongoDB();
        const usuarios = db.collection('usuarios');
        const id = new ObjectId(req.params.id);

        // $inc atómico: suma 1 a la racha sin tocar las vidas.
        const result = await usuarios.findOneAndUpdate(
            { _id: id },
            { $inc: { racha: 1 } },
            { returnDocument: 'after' }
        );

        if (!result) return res.status(404).json({ error: 'Usuario no encontrado' });

        res.json({ vidas: result.vidas ?? 5, racha: result.racha });
    } catch (error) {
        console.error('Error en incrementarRacha:', error);
        res.status(500).json({ error: error.message });
    }
};

// ==================== CORREOS CONTACTADOS ====================

// ── Añadir un email a la lista de contactos del usuario ───────────────────────
exports.agregarContactoEmail = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Falta el campo email' });
        }

        const db = await req.mongoDB();
        const usuarios = db.collection('usuarios');
        const id = new ObjectId(req.params.id);

        // $addToSet añade el email solo si no estaba ya (evita duplicados).
        await usuarios.updateOne(
            { _id: id },
            { $addToSet: { correosContactados: email } }
        );

        // Volvemos a leer solo la lista de correos para devolverla actualizada.
        const usuario = await usuarios.findOne(
            { _id: id },
            { projection: { correosContactados: 1 } }
        );

        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json({ correosContactados: usuario.correosContactados || [] });
    } catch (error) {
        console.error('Error en agregarContactoEmail:', error);
        res.status(500).json({ error: error.message });
    }
};

// ── Quitar un email de la lista de contactos del usuario ──────────────────────
exports.eliminarContactoEmail = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Falta el campo email' });
        }

        const db = await req.mongoDB();
        const usuarios = db.collection('usuarios');
        const id = new ObjectId(req.params.id);

        // $pull elimina ese email del array correosContactados.
        await usuarios.updateOne(
            { _id: id },
            { $pull: { correosContactados: email } }
        );

        const usuario = await usuarios.findOne(
            { _id: id },
            { projection: { correosContactados: 1 } }
        );

        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json({ correosContactados: usuario.correosContactados || [] });
    } catch (error) {
        console.error('Error en eliminarContactoEmail:', error);
        res.status(500).json({ error: error.message });
    }
};