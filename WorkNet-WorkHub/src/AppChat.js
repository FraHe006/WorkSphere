/**
 * SUBAPP CHAT
 *
 * Gestiona toda la sesión y navegación del área de chat.
 * Extraído de App.js para mantener cada sub-aplicación independiente.
 *
 * Flujo de acceso:
 *  1. Comprueba localStorage → si hay sesión válida, va directo al chat.
 *  2. Si no, muestra Login (con opción de Registro).
 *  3. Logout/Volver - llama a onVolverInicio para regresar a Inicio.
 *
 * Menú condicional según rol:
 *  - Validado o admin - ve "Solicitudes", NO ve "Usuarios Disponibles"
 *  - No validado - ve "Usuarios Disponibles", NO ve "Solicitudes"
 */

import React, { useState } from 'react';
import Login from './Componentes/Login';
import Registro from './Componentes/Registro';
import Chat from './Componentes/Chat';
import Solicitudes from './Componentes/Solicitudes';
import Amistades from './Componentes/Amistades';
import UsuariosValidados from './Componentes/UsuariosValidados';
import Configuracion from './Componentes/Configuracion';
import Perfil from './Componentes/Perfil';
import Notificaciones from './Componentes/Notificaciones';

const API = 'http://dam2.colexio-karbo.com:6101/api';

