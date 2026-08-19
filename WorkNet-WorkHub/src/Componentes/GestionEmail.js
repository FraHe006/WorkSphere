/**
 * COMPONENTE GESTIÓN - EMAIL
 *
 * Dos secciones:
 *  1. Redactar y enviar correo (estilo draft de Gmail).
 *  2. Listado de correos previamente contactados (guardados en el
 *     perfil del usuario logueado, array `correosContactados`).
 *
 * Mismo estilo visual que GestionTabla.
 */

import React, { useState, useEffect } from 'react';

const API = 'http://dam2.colexio-karbo.com:6101/api';
const STORAGE_KEY = 'usuario_colaborar';

const GestionEmail = ({ usuario }) => {
    //  Estado: redactar correo 
    const [destinatario, setDestinatario] = useState('');
    const [asunto, setAsunto] = useState('');
    const [cuerpo, setCuerpo] = useState('');
    const [erroresForm, setErroresForm] = useState({});
    const [enviando, setEnviando] = useState(false);
    const [mensajeExito, setMensajeExito] = useState('');
    const [error, setError] = useState('');

    //  Estado: contactos / correos previos 
    const [contactos, setContactos] = useState(usuario?.correosContactados || []);
    const [busqueda, setBusqueda] = useState('');

    //  Estado: bandeja de correos recibidos 
    const [correosRecibidos, setCorreosRecibidos] = useState([]);
    const [cargandoRecibidos, setCargandoRecibidos] = useState(false);
    const [errorRecibidos, setErrorRecibidos] = useState('');
    const [correoSeleccionado, setCorreoSeleccionado] = useState(null);

    useEffect(() => {
        setContactos(usuario?.correosContactados || []);
    }, [usuario]);

    // Cargar correos recibidos cuando cambien los contactos
    useEffect(() => {
        if (contactos.length > 0) {
            cargarCorreosRecibidos();
        } else {
            setCorreosRecibidos([]);
        }
    }, [JSON.stringify(contactos)]);

    const cargarCorreosRecibidos = async () => {
        setCargandoRecibidos(true);
        setErrorRecibidos('');
        try {
            const res = await fetch(`${API}/email/recibidos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ remitentes: contactos }),
            });

            const data = await res.json();

            if (!res.ok || data.success === false) {
                throw new Error(data.error || 'Error al cargar correos recibidos');
            }

            setCorreosRecibidos(data.correos || []);
        } catch (err) {
            setErrorRecibidos(err.message);
        } finally {
            setCargandoRecibidos(false);
        }
    };

    const formatearFecha = (fechaStr) => {
        try {
            const f = new Date(fechaStr);
            return f.toLocaleString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch (_) {
            return fechaStr;
        }
    };

    //  Validación del formulario 
    const validarForm = () => {
        const err = {};
        if (!destinatario.trim()) err.destinatario = 'Requerido';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(destinatario.trim())) err.destinatario = 'Email no válido';
        if (!asunto.trim()) err.asunto = 'Requerido';
        if (!cuerpo.trim()) err.cuerpo = 'Requerido';
        setErroresForm(err);
        return Object.keys(err).length === 0;
    };

    //  Enviar correo 
    const enviarCorreo = async () => {
        if (!validarForm()) return;

        setEnviando(true);
        setError('');
        setMensajeExito('');

        try {
            const res = await fetch(`${API}/email/enviar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ destinatario: destinatario.trim(), asunto, cuerpo }),
            });

            const data = await res.json();

            if (!res.ok || data.success === false) {
                throw new Error(data.error || 'Error al enviar el correo');
            }

            // Guardar el contacto en el perfil del usuario
            await registrarContacto(destinatario.trim());

            setMensajeExito(`Correo enviado correctamente a ${destinatario.trim()}`);
            setDestinatario('');
            setAsunto('');
            setCuerpo('');
            setErroresForm({});
        } catch (err) {
            setError(err.message);
        } finally {
            setEnviando(false);
        }
    };

    // Registrar el destinatario en el array correosContactados del usuario 
    const registrarContacto = async (email) => {
        try {
            const yaExiste = contactos.includes(email);

            const res = await fetch(`${API}/usuarios/${usuario._id}/contactos-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            if (!res.ok) throw new Error('No se pudo registrar el contacto');
            const data = await res.json();

            const nuevosContactos = data.correosContactados || (yaExiste ? contactos : [...contactos, email]);
            setContactos(nuevosContactos);

            // Sincronizar localStorage para que persista la sesión
            try {
                const guardado = JSON.parse(localStorage.getItem(STORAGE_KEY));
                if (guardado) {
                    guardado.correosContactados = nuevosContactos;
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(guardado));
                }
            } catch (_) { /* no-op */ }
        } catch (_) {
            // No bloquea el flujo de envío si falla el registro del contacto
        }
    };

    // Reutilizar contacto en el formulario 
    const usarContacto = (email) => {
        setDestinatario(email);
        setMensajeExito('');
        setError('');
    };

    // Eliminar contacto 
    const eliminarContacto = async (email) => {
        try {
            const res = await fetch(`${API}/usuarios/${usuario._id}/contactos-email`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();
            const nuevosContactos = data.correosContactados ?? contactos.filter((c) => c !== email);
            setContactos(nuevosContactos);

            try {
                const guardado = JSON.parse(localStorage.getItem(STORAGE_KEY));
                if (guardado) {
                    guardado.correosContactados = nuevosContactos;
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(guardado));
                }
            } catch (_) { /* no-op */ }
        } catch (_) {
            // ignorar
        }
    };

    // Filtro de contactos 
    const contactosFiltrados = contactos.filter((c) =>
        c.toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
        <div className="row g-3 h-100">
            {/* COLUMNA IZQUIERDA: REDACTAR + CONTACTOS ¡ */}
            <div className="col-12 col-lg-5 h-100 d-flex flex-column gap-3">¡
                <div className="card shadow-sm flex-shrink-0">
                    <div className="card-header bg-white d-flex align-items-center gap-2">
                        <i className="bi bi-envelope-plus-fill text-primary"></i>
                        <span className="fw-semibold">Nuevo mensaje</span>
                    </div>

                    <div className="card-body p-0">
                        {/* Para */}
                        <div className="px-3 py-2 border-bottom">
                            <div className="d-flex align-items-center">
                                <label className="text-muted small me-2" style={{ width: 50 }}>Para</label>
                                <input
                                    type="email"
                                    className={`form-control form-control-sm border-0 ${erroresForm.destinatario ? 'is-invalid' : ''}`}
                                    placeholder="destinatario@correo.com"
                                    value={destinatario}
                                    onChange={(e) => setDestinatario(e.target.value)}
                                />
                            </div>
                            {erroresForm.destinatario && (
                                <div className="text-danger small mt-1 ms-5 ps-1">{erroresForm.destinatario}</div>
                            )}
                        </div>

                        {/* Asunto */}
                        <div className="px-3 py-2 border-bottom">
                            <div className="d-flex align-items-center">
                                <label className="text-muted small me-2" style={{ width: 50 }}>Asunto</label>
                                <input
                                    type="text"
                                    className={`form-control form-control-sm border-0 ${erroresForm.asunto ? 'is-invalid' : ''}`}
                                    placeholder="Asunto del correo"
                                    value={asunto}
                                    onChange={(e) => setAsunto(e.target.value)}
                                />
                            </div>
                            {erroresForm.asunto && (
                                <div className="text-danger small mt-1 ms-5 ps-1">{erroresForm.asunto}</div>
                            )}
                        </div>

                        {/* Cuerpo */}
                        <div className="px-3 py-2">
                            <textarea
                                className={`form-control border-0 ${erroresForm.cuerpo ? 'is-invalid' : ''}`}
                                rows={5}
                                placeholder="Escribe tu mensaje…"
                                value={cuerpo}
                                onChange={(e) => setCuerpo(e.target.value)}
                                style={{ resize: 'vertical' }}
                            ></textarea>
                            {erroresForm.cuerpo && (
                                <div className="invalid-feedback d-block">{erroresForm.cuerpo}</div>
                            )}
                        </div>
                    </div>

                    <div className="card-footer bg-white d-flex justify-content-between align-items-center flex-wrap gap-2">
                        <div>
                            {error && (
                                <span className="text-danger small">
                                    <i className="bi bi-exclamation-triangle-fill me-1"></i>{error}
                                </span>
                            )}
                            {mensajeExito && (
                                <span className="text-success small">
                                    <i className="bi bi-check-circle-fill me-1"></i>{mensajeExito}
                                </span>
                            )}
                        </div>
                        <button
                            className="btn btn-primary px-4"
                            onClick={enviarCorreo}
                            disabled={enviando}
                        >
                            {enviando ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                    Enviando…
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-send-fill me-2"></i>Enviar
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Contactos */}
                <div className="card shadow-sm flex-grow-1 d-flex flex-column" style={{ minHeight: 0 }}>
                    <div className="card-header bg-white d-flex justify-content-between align-items-center flex-shrink-0">
                        <span className="fw-semibold">
                            <i className="bi bi-people-fill me-2 text-primary"></i>
                            Contactos
                            <span className="badge bg-primary ms-2" style={{ fontSize: '0.75rem' }}>
                                {contactos.length}
                            </span>
                        </span>
                    </div>

                    {contactos.length > 0 && (
                        <div className="px-3 pt-3 flex-shrink-0">
                            <div className="input-group input-group-sm">
                                <span className="input-group-text bg-white">
                                    <i className="bi bi-search text-muted"></i>
                                </span>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Buscar correo…"
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    <div className="card-body flex-grow-1 overflow-auto" style={{ minHeight: 0 }}>
                        {contactosFiltrados.length === 0 ? (
                            <p className="text-muted text-center py-4 mb-0">
                                {busqueda
                                    ? 'Sin resultados.'
                                    : 'Aún no has enviado correos a nadie.'}
                            </p>
                        ) : (
                            <ul className="list-group list-group-flush">
                                {contactosFiltrados.map((email) => (
                                    <li
                                        key={email}
                                        className="list-group-item d-flex justify-content-between align-items-center px-0"
                                    >
                                        <span className="d-flex align-items-center gap-2">
                                            <i className="bi bi-envelope text-muted"></i>
                                            <span className="small">{email}</span>
                                        </span>
                                        <button
                                            className="btn btn-sm btn-outline-primary"
                                            title="Usar este correo"
                                            onClick={() => usarContacto(email)}
                                        >
                                            <i className="bi bi-arrow-up-right-square"></i>
                                        </button>
                                        <button
                                            className="btn btn-sm btn-outline-danger ms-1"
                                            title="Eliminar contacto"
                                            onClick={() => eliminarContacto(email)}
                                        >
                                            <i className="bi bi-trash"></i>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>

            {/* COLUMNA DERECHA: BANDEJA DE ENTRADA  */}
            <div className="col-12 col-lg-7 h-100 d-flex flex-column" style={{ minHeight: 0 }}>
                <div className="card shadow-sm flex-grow-1 d-flex flex-column" style={{ minHeight: 0 }}>
                    <div className="card-header bg-white d-flex justify-content-between align-items-center flex-shrink-0">
                        <span className="fw-semibold">
                            <i className="bi bi-inbox-fill me-2 text-primary"></i>
                            Correos recibidos
                        </span>
                        <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={cargarCorreosRecibidos}
                            disabled={cargandoRecibidos || contactos.length === 0}
                        >
                            <i className="bi bi-arrow-clockwise me-1"></i>Actualizar
                        </button>
                    </div>

                    <div className="card-body p-0 flex-grow-1 overflow-auto" style={{ minHeight: 0 }}>
                        {errorRecibidos && (
                            <div className="alert alert-danger m-3 mb-0">
                                <i className="bi bi-exclamation-triangle-fill me-2"></i>{errorRecibidos}
                            </div>
                        )}

                        {cargandoRecibidos ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary" role="status"></div>
                                <p className="text-muted mt-3 mb-0">Cargando correos…</p>
                            </div>
                        ) : correosRecibidos.length === 0 ? (
                            <p className="text-muted text-center py-4 mb-0">
                                {contactos.length === 0
                                    ? 'Envía un correo a alguien para empezar a ver respuestas aquí.'
                                    : 'No hay correos recibidos de tus contactos.'}
                            </p>
                        ) : (
                            <ul className="list-group list-group-flush">
                                {correosRecibidos.map((c) => (
                                    <li
                                        key={`${c.remitente}-${c.id}`}
                                        className="list-group-item list-group-item-action d-flex align-items-center gap-3"
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => setCorreoSeleccionado(c)}
                                    >
                                        <div
                                            className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center flex-shrink-0"
                                            style={{ width: 40, height: 40, fontSize: '1rem' }}
                                        >
                                            {c.remitente?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-grow-1" style={{ minWidth: 0 }}>
                                            <div className="d-flex justify-content-between align-items-baseline">
                                                <span className="fw-semibold text-truncate me-2">{c.remitente}</span>
                                                <span className="text-muted small text-nowrap">
                                                    {formatearFecha(c.fecha)}
                                                </span>
                                            </div>
                                            <div className="text-truncate">{c.asunto}</div>
                                            <div className="text-muted small text-truncate">
                                                {c.cuerpo?.replace(/\s+/g, ' ').trim().slice(0, 100)}
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>

            {/* MODAL: Ver correo recibido */}
            {correoSeleccionado && (
                <div className="modal d-block" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title text-truncate">{correoSeleccionado.asunto}</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setCorreoSeleccionado(null)}
                                ></button>
                            </div>
                            <div className="modal-body" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
                                <div className="d-flex align-items-start gap-3 mb-3">
                                    <div
                                        className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center flex-shrink-0"
                                        style={{ width: 44, height: 44, fontSize: '1.1rem' }}
                                    >
                                        {correoSeleccionado.remitente?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-grow-1" style={{ minWidth: 0 }}>
                                        <div className="d-flex justify-content-between align-items-baseline flex-wrap gap-1">
                                            <span className="fw-semibold">{correoSeleccionado.remitente}</span>
                                            <span className="text-muted small">
                                                {formatearFecha(correoSeleccionado.fecha)}
                                            </span>
                                        </div>
                                        <div className="text-muted small">
                                            Para: {usuario?.email}
                                        </div>
                                    </div>
                                </div>

                                <hr />

                                <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                    {correoSeleccionado.cuerpo}
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setCorreoSeleccionado(null)}
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GestionEmail;