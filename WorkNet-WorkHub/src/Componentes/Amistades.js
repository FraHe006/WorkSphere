/**
 * COMPONENTE AMISTADES
 * 
 * Funcionalidad principal:
 * - Lista de amigos del usuario actual
 * - Visualización de foto de perfil o avatar con inicial
 * - Función para eliminar amistades con confirmación
 * - Notificación al componente padre cuando se elimina una amistad
 * - Indicador de carga mientras obtiene datos
 * - Contador de amistades en el encabezado
 */

import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const Amistades = ({ usuario, onAmistadEliminada }) => {
    // Estados del componente
    const [amistades, setAmistades] = useState([]);
    const [cargando, setCargando] = useState(true);

    // Función para cargar la lista de amistades
    const cargarAmistades = React.useCallback(async () => {
        try {
            setCargando(true);
            const res = await fetch(`http://dam2.colexio-karbo.com:6101/api/amistades/${usuario._id}`);
            const data = await res.json();
            setAmistades(data);
        } catch (err) {
            // Error silencioso - podría mostrarse un mensaje al usuario
        } finally {
            setCargando(false);
        }
    }, [usuario._id]);

    // Cargar amistades al montar el componente
    useEffect(() => {
        cargarAmistades();
    }, [cargarAmistades]);

    // Función para eliminar una amistad
    const eliminarAmistad = async (amigoId, nombreAmigo) => {
        // Confirmación antes de eliminar
        if (!window.confirm(`¿Estás seguro de que quieres eliminar a ${nombreAmigo} de tus amigos?`)) {
            return;
        }

        try {
            const res = await fetch(`http://dam2.colexio-karbo.com:6101/api/amistades/${usuario._id}/${amigoId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });

            if (res.ok) {
                alert('Amistad eliminada');
                cargarAmistades();

                // Notificar al componente padre
                if (onAmistadEliminada) {
                    onAmistadEliminada();
                }
            } else {
                const data = await res.json();
                alert(data.error || 'Error al eliminar amistad');
            }
        } catch (err) {
            alert('Error al eliminar amistad');
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
                </div>
            </div>
        );
    }

    return (
        <div className="card shadow-sm">
            {/* Encabezado con contador */}
            <div className="card-header bg-primary text-white">
                <h5 className="mb-0">
                    <i className="bi bi-person-heart me-2"></i>
                    Mis Amistades
                    {amistades.length > 0 && (
                        <span className="badge bg-light text-primary ms-2">{amistades.length}</span>
                    )}
                </h5>
            </div>

            <div className="card-body">
                {/* Mensaje cuando no hay amistades */}
                {amistades.length === 0 ? (
                    <div className="text-center text-muted py-5">
                        <i className="bi bi-person-x display-1 d-block mb-3 opacity-50"></i>
                        <p className="mb-0">No tienes amigos todavía</p>
                    </div>
                ) : (
                    // Lista de amistades
                    <div className="list-group">
                        {amistades.map(amistad => (
                            <div key={amistad._id} className="list-group-item">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div className="d-flex align-items-center">
                                        {/* Imagen de perfil */}
                                        {amistad.imagenPerfil ? (
                                            <img
                                                src={amistad.imagenPerfil}
                                                alt={amistad.nombre}
                                                className="rounded-circle me-3"
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
                                            className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3"
                                            style={{
                                                width: '50px',
                                                height: '50px',
                                                fontSize: '1.5rem',
                                                display: amistad.imagenPerfil ? 'none' : 'flex'
                                            }}
                                        >
                                            {amistad.nombre?.charAt(0).toUpperCase() || 'U'}
                                        </div>

                                        {/* Información del amigo */}
                                        <div>
                                            <h6 className="mb-0">{amistad.nombre || 'Usuario'}</h6>
                                            <small className="text-muted">{amistad.email || ''}</small>
                                        </div>
                                    </div>

                                    {/* Botón de eliminar */}
                                    <div className="d-flex gap-2">
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => eliminarAmistad(amistad._id, amistad.nombre)}
                                        >
                                            <i className="bi bi-trash me-1"></i>
                                            Eliminar
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

export default Amistades;
