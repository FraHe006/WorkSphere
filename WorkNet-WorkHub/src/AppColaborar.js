/**
 * SUBAPP COLABORAR
 *
 * Gestiona la sesión y navegación del área de colaboración.
 * Acceso restringido a usuarios con validado:true o admin:true.
 *
 * Flujo de acceso:
 *  1. Comprueba localStorage - si hay sesión de colaborar válida (validado o admin), entra al panel.
 *  2. Si no, muestra Login sin opción de registro.
 *  3. Tras login, verifica en el servidor que el usuario tiene acceso (endpoint /verificar-acceso-colaborar).
 *  4. Si no tiene acceso, muestra mensaje de acceso denegado y vuelve al login.
 *  5. Logout/Volver - llama a onVolverInicio.
 */

import React, { useState } from 'react';
import Login from './Componentes/Login';
import GestionTabla from './Componentes/GestionTabla';
import GestionCategorias from './Componentes/GestionCategorias';
import JuegosPendientesValidacion from './Componentes/JuegosPendientesValidacion';
import GestionEmail from './Componentes/GestionEmail';

const API = 'http://dam2.colexio-karbo.com:6101/api';
const STORAGE_KEY = 'usuario_colaborar';

function AppColaborar({ onVolverInicio }) {
    //  Estado 
    const [usuario, setUsuario] = useState(() => {
        try {
            const guardado = localStorage.getItem(STORAGE_KEY);
            if (guardado) {
                const parsed = JSON.parse(guardado);
                if (parsed?._id && (parsed.validado || parsed.admin)) return parsed;
            }
        } catch (_) {
            localStorage.removeItem(STORAGE_KEY);
        }
        return null;
    });

    const [vista, setVista] = useState(() => {
        if (usuario?.admin) return 'gestionar-usuarios';
        if (usuario?.validado) return 'juegos-pendientes';
        return 'inicio';
    });
    const [errorAcceso, setErrorAcceso] = useState('');
    const [verificando, setVerificando] = useState(false);

    //  Backup (solo admin) 
    const [creandoBackup, setCreandoBackup] = useState(false);
    const [backupMsg, setBackupMsg] = useState('');

    const handleBackup = async () => {
        setCreandoBackup(true);
        setBackupMsg('');
        try {
            const res = await fetch(`${API}/copiaSeguridad`, { method: 'POST' });
            const data = await res.json();
            if (!res.ok) {
                setBackupMsg('Error: ' + (data.error || 'No se pudo crear el backup'));
            } else {
                setBackupMsg('Backup creado correctamente');
            }
        } catch (_) {
            setBackupMsg('Error de conexión al crear el backup');
        } finally {
            setCreandoBackup(false);
            setTimeout(() => setBackupMsg(''), 4000);
        }
    };

    //  Login con verificación de acceso 
    const handleLoginSuccess = async (usuarioData) => {
        if (!usuarioData?._id) return;

        setVerificando(true);
        setErrorAcceso('');

        try {
            const res = await fetch(`${API}/usuarios/verificar-acceso-colaborar/${usuarioData._id}`);
            const data = await res.json();

            if (!res.ok || !data.tieneAcceso) {
                setErrorAcceso(data.error || 'No tienes permiso para acceder al área de colaboración. Necesitas ser usuario validado o administrador.');
                setVerificando(false);
                return;
            }

            // Acceso concedido → guardar sesión y entrar al panel
            localStorage.setItem(STORAGE_KEY, JSON.stringify(usuarioData));
            setUsuario(usuarioData);
            setVista('inicio');
        } catch (_) {
            setErrorAcceso('No se pudo verificar el acceso. Inténtalo de nuevo.');
        } finally {
            setVerificando(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem(STORAGE_KEY);
        setUsuario(null);
        setErrorAcceso('');
        onVolverInicio();
    };

    //  Sin sesión - Login 
    if (!usuario) {
        return (
            <div>
                {/* Banner de acceso restringido */}
                <div
                    className="py-3 text-center text-white"
                    style={{ background: 'linear-gradient(90deg, #0d6efd 0%, #6610f2 100%)', fontSize: '0.9rem' }}
                >
                    <i className="bi bi-shield-lock-fill me-2"></i>
                    Área restringida — solo usuarios <strong>validados</strong> o <strong>administradores</strong>
                </div>

                {errorAcceso && (
                    <div className="container mt-4">
                        <div className="row justify-content-center">
                            <div className="col-md-6 col-lg-4">
                                <div className="alert alert-danger d-flex align-items-start gap-2">
                                    <i className="bi bi-shield-x-fill mt-1 flex-shrink-0"></i>
                                    <span>{errorAcceso}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {verificando ? (
                    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                        <div className="text-center">
                            <div className="spinner-border text-primary mb-3" role="status"></div>
                            <p className="text-muted">Verificando acceso…</p>
                        </div>
                    </div>
                ) : (
                    <Login
                        onLoginSuccess={handleLoginSuccess}
                        onCambiarVista={(v) => { if (v === 'inicio') onVolverInicio(); }}
                        mostrarRegistro={false}
                        modo="colaborar"
                    />
                )}
            </div>
        );
    }

    //  Panel de colaborar con sesión activa 
    const VISTAS = [
        ...(usuario.admin ? [
            { key: 'gestionar-usuarios', icon: 'people-fill', label: 'Usuarios' },
            { key: 'gestionar-email', icon: 'envelope-fill', label: 'Emails' },
        ] : []),
        ...(usuario.validado ? [
            { key: 'juegos-pendientes', icon: 'check-circle-fill', label: 'Por Validar' },
            { key: 'gestionar-categorias', icon: 'tag-fill', label: 'Categorías' },
        ] : []),
    ];

    const titulos = {
        inicio: 'Colaborar',
        'gestionar-usuarios': 'Gestión de Usuarios',
        'gestionar-categorias': 'Gestión de Categorías',
        'juegos-pendientes': 'Juegos Pendientes',
        'gestionar-email': 'Gestión de Emails',
    };

    return (
        <div className="container-fluid vh-100 d-flex flex-column">
            {/* Barra superior — mismo estilo que AppChat */}
            <nav className="navbar navbar-light bg-light border-bottom py-2">
                <div className="container-fluid">
                    <span className="navbar-brand mb-0 h5 d-flex align-items-center gap-2">
                        {titulos[vista] ?? 'Colaborar'}
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
                        {/* Menú de navegación */}
                        {VISTAS.length > 0 && (
                            <>
                                {VISTAS.map(({ key, icon, label }) => (
                                    <button
                                        key={key}
                                        className={`btn btn-outline-secondary btn-sm ${vista === key ? 'active' : ''}`}
                                        onClick={() => setVista(key)}
                                    >
                                        <i className={`bi bi-${icon} me-1`}></i>{label}
                                    </button>
                                ))}

                                <div className="vr mx-1" style={{ height: 24 }}></div>
                            </>
                        )}

                        {/* Backup (solo admin) */}
                        {usuario.admin && (
                            <button
                                className="btn btn-outline-warning btn-sm"
                                onClick={handleBackup}
                                disabled={creandoBackup}
                            >
                                {creandoBackup ? (
                                    <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                                ) : (
                                    <i className="bi bi-cloud-download-fill me-1"></i>
                                )}
                                Backup
                            </button>
                        )}

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

            {/* Aviso resultado backup */}
            {backupMsg && (
                <div className={`alert ${backupMsg.startsWith('Error') ? 'alert-danger' : 'alert-success'} m-2 py-1 px-3 small`}>
                    {backupMsg}
                </div>
            )}

            {/* Contenido */}
            <div className="flex-grow-1 overflow-auto p-3 bg-light">
                {vista === 'inicio' && (
                    <div className="row">
                        <div className="col-12">
                            <div className="card border-0 shadow-sm">
                                <div className="card-body text-center py-5">
                                    <i className="bi bi-hand-thumbs-up" style={{ fontSize: '3rem', color: '#0d6efd' }}></i>
                                    <h5 className="mt-3">Bienvenido al Área de Colaboración</h5>
                                    <p className="text-muted">
                                        {usuario.admin
                                            ? 'Como administrador, puedes gestionar usuarios.'
                                            : 'Como usuario validado, puedes validar juegos, y gestionar las diferentes categorías.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {vista === 'gestionar-usuarios' && <GestionTabla usuario={usuario} />}

                {vista === 'gestionar-email' && <GestionEmail usuario={usuario} />}

                {vista === 'gestionar-categorias' && <GestionCategorias usuario={usuario} />}

                {vista === 'juegos-pendientes' && <JuegosPendientesValidacion usuario={usuario} />}
            </div>
        </div>
    );
}

export default AppColaborar;