function AppChat({ onVolverInicio }) {
    //  Estado 
    const [usuario, setUsuario] = useState(null);
    const [vista, setVista] = useState(() => {
        const guardado = localStorage.getItem('usuario');
        if (guardado) {
            try {
                const parsed = JSON.parse(guardado);

                // Verificar si es admin. Si lo es, mandar a login
                if (parsed && parsed.admin === true) {
                    return 'login';
                }

                // Si no es admin, verificar si tiene un _id válido para ir al chat
                if (parsed && parsed._id) {
                    return 'chat';
                }

            } catch (_) {
                localStorage.removeItem('usuario');
            }
        }
        return 'login';
    });
    const [solicitudesPendientes, setSolicitudesPendientes] = useState(0);
    const [actualizarConversaciones, setActualizarConversaciones] = useState(0);
    const [notificaciones, setNotificaciones] = useState([]);

    //  Inicializar usuario desde localStorage si la vista inició en 'chat' 
    React.useEffect(() => {
        if (vista === 'chat' && !usuario) {
            try {
                const parsed = JSON.parse(localStorage.getItem('usuario'));
                if (parsed && parsed._id) {
                    aplicarTema(JSON.parse(localStorage.getItem(`config_${parsed._id}`) || 'null'));
                    setUsuario(parsed);
                } else {
                    setVista('login');
                }
            } catch (_) {
                setVista('login');
            }
        }
    }, []);

    //  Colores 
    const aplicarTema = (tema) => {
        if (!tema) return;
        document.getElementById('tema-personalizado')?.remove();
        const style = document.createElement('style');
        style.id = 'tema-personalizado';
        style.innerHTML = `
      .btn-primary,.btn-primary:hover,.btn-primary:focus,.btn-primary:active{background-color:${tema.colorPrimario}!important;border-color:${tema.colorPrimario}!important}
      .btn-outline-primary{color:${tema.colorPrimario}!important;border-color:${tema.colorPrimario}!important}
      .btn-outline-primary:hover{background-color:${tema.colorPrimario}!important;border-color:${tema.colorPrimario}!important}
      .bg-primary{background-color:${tema.colorPrimario}!important}.text-primary{color:${tema.colorPrimario}!important}
      .card-header.bg-primary{background-color:${tema.colorPrimario}!important}
      .badge.bg-primary,.badge.text-primary{background-color:${tema.colorPrimario}!important}
      .spinner-border.text-primary{color:${tema.colorPrimario}!important}
      .btn-success,.btn-success:hover,.btn-success:focus,.btn-success:active{background-color:${tema.colorExito}!important;border-color:${tema.colorExito}!important}
      .bg-success{background-color:${tema.colorExito}!important}.text-success{color:${tema.colorExito}!important}
      .btn-danger,.btn-danger:hover,.btn-danger:focus,.btn-danger:active{background-color:${tema.colorPeligro}!important;border-color:${tema.colorPeligro}!important}
      .btn-outline-danger{color:${tema.colorPeligro}!important;border-color:${tema.colorPeligro}!important}
      .btn-outline-danger:hover{background-color:${tema.colorPeligro}!important;border-color:${tema.colorPeligro}!important}
      .bg-danger{background-color:${tema.colorPeligro}!important}.text-danger{color:${tema.colorPeligro}!important}
      .btn-secondary,.btn-secondary:hover,.btn-secondary:focus,.btn-secondary:active{background-color:${tema.colorSecundario}!important;border-color:${tema.colorSecundario}!important}
      .bg-secondary{background-color:${tema.colorSecundario}!important}.text-secondary{color:${tema.colorSecundario}!important}
    `;
        document.head.appendChild(style);
    };

    //  Solicitudes pendientes 
    const cargarSolicitudesPendientes = React.useCallback(async () => {
        if (!usuario?._id) return;
        try {
            const res = await fetch(`${API}/amistades/solicitudes/${usuario._id}`);
            const data = await res.json();
            setSolicitudesPendientes(data.length);
        } catch (_) { }
    }, [usuario]);

    React.useEffect(() => {
        if (usuario?._id) {
            cargarSolicitudesPendientes();
            const iv = setInterval(cargarSolicitudesPendientes, 30000);
            return () => clearInterval(iv);
        }
    }, [usuario, cargarSolicitudesPendientes]);

    //  Handlers 
    const handleLoginSuccess = (usuarioData) => {
        if (!usuarioData?._id) return alert('Error: El usuario no tiene un ID válido');
        const cfg = localStorage.getItem(`config_${usuarioData._id}`);
        if (cfg) { try { aplicarTema(JSON.parse(cfg)); } catch (_) { } }
        setUsuario(usuarioData);
        setVista('chat');
    };

    const handleLogout = () => {
        document.getElementById('tema-personalizado')?.remove();
        localStorage.removeItem('usuario');
        setUsuario(null);
        setSolicitudesPendientes(0);
        onVolverInicio();
    };

    // Cambiar vista
    const cambiarVista = (nuevaVista) => {
        setVista(nuevaVista);
        if (nuevaVista === 'solicitudes') cargarSolicitudesPendientes();
    };

    // Acciones a tomar cuando se acepta una solicitud
    const handleSolicitudAceptada = () => {
        cargarSolicitudesPendientes();
        setActualizarConversaciones(prev => prev + 1);
        setTimeout(() => cambiarVista('chat'), 1000);
    };

    // Mostrar una notificación
    const mostrarNotificacion = (nombre, mensaje, imagen = null) => {
        const n = { id: Date.now(), nombre, mensaje, imagen };
        setNotificaciones(prev => [...prev, n]);
        setTimeout(() => setNotificaciones(prev => prev.filter(x => x.id !== n.id)), 5000);
    };

    //  Vistas sin sesión cargada
    if (!usuario) {
        if (vista === 'registro') {
            return <Registro onRegistroSuccess={handleLoginSuccess} onCambiarVista={cambiarVista} />;
        }
        return (
            <Login
                onLoginSuccess={handleLoginSuccess}
                onCambiarVista={(v) => v === 'inicio' ? onVolverInicio() : cambiarVista(v)}
                mostrarRegistro={true}
            />
        );
    }

    //  Rol del usuario 
    const esValidado = usuario.validado || usuario.admin;

    //  Layout con sesión activa 
    const titulos = {
        chat: 'Chat', perfil: 'Perfil', solicitudes: 'Solicitudes',
        'usuarios-validados': 'Usuarios Disponibles', configuracion: 'Configuración', amistades: 'Amistades',
    };

    return (
        <>
            <div className="container-fluid vh-100 d-flex flex-column">
                {/* Barra superior */}
                <nav className="navbar navbar-light bg-light border-bottom py-2">
                    <div className="container-fluid">
                        <span className="navbar-brand mb-0 h5 d-flex align-items-center gap-2">
                            {titulos[vista] ?? 'Aplicación'}
                            {usuario.admin && (
                                <span className="badge bg-warning text-dark" style={{ fontSize: '0.7rem' }}>
                                    <i className="bi bi-star-fill me-1"></i>Admin
                                </span>
                            )}
                            {!usuario.admin && usuario.validado && (
                                <span className="badge bg-success" style={{ fontSize: '0.7rem' }}>
                                    <i className="bi bi-patch-check-fill me-1"></i>Validado
                                </span>
                            )}
                        </span>

                        <div className="d-flex align-items-center flex-wrap gap-1">
                            {/* Botones siempre visibles */}
                            {[
                                { key: 'chat', icon: 'chat-dots', label: 'Chat' },
                                { key: 'amistades', icon: 'person-heart', label: 'Amistades' },
                                { key: 'perfil', icon: 'person', label: 'Perfil' },
                                //{ key: 'configuracion', icon: 'gear', label: 'Configuración' },
                            ].map(({ key, icon, label }) => (
                                <button
                                    key={key}
                                    className={`btn btn-outline-secondary btn-sm ${vista === key ? 'active' : ''}`}
                                    onClick={() => cambiarVista(key)}
                                >
                                    <i className={`bi bi-${icon} me-1`}></i>{label}
                                </button>
                            ))}

                            {/* Solicitudes: solo mostrar a usuarios validados */}
                            {esValidado && (
                                <button
                                    className={`btn btn-sm position-relative ${vista === 'solicitudes' ? 'btn-primary' :
                                        solicitudesPendientes > 0 ? 'btn-success' : 'btn-outline-secondary'
                                        }`}
                                    onClick={() => cambiarVista('solicitudes')}
                                >
                                    <i className="bi bi-people me-1"></i>Solicitudes
                                    {solicitudesPendientes > 0 && (
                                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                            {solicitudesPendientes}
                                        </span>
                                    )}
                                </button>
                            )}

                            {/* Usuarios Disponibles: solo mostrar a NO validados */}
                            {!esValidado && (
                                <button
                                    className={`btn btn-outline-secondary btn-sm ${vista === 'usuarios-validados' ? 'active' : ''}`}
                                    onClick={() => cambiarVista('usuarios-validados')}
                                >
                                    <i className="bi bi-people-fill me-1"></i>Usuarios
                                </button>
                            )}

                            <div className="vr mx-1" style={{ height: 24 }}></div>

                            {/* Info usuario */}
                            <span className="text-muted small">
                                <i className="bi bi-person-circle me-1"></i>
                                {usuario.nombre}
                            </span>

                            <button className="btn btn-outline-secondary btn-sm" onClick={onVolverInicio}>
                                <i className="bi bi-house me-1"></i>Inicio
                            </button>
                            <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
                                <i className="bi bi-box-arrow-right me-1"></i>Cerrar Sesión
                            </button>
                        </div>
                    </div>
                </nav>

                {/* Contenido */}
                <div className="flex-grow-1 overflow-auto p-3 bg-light">
                    {vista === 'chat' && <Chat usuario={usuario} onLogout={handleLogout} actualizarTrigger={actualizarConversaciones} onMostrarNotificacion={mostrarNotificacion} />}
                    {vista === 'usuarios-validados' && !esValidado && <UsuariosValidados usuario={usuario} onSolicitudEnviada={cargarSolicitudesPendientes} />}
                    {vista === 'solicitudes' && esValidado && <Solicitudes usuario={usuario} onSolicitudAceptada={handleSolicitudAceptada} />}
                    {vista === 'amistades' && <Amistades usuario={usuario} onAmistadEliminada={() => setActualizarConversaciones(p => p + 1)} />}
                    {vista === 'perfil' && <Perfil usuario={usuario} onUsuarioActualizado={setUsuario} />}
                    {vista === 'configuracion' && <Configuracion usuario={usuario} />}
                </div>
            </div>

            <Notificaciones
                notificaciones={notificaciones}
                onCerrar={(id) => setNotificaciones(p => p.filter(n => n.id !== id))}
            />
        </>
    );
}

export default AppChat;