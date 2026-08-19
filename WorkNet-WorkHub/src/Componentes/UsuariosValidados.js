/**
 * COMPONENTE USUARIOS VALIDADOS
 * 
 * Funcionalidad principal:
 * - Mostrar lista de usuarios con estado "validado" = true
 * - Visualización de datos del usuario (foto, nombre, email, descripción)
 * - Modal para enviar solicitud de amistad con razón/motivo
 * - Validación de campos
 * - Manejo de errores y feedback al usuario
 * - Indicador de carga
 */

import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const UsuariosValidados = ({ usuario, onSolicitudEnviada }) => {
    // Estados del componente
    const [usuarios, setUsuarios] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
    const [razon, setRazon] = useState('');
    const [enviandoSolicitud, setEnviandoSolicitud] = useState(false);
    const [mensajeError, setMensajeError] = useState('');

    // Función para cargar usuarios validados
    const cargarUsuariosValidados = React.useCallback(async () => {
        try {
            setCargando(true);
            setMensajeError('');
            const res = await fetch('http://dam2.colexio-karbo.com:6101/api/usuarios/validados/lista');

            if (!res.ok) {
                throw new Error('Error al cargar usuarios');
            }

            const data = await res.json();
            // Filtrar el usuario actual de la lista
            const usuariosFiltrados = data.filter(u => u._id !== usuario._id);
            setUsuarios(usuariosFiltrados);
        } catch (err) {
            setMensajeError('Error al cargar usuarios validados');
            console.error(err);
        } finally {
            setCargando(false);
        }
    }, [usuario._id]);

    // Cargar usuarios al montar el componente
    useEffect(() => {
        cargarUsuariosValidados();
    }, [cargarUsuariosValidados]);

    // Abrir modal para enviar solicitud
    const abrirModalSolicitud = (usuarioDestino) => {
        setUsuarioSeleccionado(usuarioDestino);
        setRazon('');
        setMensajeError('');
        setMostrarModal(true);
    };

    // Cerrar modal
    const cerrarModal = () => {
        setMostrarModal(false);
        setUsuarioSeleccionado(null);
        setRazon('');
        setMensajeError('');
    };

    // Enviar solicitud de amistad
    const enviarSolicitud = async () => {
        // Validaciones
        if (!razon.trim()) {
            setMensajeError('Debes escribir una razón para enviar la solicitud');
            return;
        }

        if (razon.trim().length < 5) {
            setMensajeError('La razón debe tener al menos 5 caracteres');
            return;
        }

        if (razon.trim().length > 500) {
            setMensajeError('La razón no puede exceder 500 caracteres');
            return;
        }

        try {
            setEnviandoSolicitud(true);
            setMensajeError('');

            const res = await fetch('http://dam2.colexio-karbo.com:6101/api/amistades/enviar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    remitenteId: usuario._id,
                    destinatarioId: usuarioSeleccionado._id,
                    razon: razon.trim()
                })
            });

            const data = await res.json();

            if (res.ok) {
                alert('Solicitud enviada correctamente');
                cerrarModal();

                // Notificar al componente padre
                if (onSolicitudEnviada) {
                    onSolicitudEnviada();
                }
            } else {
                setMensajeError(data.error || 'Error al enviar solicitud');
            }
        } catch (err) {
            setMensajeError('Error al enviar solicitud');
            console.error(err);
        } finally {
            setEnviandoSolicitud(false);
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
                    <p className="mt-3 text-muted">Cargando usuarios validados...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="card shadow-sm">
                {/* Encabezado */}
                <div className="card-header bg-primary text-white">
                    <h5 className="mb-0">
                        <i className="bi bi-people-fill me-2"></i>
                        Usuarios Disponibles
                        {usuarios.length > 0 && (
                            <span className="badge bg-light text-primary ms-2">{usuarios.length}</span>
                        )}
                    </h5>
                </div>

                <div className="card-body">
                    {/* Mensaje cuando no hay usuarios */}
                    {usuarios.length === 0 ? (
                        <div className="text-center text-muted py-5">
                            <i className="bi bi-search display-1 d-block mb-3 opacity-50"></i>
                            <p className="mb-0">No hay usuarios disponibles en este momento</p>
                        </div>
                    ) : (
                        // Grid de usuarios
                        <div className="row g-4">
                            {usuarios.map(usuarioItem => (
                                <div key={usuarioItem._id} className="col-md-6 col-lg-4">
                                    <div className="card h-100 border-0 shadow-sm hover-shadow transition-all">
                                        {/* Imagen de perfil */}
                                        <div className="position-relative">
                                            {usuarioItem.imagenPerfil ? (
                                                <img
                                                    src={usuarioItem.imagenPerfil}
                                                    alt={usuarioItem.nombre}
                                                    className="card-img-top"
                                                    style={{
                                                        height: '200px',
                                                        objectFit: 'cover'
                                                    }}
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.nextElementSibling.style.display = 'flex';
                                                    }}
                                                />
                                            ) : null}

                                            {/* Badge de validado */}
                                            <div className="position-absolute top-0 end-0 m-2">
                                                <span className="badge bg-primary">
                                                    <i className="bi bi-check-circle-fill me-1"></i>
                                                    Validado
                                                </span>
                                            </div>
                                        </div>

                                        {/* Contenido de la tarjeta */}
                                        <div className="card-body">
                                            <h6 className="card-title mb-1">{usuarioItem.nombre}</h6>
                                            <small className="text-muted d-block mb-3">
                                                <i className="bi bi-envelope me-1"></i>
                                                {usuarioItem.email}
                                            </small>

                                            {/* Descripción */}
                                            {usuarioItem.descripcion && (
                                                <p className="card-text small mb-3 text-muted">
                                                    {usuarioItem.descripcion.length > 80
                                                        ? usuarioItem.descripcion.substring(0, 80) + '...'
                                                        : usuarioItem.descripcion}
                                                </p>
                                            )}

                                            {/* Botón para enviar solicitud */}
                                            <button
                                                className="btn btn-primary btn-sm w-100"
                                                onClick={() => abrirModalSolicitud(usuarioItem)}
                                            >
                                                <i className="bi bi-person-plus me-1"></i>
                                                Enviar Solicitud
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal para enviar solicitud */}
            {mostrarModal && usuarioSeleccionado && (
                <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            {/* Encabezado del modal */}
                            <div className="modal-header bg-primary text-white">
                                <h5 className="modal-title">
                                    <i className="bi bi-envelope-plus me-2"></i>
                                    Enviar Solicitud a {usuarioSeleccionado.nombre}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close btn-close-white"
                                    onClick={cerrarModal}
                                    disabled={enviandoSolicitud}
                                ></button>
                            </div>

                            {/* Cuerpo del modal */}
                            <div className="modal-body">
                                {/* Información del usuario destino */}
                                <div className="d-flex align-items-center mb-4 pb-3 border-bottom">
                                    {usuarioSeleccionado.imagenPerfil ? (
                                        <img
                                            src={usuarioSeleccionado.imagenPerfil}
                                            alt={usuarioSeleccionado.nombre}
                                            className="rounded-circle me-3"
                                            style={{
                                                width: '60px',
                                                height: '60px',
                                                objectFit: 'cover'
                                            }}
                                        />
                                    ) : (
                                        <div
                                            className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3"
                                            style={{
                                                width: '60px',
                                                height: '60px',
                                                fontSize: '1.5rem'
                                            }}
                                        >
                                            {usuarioSeleccionado.nombre?.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div>
                                        <h6 className="mb-0">{usuarioSeleccionado.nombre}</h6>
                                        <small className="text-muted">{usuarioSeleccionado.email}</small>
                                    </div>
                                </div>

                                {/* Mensaje de error */}
                                {mensajeError && (
                                    <div className="alert alert-danger alert-dismissible fade show mb-3" role="alert">
                                        <i className="bi bi-exclamation-circle me-2"></i>
                                        {mensajeError}
                                        <button
                                            type="button"
                                            className="btn-close"
                                            onClick={() => setMensajeError('')}
                                        ></button>
                                    </div>
                                )}

                                {/* Campo de razón */}
                                <div className="mb-3">
                                    <label htmlFor="razonSolicitud" className="form-label">
                                        <i className="bi bi-chat-dots me-2"></i>
                                        ¿Por qué deseas conectar con este usuario?
                                    </label>
                                    <textarea
                                        id="razonSolicitud"
                                        className="form-control"
                                        rows="4"
                                        placeholder="Cuéntale por qué quieres conectar con él/ella. Sé honesto y respetuoso..."
                                        value={razon}
                                        onChange={(e) => setRazon(e.target.value)}
                                        disabled={enviandoSolicitud}
                                        maxLength="500"
                                    ></textarea>
                                    <small className="text-muted d-block mt-1">
                                        {razon.length}/500 caracteres
                                    </small>
                                </div>

                                {/* Texto informativo */}
                                <div className="alert alert-info mb-0" role="alert">
                                    <i className="bi bi-info-circle me-2"></i>
                                    <small>
                                        El usuario verá tu nombre y tu razón cuando reciba la solicitud.
                                    </small>
                                </div>
                            </div>

                            {/* Pie del modal */}
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={cerrarModal}
                                    disabled={enviandoSolicitud}
                                >
                                    <i className="bi bi-x-circle me-1"></i>
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={enviarSolicitud}
                                    disabled={enviandoSolicitud || !razon.trim()}
                                >
                                    {enviandoSolicitud ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Enviando...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-send me-1"></i>
                                            Enviar Solicitud
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default UsuariosValidados;