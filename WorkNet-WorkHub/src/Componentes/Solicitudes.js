/**
 * COMPONENTE SOLICITUDES - ACTUALIZADO
 * 
 * Funcionalidad principal:
 * - Lista de solicitudes de amistad recibidas y pendientes
 * - Visualización de datos del remitente (foto, nombre, email, fecha)
 * - Visualización de la razón/motivo de la solicitud
 * - Opciones para aceptar o rechazar solicitudes
 * - Notificación al componente padre cuando se acepta una solicitud
 * - Indicador de carga mientras obtiene datos
 * - Contador de solicitudes pendientes en el encabezado
 */

import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const Solicitudes = ({ usuario, onSolicitudAceptada }) => {
    // Estados del componente
    const [solicitudes, setSolicitudes] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [solicitudExpandida, setSolicitudExpandida] = useState(null);

    // Función para cargar las solicitudes pendientes
    const cargarSolicitudes = React.useCallback(async () => {
        try {
            setCargando(true);
            const res = await fetch(`http://dam2.colexio-karbo.com:6101/api/amistades/solicitudes/${usuario._id}`);
            const data = await res.json();
            setSolicitudes(data);
        } catch (err) {
            console.error('Error al cargar solicitudes:', err);
        } finally {
            setCargando(false);
        }
    }, [usuario._id]);

    // Cargar solicitudes al montar el componente
    useEffect(() => {
        cargarSolicitudes();
    }, [cargarSolicitudes]);

    // Función para aceptar una solicitud
    const aceptarSolicitud = async (solicitudId) => {
        try {
            const res = await fetch(`http://dam2.colexio-karbo.com:6101/api/amistades/aceptar/${solicitudId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' }
            });

            if (res.ok) {
                alert('Solicitud aceptada. Ya puedes chatear con tu nuevo amigo.');
                cargarSolicitudes();

                // Notificar al componente padre para actualizar conversaciones
                if (onSolicitudAceptada) {
                    onSolicitudAceptada();
                }
            } else {
                const data = await res.json();
                alert(data.error || 'Error al aceptar solicitud');
            }
        } catch (err) {
            alert('Error al aceptar solicitud');
            console.error(err);
        }
    };

    // Función para rechazar una solicitud
    const rechazarSolicitud = async (solicitudId) => {
        try {
            const res = await fetch(`http://dam2.colexio-karbo.com:6101/api/amistades/rechazar/${solicitudId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' }
            });

            if (res.ok) {
                alert('Solicitud rechazada');
                cargarSolicitudes();
            } else {
                const data = await res.json();
                alert(data.error || 'Error al rechazar solicitud');
            }
        } catch (err) {
            alert('Error al rechazar solicitud');
            console.error(err);
        }
    };

    // Mostrar indicador de carga
    if (cargando) {
        return (
            <div className="card shadow-sm">
                <div className="card-body text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                    <p className="mt-3 text-muted">Cargando solicitudes...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="card shadow-sm">
            {/* Encabezado con contador */}
            <div className="card-header bg-primary text-white">
                <h5 className="mb-0">
                    <i className="bi bi-envelope-open me-2"></i>
                    Solicitudes de Amistad
                    {solicitudes.length > 0 && (
                        <span className="badge bg-light text-primary ms-2">{solicitudes.length}</span>
                    )}
                </h5>
            </div>

            <div className="card-body">
                {/* Mensaje cuando no hay solicitudes */}
                {solicitudes.length === 0 ? (
                    <div className="text-center text-muted py-5">
                        <i className="bi bi-inbox display-1 d-block mb-3 opacity-50"></i>
                        <p className="mb-0">No tienes solicitudes pendientes</p>
                    </div>
                ) : (
                    // Lista de solicitudes
                    <div className="list-group">
                        {solicitudes.map(solicitud => (
                            <div key={solicitud._id} className="list-group-item">
                                <div className="d-flex justify-content-between align-items-start gap-3">
                                    <div className="d-flex align-items-start flex-grow-1">
                                        {/* Imagen de perfil del remitente */}
                                        {solicitud.remitente?.imagenPerfil ? (
                                            <img
                                                src={solicitud.remitente.imagenPerfil}
                                                alt={solicitud.remitente.nombre}
                                                className="rounded-circle me-3 flex-shrink-0"
                                                style={{
                                                    width: '50px',
                                                    height: '50px',
                                                    objectFit: 'cover',
                                                    border: '2px solid #0d6efd'
                                                }}
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextElementSibling.style.display = 'flex';
                                                }}
                                            />
                                        ) : null}

                                        {/* Avatar con inicial si no hay imagen */}
                                        <div
                                            className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3 flex-shrink-0"
                                            style={{
                                                width: '50px',
                                                height: '50px',
                                                fontSize: '1.5rem',
                                                display: solicitud.remitente?.imagenPerfil ? 'none' : 'flex'
                                            }}
                                        >
                                            {solicitud.remitente?.nombre?.charAt(0).toUpperCase() || 'U'}
                                        </div>

                                        {/* Información del remitente y solicitud */}
                                        <div className="flex-grow-1">
                                            <h6 className="mb-1">
                                                <strong>{solicitud.remitente?.nombre || 'Usuario'}</strong>
                                            </h6>
                                            <small className="text-muted d-block mb-2">
                                                <i className="bi bi-envelope me-1"></i>
                                                {solicitud.remitente?.email || ''}
                                            </small>
                                            <small className="text-muted d-block mb-3">
                                                <i className="bi bi-calendar me-1"></i>
                                                {new Date(solicitud.createdAt).toLocaleDateString('es-ES', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric'
                                                })}
                                            </small>

                                            {/* Sección de razón */}
                                            {solicitud.razon && (
                                                <div className="mt-3 p-3 bg-light rounded border-start border-4 border-info">
                                                    <div className="d-flex align-items-center mb-2">
                                                        <i className="bi bi-chat-dots text-info me-2"></i>
                                                        <small className="fw-bold text-muted">Razón de la solicitud:</small>
                                                    </div>
                                                    <p className="mb-0 text-break">
                                                        {solicitud.razon.length > 150 && solicitudExpandida !== solicitud._id ? (
                                                            <>
                                                                {solicitud.razon.substring(0, 150)}...
                                                                <button
                                                                    className="btn btn-link btn-sm p-0 ms-1"
                                                                    onClick={() => setSolicitudExpandida(solicitud._id)}
                                                                >
                                                                    Ver más
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                {solicitud.razon}
                                                                {solicitud.razon.length > 150 && solicitudExpandida === solicitud._id && (
                                                                    <button
                                                                        className="btn btn-link btn-sm p-0 ms-1"
                                                                        onClick={() => setSolicitudExpandida(null)}
                                                                    >
                                                                        Ver menos
                                                                    </button>
                                                                )}
                                                            </>
                                                        )}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Botones de acción */}
                                    <div className="d-flex gap-2 flex-shrink-0">
                                        <button
                                            className="btn btn-success btn-sm"
                                            onClick={() => aceptarSolicitud(solicitud._id)}
                                            title="Aceptar solicitud"
                                        >
                                            <i className="bi bi-check-circle me-1"></i>
                                            <span className="d-none d-sm-inline">Aceptar</span>
                                        </button>
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => rechazarSolicitud(solicitud._id)}
                                            title="Rechazar solicitud"
                                        >
                                            <i className="bi bi-x-circle me-1"></i>
                                            <span className="d-none d-sm-inline">Rechazar</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Solicitudes;