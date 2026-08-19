/**
 * COMPONENTE INICIO (Landing Page)
 *
 * Página de inicio del ecosistema de tres aplicaciones.
 * Al pulsar una tarjeta, la sección inferior muestra su detalle.
 */

import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const Inicio = ({ onCambiarVista }) => {
    const [scrolled, setScrolled] = useState(false);
    const [modalColaborar, setModalColaborar] = useState(false);
    const [appActiva, setAppActiva] = useState('web');

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const apps = [
        {
            id: 'movil',
            icono: 'bi-phone-fill',
            tag: 'WorkQuiz',
            tagColor: '#58cc02',
            titulo: 'Aprende sobre tus derechos',
            subtitulo: 'Gamificado · Progresivo · Accesible',
            descripcion:
                'Conoce tus derechos de manera sencilla, mediante actividades fáciles de entender',
            caracteristicas: [
                { icono: 'bi-trophy-fill', texto: 'Sistema de rachas y vidas diarias' },
                { icono: 'bi-book-half', texto: 'Lecciones por temática laboral' },
                { icono: 'bi-lightning-fill', texto: 'Actividades rápidas diarias' },
            ],
            gradiente: 'linear-gradient(135deg, #58cc02 0%, #1cb0f6 100%)',
            bgCard: '#f0fdf4',
            borderColor: '#58cc02',
            plataforma: 'Android',
            plataformaIcono: 'bi-google-play',
            detalleTitulo: 'Aprende de manera gamificada',
            detalleSubtitulo: 'La app que convierte la teoría compleja en algo fácil y entretenido.',
            detalleSecciones: [
                {
                    icono: 'bi-controller',
                    color: '#1cb0f6',
                    bg: '#f0f8ff',
                    titulo: 'Sistema de gamificación',
                    items: [
                        'Rachas diarias y puntos de experiencia',
                        'Logros y medallas por avance',
                        'Niveles y ranking entre usuarios',
                        'Repaso inteligente de errores',
                    ],
                },
            ],
        },
        {
            id: 'escritorio',
            icono: 'bi-display-fill',
            tag: 'WorkDocs',
            tagColor: '#ff9600',
            titulo: 'Gestión de información para actividades',
            subtitulo: 'Potente · Rápido · Accesible',
            descripcion:
                'Aplicación de escritorio que te permite compartir tus conocimientos para nuevas actividades en WorkQuiz.',
            caracteristicas: [
                { icono: 'bi-send-fill', texto: 'Envío rápido de información para nuevas actividades' },
            ],
            gradiente: 'linear-gradient(135deg, #ff9600 0%, #ff4b2b 100%)',
            bgCard: '#fffbf0',
            borderColor: '#ff9600',
            plataforma: 'Windows',
            plataformaIcono: 'bi-windows',
            detalleTitulo: 'El centro de mando para compartir tus conocimientos',
            detalleSubtitulo: 'Prepaar de manera sencilla toda la información para nuevas actividades',
            detalleSecciones: [
                {
                    icono: 'bi-send-fill',
                    color: '#ff9600',
                    bg: '#fffbf0',
                    titulo: 'Envío de datos',
                    items: [
                        'Formularios de fácil entendimiento para nuevas actividades',
                        'Plantillas predeterminadas para compartir información',
                        'Alertas y recordatorios automáticos',
                    ],
                },
            ],
        },
        {
            id: 'web',
            icono: 'bi-globe2',
            tag: 'WorkNet -- WorkHub',
            tagColor: '#0d6efd',
            titulo: 'Chat y gestión para usuarios validados',
            subtitulo: 'Comunicación · Administración · Control',
            descripcion:
                'Plataforma web con dos pilares: un sistema de chat en tiempo real para la comunicación entre miembros, y un panel de gestión exclusivo para usuarios con acceso validado.',
            caracteristicas: [
                { icono: 'bi-chat-dots-fill', texto: 'Chat en tiempo real con usuarios validados' },
                { icono: 'bi-person-gear', texto: 'Panel de gestión avanzado' },
                { icono: 'bi-bell-fill', texto: 'Notificaciones instantáneas' },
            ],
            gradiente: 'linear-gradient(135deg, #0d6efd 0%, #6610f2 100%)',
            bgCard: '#f0f4ff',
            borderColor: '#0d6efd',
            plataforma: 'Navegador web',
            plataformaIcono: 'bi-browser-chrome',
            detalleTitulo: 'Dos aplicaciones en una sola web',
            detalleSubtitulo: 'Comunicación abierta y gestión de acceso controlado en la misma plataforma.',
            detalleSecciones: [
                {
                    icono: 'bi-chat-square-dots-fill',
                    color: '#0d6efd',
                    bg: '#f0f4ff',
                    titulo: 'Chat en tiempo real',
                    items: [
                        'Mensajería instantánea',
                        'Lista de contactos y solicitudes pendientes',
                        'Notificaciones al recibir mensajes',
                        'Personalización de cuenta',
                    ],
                },
                {
                    icono: 'bi-shield-lock-fill',
                    color: '#6610f2',
                    bg: '#f5f0ff',
                    titulo: 'Gestión para usuarios validados',
                    items: [
                        'Acceso exclusivo a usuarios validados y administrados',
                        'Panel de control y administración',
                        'Gestión de nuevos usuarios validados',
                    ],
                },
            ],
        },
    ];

    const appActivaData = apps.find(a => a.id === appActiva);

    return (
        <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: '#f8f9fa', minHeight: '100vh' }}>

            <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-dot {
          0%, 100% { transform: scale(1); opacity: 1; }
          50%       { transform: scale(1.4); opacity: 0.7; }
        }
        .fade-up   { animation: fadeUp 0.6s ease both; }
        .fade-up-1 { animation-delay: 0.1s; }
        .fade-up-2 { animation-delay: 0.22s; }
        .fade-up-3 { animation-delay: 0.34s; }
        .fade-up-4 { animation-delay: 0.46s; }

        .app-card {
          transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.2s ease;
          border-radius: 20px; overflow: hidden; cursor: pointer;
        }
        .app-card:hover { transform: translateY(-5px); box-shadow: 0 18px 44px rgba(0,0,0,0.12) !important; }

        .navbar-custom { transition: background 0.3s ease, box-shadow 0.3s ease; }
        .navbar-scrolled {
          background: rgba(255,255,255,0.97) !important;
          box-shadow: 0 2px 16px rgba(0,0,0,0.09) !important;
        }

        .btn-colaborar {
          background: linear-gradient(135deg, #ff9600, #ff4b2b);
          border: none; color: white; font-weight: 600;
          transition: opacity 0.2s, transform 0.2s;
        }
        .btn-colaborar:hover { opacity: 0.9; transform: scale(1.03); color: white; }

        .hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.18); border: 1px solid rgba(255,255,255,0.35);
          border-radius: 999px; padding: 6px 16px;
          font-size: 0.85rem; color: white; backdrop-filter: blur(8px); margin-bottom: 20px;
        }
        .dot-live {
          width: 8px; height: 8px; background: #58cc02;
          border-radius: 50%; animation: pulse-dot 1.6s ease-in-out infinite;
        }
        .feature-chip {
          display: inline-flex; align-items: center; gap: 6px;
          background: white; border: 1px solid #e9ecef;
          border-radius: 999px; padding: 5px 13px;
          font-size: 0.82rem; color: #495057; margin: 3px;
        }
        .detalle-fade { animation: fadeUp 0.3s ease both; }

        .modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.55);
          display: flex; align-items: center; justify-content: center;
          z-index: 9999; animation: fadeUp 0.2s ease;
        }
        .modal-box {
          background: white; border-radius: 20px; padding: 40px;
          max-width: 480px; width: 90%; text-align: center;
          box-shadow: 0 30px 80px rgba(0,0,0,0.2);
        }
      `}</style>

            {/* ── NAVBAR ── */}
            <nav
                className={`navbar navbar-light py-2 px-3 sticky-top navbar-custom ${scrolled ? 'navbar-scrolled' : ''}`}
                style={{ background: scrolled ? undefined : 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)' }}
            >
                <div className="container">
                    <a className="navbar-brand mb-0 d-flex align-items-center gap-2" href="#top" style={{ textDecoration: 'none' }}>
                        <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg, #0d6efd, #6610f2)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <i className="bi bi-grid-3x3-gap-fill text-white" style={{ fontSize: '1rem' }}></i>
                        </div>
                        <span className="fw-bold" style={{ fontSize: '1.05rem', color: '#212529' }}>WorkSphere</span>
                    </a>
                    <div className="d-flex align-items-center gap-2">
                        <button className="btn btn-outline-primary btn-sm px-3" onClick={() => onCambiarVista('chat')}>
                            <i className="bi bi-chat-dots-fill me-1"></i>Acceder al Chat
                        </button>
                        <button className="btn btn-sm px-3 btn-colaborar" onClick={() => onCambiarVista('login-colaborar')}>
                            <i className="bi bi-question-circle me-1"></i>¿Deseas colaborar?
                        </button>
                    </div>
                </div>
            </nav>

            {/* ── HERO ── */}
            <div id="top" style={{ background: 'linear-gradient(135deg, #0d6efd 0%, #6610f2 55%, #0d6efd 100%)', padding: '80px 0 90px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -80, right: -80, width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: -60, left: -60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
                <div className="container text-center text-white" style={{ position: 'relative' }}>
                    <div className="hero-badge fade-up fade-up-1">
                        <span className="dot-live"></span>Tres plataformas. Una comunidad.
                    </div>
                    <h1 className="display-4 fw-bold mb-3 fade-up fade-up-2" style={{ letterSpacing: '-0.5px' }}>
                        Aprende, comparte y comunícate
                    </h1>
                    <p className="lead mb-5 mx-auto fade-up fade-up-3" style={{ maxWidth: 560, opacity: 0.88 }}>
                        Una comunidad diseñada para el aprendizaje libre de derechos laborales.
                    </p>
                    <div className="d-flex justify-content-center gap-3 flex-wrap fade-up fade-up-4">
                        <button className="btn btn-light btn-lg px-4 fw-semibold" style={{ borderRadius: 12 }} onClick={() => onCambiarVista('chat')}>
                            <i className="bi bi-chat-dots-fill me-2 text-primary"></i>Entrar al Chat
                        </button>
                        <button className="btn btn-outline-light btn-lg px-4 fw-semibold" style={{ borderRadius: 12 }} onClick={() => setModalColaborar(true)}>
                            <i className="bi bi-handshake me-2"></i>¿Deseas colaborar?
                        </button>
                    </div>
                </div>
            </div>

            {/* ── TRES TARJETAS ── */}
            <div className="container py-5">
                <div className="text-center mb-5">
                    <span className="badge bg-primary bg-opacity-10 text-primary fw-semibold px-3 py-2 rounded-pill mb-3 d-inline-block" style={{ fontSize: '0.85rem' }}>
                        Nuestras plataformas
                    </span>
                    <h2 className="fw-bold mb-2" style={{ fontSize: '2rem' }}>Tres apps, un propósito común</h2>
                    <p className="text-muted mx-auto" style={{ maxWidth: 500 }}>
                        Pulsa en una tarjeta para ver los detalles de cada plataforma.
                    </p>
                </div>

                <div className="row g-4">
                    {apps.map((app, i) => {
                        const estaActiva = appActiva === app.id;
                        return (
                            <div key={app.id} className="col-lg-4 fade-up" style={{ animationDelay: `${i * 0.12}s` }}>
                                <div
                                    className="app-card shadow h-100 d-flex flex-column"
                                    style={{
                                        background: app.bgCard,
                                        border: estaActiva ? `2px solid ${app.borderColor}` : `2px solid ${app.borderColor}22`,
                                        boxShadow: estaActiva ? `0 0 0 3px ${app.borderColor}33` : undefined,
                                    }}
                                    onClick={() => setAppActiva(app.id)}
                                >
                                    {/* Cabecera */}
                                    <div style={{ background: app.gradiente, padding: '28px 28px 24px', position: 'relative', overflow: 'hidden' }}>
                                        <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.12)' }} />
                                        <div className="d-flex align-items-center gap-3">
                                            <div style={{ width: 52, height: 52, background: 'rgba(255,255,255,0.22)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(6px)' }}>
                                                <i className={`bi ${app.icono} text-white`} style={{ fontSize: '1.5rem' }}></i>
                                            </div>
                                            <div>
                                                <span style={{ background: 'rgba(255,255,255,0.25)', color: 'white', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '2px 10px', borderRadius: 999, display: 'inline-block', marginBottom: 4 }}>
                                                    {app.tag}
                                                </span>
                                                <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.78rem' }}>
                                                    <i className={`bi ${app.plataformaIcono} me-1`}></i>{app.plataforma}
                                                </div>
                                            </div>
                                        </div>
                                        <h4 className="text-white fw-bold mt-3 mb-1" style={{ fontSize: '1.15rem' }}>{app.titulo}</h4>
                                        <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.8rem' }}>{app.subtitulo}</div>
                                    </div>

                                    {/* Cuerpo */}
                                    <div className="p-4 flex-grow-1 d-flex flex-column">
                                        <p className="text-muted mb-4" style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>{app.descripcion}</p>
                                        <div className="mt-auto">
                                            {app.caracteristicas.map((c, j) => (
                                                <div key={j} className="feature-chip">
                                                    <i className={`bi ${c.icono}`} style={{ color: app.tagColor, fontSize: '0.8rem' }}></i>
                                                    {c.texto}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── SECCIÓN DE DETALLE (cambia según tarjeta activa) ── */}
            {appActivaData && (
                <div className="bg-white border-top border-bottom py-5" key={appActiva}>
                    <div className="container detalle-fade">
                        <div className="text-center mb-5">
                            <span
                                className="badge fw-semibold px-3 py-2 rounded-pill mb-3 d-inline-block"
                                style={{ background: `${appActivaData.borderColor}18`, color: appActivaData.tagColor, fontSize: '0.85rem' }}
                            >
                                {appActivaData.tag}
                            </span>
                            <h2 className="fw-bold mb-2" style={{ fontSize: '1.9rem' }}>{appActivaData.detalleTitulo}</h2>
                            <p className="text-muted mx-auto" style={{ maxWidth: 480 }}>{appActivaData.detalleSubtitulo}</p>
                        </div>

                        <div className="row g-4 justify-content-center">
                            {appActivaData.detalleSecciones.map((sec, i) => (
                                <div key={i} className="col-md-5">
                                    <div className="rounded-4 p-4 h-100" style={{ background: sec.bg, border: `2px solid ${sec.color}22` }}>
                                        <div style={{ width: 50, height: 50, background: sec.color, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                                            <i className={`bi ${sec.icono} text-white`} style={{ fontSize: '1.4rem' }}></i>
                                        </div>
                                        <h5 className="fw-bold mb-3">{sec.titulo}</h5>
                                        <ul className="list-unstyled mb-0" style={{ fontSize: '0.9rem' }}>
                                            {sec.items.map((item, j) => (
                                                <li key={j} className="d-flex align-items-start gap-2 mb-2 text-muted">
                                                    <i className="bi bi-check-circle-fill mt-1" style={{ color: sec.color, fontSize: '0.85rem', flexShrink: 0 }}></i>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {appActiva === 'movil' && (
                            <div className="text-center mt-5 d-flex justify-content-center gap-3 flex-wrap">
                                <a
                                    href="../WorkQuiz.apk"
                                    download="WorkQuiz.apk"
                                    className="btn btn-lg px-4"
                                    style={{ borderRadius: 12, background: '#58cc02', border: 'none', color: 'white' }}
                                >
                                    <i className="bi bi-google-play me-2"></i>Descargar APK
                                </a>
                            </div>
                        )}
                        {appActiva === 'escritorio' && (
                            <div className="text-center mt-5 d-flex justify-content-center gap-3 flex-wrap">
                                <a
                                    href="../WorkDocs.zip"
                                    download="WorkDocs.zip"
                                    className="btn btn-dark btn-lg px-4"
                                    style={{ borderRadius: 12 }}
                                >
                                    <i className="bi bi-windows me-2"></i>Descargar ZIP
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="container py-5 text-center">
                <div className="mx-auto rounded-4 p-5" style={{ maxWidth: 620, background: 'linear-gradient(135deg, #0d6efd 0%, #6610f2 100%)', color: 'white' }}>
                    <i className="bi bi-grid-3x3-gap-fill mb-3 d-block" style={{ fontSize: '2.5rem', opacity: 0.9 }}></i>
                    <h3 className="fw-bold mb-2">¿Listo para empezar?</h3>
                    <p className="mb-4" style={{ opacity: 0.88 }}>Accede al chat ahora o ponte en contacto si quieres formar parte del proyecto.</p>
                    <div className="d-flex justify-content-center gap-3 flex-wrap">
                        <button className="btn btn-light btn-lg px-4 fw-semibold" style={{ borderRadius: 12 }} onClick={() => onCambiarVista('chat')}>
                            <i className="bi bi-chat-dots-fill me-2 text-primary"></i>Entrar al Chat
                        </button>
                        <button className="btn btn-outline-light btn-lg px-4 fw-semibold" style={{ borderRadius: 12 }} onClick={() => onCambiarVista('login-colaborar')}>
                            <i className="bi bi-handshake me-2"></i>Colaborar
                        </button>
                    </div>
                </div>
            </div>

            <footer className="bg-white border-top py-4">
                <div className="container d-flex flex-wrap justify-content-between align-items-center gap-3">
                    <div className="d-flex align-items-center gap-2">
                        <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg, #0d6efd, #6610f2)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <i className="bi bi-grid-3x3-gap-fill text-white" style={{ fontSize: '0.75rem' }}></i>
                        </div>
                        <span className="fw-semibold text-dark" style={{ fontSize: '0.9rem' }}>WorkSphere</span>
                    </div>
                    <div className="d-flex gap-3">
                        <span className="text-muted small d-flex align-items-center gap-1"><i className="bi bi-phone-fill text-success"></i> App Móvil</span>
                        <span className="text-muted small d-flex align-items-center gap-1"><i className="bi bi-display-fill text-warning"></i> Escritorio</span>
                        <span className="text-muted small d-flex align-items-center gap-1"><i className="bi bi-globe2 text-primary"></i> Web</span>
                    </div>
                    <span className="text-muted small">Todos los derechos reservados</span>
                </div>
            </footer>
        </div>
    );
};

export default Inicio;