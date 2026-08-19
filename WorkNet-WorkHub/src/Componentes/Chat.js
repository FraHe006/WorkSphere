/**
 * COMPONENTE CHAT
 * Funcionalidad principal:
 * Gestión de mensajes en tiempo real mediante Socket.io
 * Lista de conversaciones con búsqueda
 * Interfaz de chat con historial de mensajes y scroll independiente
 * Envío y recepción de mensajes
 * Notificaciones de mensajes nuevos
 * Formato de fechas (hoy, ayer, fecha)
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import io from 'socket.io-client';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const Chat = ({ usuario, onLogout, actualizarTrigger, onMostrarNotificacion }) => {
    // Estados principales
    const [mensaje, setMensaje] = useState('');
    const [mensajes, setMensajes] = useState([]);
    const [conversaciones, setConversaciones] = useState([]);
    const [conversacionActual, setConversacionActual] = useState(null);
    const [busqueda, setBusqueda] = useState('');
    const [nombresUsuarios, setNombresUsuarios] = useState({});

    // Referencias
    const mensajesEndRef = useRef(null);
    const socketRef = useRef(null);
    const fetchingRef = useRef(new Set()); // Evitar peticiones duplicadas simultáneas

    const conversacionActualRef = useRef(null);

    // Función para cargar conversaciones del usuario
    const cargarConversaciones = useCallback(async () => {
        try {
            const res = await fetch(`http://dam2.colexio-karbo.com:6101/api/conversaciones/usuario/${usuario._id}`);
            const data = await res.json();
            setConversaciones(data);
        } catch (err) {
            console.error("Error al cargar conversaciones", err);
        }
    }, [usuario._id]);

    // Función para mostrar notificaciones de mensajes nuevos
    const mostrarNotificacionMensaje = useCallback(async (msg) => {
        if (!onMostrarNotificacion) return;
        if (msg.usuarioId === usuario._id) return;

        if (conversacionActualRef.current === msg.conversacionId) return;

        try {
            const res = await fetch(`http://dam2.colexio-karbo.com:6101/api/usuarios/${msg.usuarioId}`);
            if (res.ok) {
                const userData = await res.json();
                onMostrarNotificacion(userData.nombre || 'Usuario', msg.texto, userData.imagenPerfil || null);
            } else {
                onMostrarNotificacion(msg.nombreUsuario || 'Usuario', msg.texto, null);
            }
        } catch (err) {
            onMostrarNotificacion('Usuario', msg.texto, null);
        }
    }, [onMostrarNotificacion, usuario._id]);

    // Inicialización de Socket.io y eventos
    useEffect(() => {
        socketRef.current = io("http://dam2.colexio-karbo.com:6101");
        socketRef.current.emit('autenticar', usuario._id);

        // socket para cargar conversaciones
        socketRef.current.on('autenticado', () => {
            cargarConversaciones();
        });

        // socket para enviar mensaje al servidor
        socketRef.current.on('mensaje servidor', (msg) => {
            setMensajes(prev => [...prev, { ...msg, esPropio: msg.usuarioId === usuario._id }]);
            cargarConversaciones();
            if (msg.usuarioId !== usuario._id) {
                mostrarNotificacionMensaje(msg);
            }
        });

        // socket para cargar conversación ya iniciada
        socketRef.current.on('conversacion iniciada', (data) => {
            setConversacionActual(data.conversacionId);
            conversacionActualRef.current = data.conversacionId; // FIX: sincronizar ref
            setMensajes(data.mensajes.map(m => ({ ...m, esPropio: m.usuarioId === usuario._id })));
        });

        // socket para cargar el historial de mensajes
        socketRef.current.on('historial mensajes', (historial) => {
            setMensajes(historial.map(m => ({ ...m, esPropio: m.usuarioId === usuario._id })));
        });

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, [usuario._id, cargarConversaciones, mostrarNotificacionMensaje]);

    // Auto-scroll al final de los mensajes
    useEffect(() => {
        mensajesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [mensajes]);

    // Recargar conversaciones 
    useEffect(() => {
        if (actualizarTrigger > 0) {
            cargarConversaciones();
        }
    }, [actualizarTrigger, cargarConversaciones]);

    // Cargar nombres de usuarios
    useEffect(() => {
        const cargarNombres = async () => {
            for (const conv of conversaciones) {
                if (conv.participantes && conv.participantes.length === 2) {
                    const otroParticipante = conv.participantes.find(p => {
                        const id = typeof p === 'object' ? (p._id || p.id) : p;
                        return id !== usuario._id;
                    });

                    if (otroParticipante) {
                        const id = typeof otroParticipante === 'object' ? (otroParticipante._id || otroParticipante.id) : otroParticipante;

                        if (nombresUsuarios[id]) continue;

                        if (typeof otroParticipante === 'object' && otroParticipante.nombre) {
                            setNombresUsuarios(prev => ({ ...prev, [id]: otroParticipante.nombre }));
                            continue;
                        }

                        if (fetchingRef.current.has(id)) continue;
                        fetchingRef.current.add(id);

                        try {
                            const res = await fetch(`http://dam2.colexio-karbo.com:6101/api/usuarios/${id}`);
                            if (res.ok) {
                                const userData = await res.json();
                                setNombresUsuarios(prev => ({ ...prev, [id]: userData.nombre || 'Usuario' }));
                            } else {
                                setNombresUsuarios(prev => ({ ...prev, [id]: 'Usuario' }));
                            }
                        } catch (err) {
                            setNombresUsuarios(prev => ({ ...prev, [id]: 'Usuario' }));
                        } finally {
                            fetchingRef.current.delete(id);
                        }
                    }
                }
            }
        };

        if (conversaciones.length > 0) {
            cargarNombres();
        }
    }, [conversaciones, usuario._id, nombresUsuarios]);

    const seleccionarConversacion = (conv) => {
        setConversacionActual(conv._id);
        conversacionActualRef.current = conv._id; // FIX: sincronizar ref al seleccionar
        socketRef.current.emit('iniciar conversacion', { conversacionId: conv._id });
    };

    const handleMensajeSubmit = (e) => {
        e.preventDefault();
        if (!mensaje.trim() || !conversacionActual) return;

        socketRef.current.emit('mensaje cliente', {
            conversacionId: conversacionActual,
            usuarioId: usuario._id,
            nombreUsuario: usuario.nombre,
            texto: mensaje
        });
        setMensaje('');
    };

    // Formatear fecha para los mensajes
    const formatearFecha = (fecha) => {
        const d = new Date(fecha);
        const hoy = new Date();
        const ayer = new Date();
        ayer.setDate(ayer.getDate() - 1);

        if (d.toDateString() === hoy.toDateString()) {
            return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        }
        if (d.toDateString() === ayer.toDateString()) {
            return 'Ayer ' + d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        }
        return d.toLocaleDateString('es-ES');
    };

    const obtenerNombreConversacion = (conv) => {
        if (conv.participantes && conv.participantes.length === 2) {
            const otroParticipante = conv.participantes.find(p => {
                const id = typeof p === 'object' ? (p._id || p.id) : p;
                return id !== usuario._id;
            });

            if (otroParticipante) {
                const id = typeof otroParticipante === 'object' ? (otroParticipante._id || otroParticipante.id) : otroParticipante;
                if (typeof otroParticipante === 'object' && otroParticipante.nombre) return otroParticipante.nombre;
                if (nombresUsuarios[id]) return nombresUsuarios[id];
                return id;
            }
        }
        return conv.titulo || 'Conversación';
    };

    const conversacionesFiltradas = conversaciones.filter(conv =>
        obtenerNombreConversacion(conv).toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
        // Altura fija al contenedor principal para evitar que la página entera haga scroll
        <div className="row g-0" style={{ height: '100vh' }}>

            {/* Barra lateral con conversaciones */}
            <div className="col-md-4 col-lg-3 border-end d-flex flex-column bg-white h-100">
                <div className="p-3 border-bottom flex-shrink-0">
                    <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Buscar conversaciones..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                </div>

                {/* Scroll independiente para la lista de conversaciones */}
                <div className="flex-grow-1 overflow-auto" style={{ overflowY: 'auto' }}>
                    {conversacionesFiltradas.length === 0 ? (
                        <div className="text-center text-muted mt-4">
                            <i className="bi bi-chat-dots fs-1 d-block mb-2"></i>
                            <small>{busqueda ? 'No hay coincidencias' : 'Sin conversaciones'}</small>
                        </div>
                    ) : (
                        <ul className="list-group list-group-flush">
                            {conversacionesFiltradas.map(conv => (
                                <li
                                    key={conv._id}
                                    className={`list-group-item ${conversacionActual === conv._id ? 'active' : ''}`}
                                    onClick={() => seleccionarConversacion(conv)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <strong>{obtenerNombreConversacion(conv)}</strong>
                                    {conv.mensajes && conv.mensajes.length > 0 && (
                                        <>
                                            <br />
                                            <small className={conversacionActual === conv._id ? 'text-white-50' : 'text-muted'}>
                                                {conv.mensajes[conv.mensajes.length - 1].texto}
                                            </small>
                                            <br />
                                            <small className={conversacionActual === conv._id ? 'text-white-50' : 'text-muted'}>
                                                {formatearFecha(conv.updatedAt)}
                                            </small>
                                        </>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="p-3 border-top bg-light small text-muted text-center flex-shrink-0">
                    <i className="bi bi-info-circle me-1"></i>
                    Para conectar con nuevos usuarios, usa la sección "Usuarios"
                </div>
            </div>

            {/* Área principal de chat */}
            <div className="col-md-8 col-lg-9 d-flex flex-column h-100">
                {conversacionActual ? (
                    <>
                        <div className="border-bottom p-3 bg-light flex-shrink-0">
                            <h6 className="mb-0">
                                {obtenerNombreConversacion(conversaciones.find(c => c._id === conversacionActual)) || 'Conversación'}
                            </h6>
                        </div>

                        <div
                            className="flex-grow-1 p-3"
                            style={{
                                backgroundColor: '#f8f9fa',
                                overflowY: 'auto',  // Activa el scroll vertical solo aquí
                                overflowX: 'hidden' // Evita scroll horizontal 
                            }}
                        >
                            {mensajes.length === 0 ? (
                                <div className="text-center text-muted my-5">
                                    <i className="bi bi-chat-text display-4 d-block mb-2 opacity-50"></i>
                                    <p>No hay mensajes aún</p>
                                </div>
                            ) : (
                                <div>
                                    {mensajes.map((msg, i) => (
                                        <div key={i} className={`d-flex mb-2 ${msg.esPropio ? 'justify-content-end' : 'justify-content-start'}`}>
                                            <div
                                                className={`p-2 rounded ${msg.esPropio ? 'bg-primary text-white' : 'bg-white border'}`}
                                                style={{ maxWidth: '70%' }}
                                            >
                                                {!msg.esPropio && <div className="fw-bold text-primary mb-1">{msg.nombreUsuario || msg.usuario}</div>}
                                                <div>{msg.texto}</div>
                                                <div className={`text-end mt-1 ${msg.esPropio ? 'text-white-50' : 'text-muted'}`} style={{ fontSize: '0.75rem' }}>
                                                    {formatearFecha(msg.timestamp)}
                                                    {msg.esPropio && <i className="bi bi-check2-all ms-1"></i>}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {/* Referencia para el auto-scroll */}
                                    <div ref={mensajesEndRef} />
                                </div>
                            )}
                        </div>

                        {/* Formulario de envío */}
                        <div className="p-3 border-top bg-white flex-shrink-0">
                            <form onSubmit={handleMensajeSubmit} className="d-flex">
                                <input
                                    type="text"
                                    className="form-control me-2"
                                    value={mensaje}
                                    onChange={(e) => setMensaje(e.target.value)}
                                    placeholder="Escribe un mensaje..."
                                    autoComplete="off"
                                />
                                <button type="submit" className="btn btn-primary" disabled={!mensaje.trim()}>
                                    Enviar
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="d-flex align-items-center justify-content-center h-100">
                        <div className="text-center">
                            <i className="bi bi-chat-dots display-4 text-muted mb-3"></i>
                            <h5>Selecciona una conversación</h5>
                            <p className="text-muted">O inicia una nueva con tus amigos</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;