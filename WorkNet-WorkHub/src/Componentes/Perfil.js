/**
 * COMPONENTE PERFIL
 * 
 * Funcionalidad principal:
 * - Visualización y edición de datos del perfil de usuario
 * - Cambio de nombre, email y contraseña
 * - Carga de imagen de perfil mediante URL
 * - Validación de datos (email, longitud de contraseña, coincidencia de contraseñas)
 * - Vista previa de imagen de perfil
 * - Modo edición/vista con botones de guardar y cancelar
 * - Persistencia de cambios en localStorage y API
 * - Indicadores de carga y mensajes de error/éxito
 */

import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const Perfil = ({ usuario, onUsuarioActualizado }) => {
    // Estados del formulario
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        password: '',
        confirmarPassword: '',
        imagenPerfil: '',
        descripcion: ''
    });

    // Estados de la interfaz
    const [imagenPreview, setImagenPreview] = useState('');
    const [cargandoImagen, setCargandoImagen] = useState(false);
    const [errorImagen, setErrorImagen] = useState('');
    const [guardando, setGuardando] = useState(false);
    const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
    const [mostrarPassword, setMostrarPassword] = useState(false);
    const [editando, setEditando] = useState(false);

    // Cargar datos del usuario al montar el componente
    useEffect(() => {
        if (usuario) {
            setFormData({
                nombre: usuario.nombre || '',
                email: usuario.email || '',
                password: '',
                confirmarPassword: '',
                imagenPerfil: usuario.imagenPerfil || '',
                descripcion: usuario.descripcion || ''
            });
            setImagenPreview(usuario.imagenPerfil || '');
        }
    }, [usuario]);

    // Manejador de cambios en campos del formulario
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Limpiar mensajes al editar
        if (mensaje.texto) {
            setMensaje({ tipo: '', texto: '' });
        }
    };

    // Manejador de cambio de URL de imagen
    const handleImagenUrlChange = (e) => {
        const url = e.target.value;
        setFormData(prev => ({
            ...prev,
            imagenPerfil: url
        }));

        if (url.trim()) {
            cargarImagenPreview(url);
        } else {
            setImagenPreview('');
            setErrorImagen('');
        }
    };

    // Función para cargar y validar la imagen
    const cargarImagenPreview = async (url) => {
        setCargandoImagen(true);
        setErrorImagen('');

        // Crear elemento de imagen para validación
        const img = new Image();

        img.onload = () => {
            setImagenPreview(url);
            setCargandoImagen(false);
            setErrorImagen('');
        };

        img.onerror = () => {
            setImagenPreview('');
            setCargandoImagen(false);
            setErrorImagen('No se pudo cargar la imagen. Verifica que la URL sea válida y pública.');
        };

        img.src = url;
    };

    // Función para validar el formulario
    const validarFormulario = () => {
        if (!formData.nombre.trim()) {
            setMensaje({ tipo: 'danger', texto: 'El nombre es obligatorio' });
            return false;
        }

        if (!formData.email.trim()) {
            setMensaje({ tipo: 'danger', texto: 'El email es obligatorio' });
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setMensaje({ tipo: 'danger', texto: 'El email no es válido' });
            return false;
        }

        if (formData.password && formData.password.length < 6) {
            setMensaje({ tipo: 'danger', texto: 'La contraseña debe tener al menos 6 caracteres' });
            return false;
        }

        if (formData.password && formData.password !== formData.confirmarPassword) {
            setMensaje({ tipo: 'danger', texto: 'Las contraseñas no coinciden' });
            return false;
        }

        if (errorImagen) {
            setMensaje({ tipo: 'danger', texto: 'Hay un error con la imagen de perfil' });
            return false;
        }

        return true;
    };

    // Manejador del envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validarFormulario()) {
            return;
        }

        setGuardando(true);
        setMensaje({ tipo: '', texto: '' });

        try {
            // Preparar datos para actualizar
            const datosActualizar = {
                nombre: formData.nombre,
                email: formData.email,
                imagenPerfil: formData.imagenPerfil,
                descripcion: formData.descripcion
            };

            // Incluir contraseña solo si se proporcionó
            if (formData.password) {
                datosActualizar.password = formData.password;
            }

            // Petición a la API
            const res = await fetch(`http://dam2.colexio-karbo.com:6101/api/usuarios/${usuario._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(datosActualizar)
            });

            const data = await res.json();

            if (res.ok) {
                setMensaje({ tipo: 'success', texto: 'Perfil actualizado exitosamente' });

                // Actualizar usuario en localStorage
                const usuarioActualizado = {
                    ...usuario,
                    nombre: formData.nombre,
                    email: formData.email,
                    imagenPerfil: formData.imagenPerfil
                };
                localStorage.setItem('usuario', JSON.stringify(usuarioActualizado));

                // Notificar al componente padre
                if (onUsuarioActualizado) {
                    onUsuarioActualizado(usuarioActualizado);
                }

                // Limpiar campos de contraseña
                setFormData(prev => ({
                    ...prev,
                    password: '',
                    confirmarPassword: ''
                }));

                setEditando(false);

                // Limpiar mensaje después de 3 segundos
                setTimeout(() => {
                    setMensaje({ tipo: '', texto: '' });
                }, 3000);
            } else {
                setMensaje({ tipo: 'danger', texto: data.error || 'Error al actualizar el perfil' });
            }
        } catch (error) {
            setMensaje({ tipo: 'danger', texto: 'Error de conexión. Intenta nuevamente.' });
        } finally {
            setGuardando(false);
        }
    };

    // Función para cancelar la edición
    const cancelarEdicion = () => {
        // Restaurar datos originales
        setFormData({
            nombre: usuario.nombre || '',
            email: usuario.email || '',
            password: '',
            confirmarPassword: '',
            imagenPerfil: usuario.imagenPerfil || ''
        });
        setImagenPreview(usuario.imagenPerfil || '');
        setErrorImagen('');
        setMensaje({ tipo: '', texto: '' });
        setEditando(false);
    };

    return (
        <div className="container-fluid">
            <div className="row justify-content-center">
                <div className="col-12 col-lg-10 col-xl-8">
                    <div className="card shadow-sm">
                        {/* Encabezado */}
                        <div className="card-header bg-primary text-white">
                            <h5 className="mb-0">
                                <i className="bi bi-person-circle me-2"></i>
                                Mi Perfil
                            </h5>
                        </div>

                        <div className="card-body p-4">
                            {/* Mensaje de estado */}
                            {mensaje.texto && (
                                <div className={`alert alert-${mensaje.tipo} alert-dismissible fade show`} role="alert">
                                    {mensaje.texto}
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => setMensaje({ tipo: '', texto: '' })}
                                    ></button>
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                {/* Sección de imagen de perfil */}
                                <div className="row mb-4">
                                    <div className="col-12 text-center">
                                        <div className="mb-3">
                                            {imagenPreview ? (
                                                <div className="position-relative d-inline-block">
                                                    <img
                                                        src={imagenPreview}
                                                        alt="Perfil"
                                                        className="rounded-circle border border-3 border-primary shadow"
                                                        style={{
                                                            width: '150px',
                                                            height: '150px',
                                                            objectFit: 'cover'
                                                        }}
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                            setErrorImagen('Error al cargar la imagen');
                                                        }}
                                                    />
                                                    {cargandoImagen && (
                                                        <div
                                                            className="position-absolute top-50 start-50 translate-middle"
                                                            style={{ zIndex: 10 }}
                                                        >
                                                            <div className="spinner-border text-primary" role="status">
                                                                <span className="visually-hidden">Cargando...</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div
                                                    className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center border border-3 border-primary shadow"
                                                    style={{
                                                        width: '150px',
                                                        height: '150px',
                                                        fontSize: '4rem'
                                                    }}
                                                >
                                                    {cargandoImagen ? (
                                                        <div className="spinner-border" role="status">
                                                            <span className="visually-hidden">Cargando...</span>
                                                        </div>
                                                    ) : (
                                                        formData.nombre?.charAt(0).toUpperCase() || 'U'
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Campo de URL de imagen */}
                                        <div className="mb-2">
                                            <label className="form-label fw-bold">
                                                <i className="bi bi-image me-2"></i>
                                                Imagen de Perfil
                                            </label>
                                            <div className="input-group">
                                                <span className="input-group-text">
                                                    <i className="bi bi-link-45deg"></i>
                                                </span>
                                                <input
                                                    type="text"
                                                    className={`form-control ${errorImagen ? 'is-invalid' : ''}`}
                                                    name="imagenPerfil"
                                                    value={formData.imagenPerfil}
                                                    onChange={handleImagenUrlChange}
                                                    placeholder="Introduce la URL de tu imagen"
                                                    disabled={!editando}
                                                />
                                            </div>
                                            {errorImagen && (
                                                <div className="text-danger small mt-1">
                                                    <i className="bi bi-exclamation-circle me-1"></i>
                                                    {errorImagen}
                                                </div>
                                            )}
                                            <small className="text-muted">
                                                Introduce la URL de una imagen pública
                                            </small>
                                        </div>
                                    </div>
                                </div>

                                <hr className="my-4" />

                                {/* Datos personales */}
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-bold">
                                            <i className="bi bi-person me-2"></i>
                                            Nombre
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="nombre"
                                            value={formData.nombre}
                                            onChange={handleChange}
                                            placeholder="Tu nombre"
                                            disabled={!editando}
                                            required
                                        />
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-bold">
                                            <i className="bi bi-envelope me-2"></i>
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="tu@email.com"
                                            disabled={true}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Descripción */}
                                <div className="mb-3">
                                    <label className="form-label fw-bold">
                                        <i className="bi bi-chat-left-text me-2"></i>
                                        Descripción
                                    </label>
                                    <textarea
                                        className="form-control"
                                        name="descripcion"
                                        value={formData.descripcion}
                                        onChange={handleChange}
                                        placeholder="Cuéntanos algo sobre ti..."
                                        disabled={!editando}
                                        rows="4"
                                    />
                                    <small className="text-muted">
                                        Máximo 500 caracteres
                                    </small>
                                </div>

                                {/* Cambiar contraseña */}
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-bold">
                                            Nueva Contraseña
                                        </label>
                                        <div className="input-group">
                                            <input
                                                type={mostrarPassword ? 'text' : 'password'}
                                                className="form-control"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                placeholder="Mínimo 6 caracteres"
                                                disabled={!editando}
                                                minLength={6}
                                            />
                                            <button
                                                className="btn btn-outline-secondary"
                                                type="button"
                                                onClick={() => setMostrarPassword(!mostrarPassword)}
                                                disabled={!editando}
                                            >
                                                <i className={`bi bi-eye${mostrarPassword ? '-slash' : ''}`}></i>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-bold">
                                            Confirmar Contraseña
                                        </label>
                                        <input
                                            type={mostrarPassword ? 'text' : 'password'}
                                            className="form-control"
                                            name="confirmarPassword"
                                            value={formData.confirmarPassword}
                                            onChange={handleChange}
                                            placeholder="Repite la contraseña"
                                            disabled={!editando}
                                        />
                                    </div>
                                </div>

                                {/* Botones de acción */}
                                <div className="d-flex justify-content-end gap-2 mt-4">
                                    {!editando ? (
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            onClick={() => setEditando(true)}
                                        >
                                            <i className="bi bi-pencil me-2"></i>
                                            Editar Perfil
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                type="button"
                                                className="btn btn-secondary"
                                                onClick={cancelarEdicion}
                                                disabled={guardando}
                                            >
                                                <i className="bi bi-x-circle me-2"></i>
                                                Cancelar
                                            </button>
                                            <button
                                                type="submit"
                                                className="btn btn-success"
                                                disabled={guardando || cargandoImagen}
                                            >
                                                {guardando ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                        Guardando...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="bi bi-check-circle me-2"></i>
                                                        Guardar Cambios
                                                    </>
                                                )}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Perfil;