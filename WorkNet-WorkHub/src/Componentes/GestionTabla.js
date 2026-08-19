/**
 * COMPONENTE GESTIÓN - TABLA DE USUARIOS VALIDADOS
 *
 * Tabla con CRUD para gestionar usuarios validados.
 * Estos son usuarios con los que se puede comunicar sobre derechos laborales.
 *
 * Campos: nombre, email, contraseña, descripción
 */

import React, { useState, useEffect } from 'react';

const API = 'http://dam2.colexio-karbo.com:6101/api';

const GestionTabla = ({ usuario }) => {
    const [usuarios, setUsuarios] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const [busqueda, setBusqueda] = useState('');

    // Modal
    const [mostrarModal, setMostrarModal] = useState(false);
    const [modoModal, setModoModal] = useState('crear'); // 'crear' | 'editar'
    const [usuarioEdicion, setUsuarioEdicion] = useState(null);
    const [erroresForm, setErroresForm] = useState({});

    // Confirmación borrado
    const [confirmDelete, setConfirmDelete] = useState(null);

    // Cargar usuarios
    useEffect(() => {
        cargarUsuarios();
    }, []);

    const cargarUsuarios = async () => {
        setCargando(true);
        setError('');
        try {
            const res = await fetch(`${API}/usuarios/validados/lista`);
            if (!res.ok) throw new Error('Error al cargar usuarios');
            const data = await res.json();
            setUsuarios(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    };

    //  MODAL: Crear 
    const abrirCrear = () => {
        setModoModal('crear');
        setUsuarioEdicion({
            nombre: '',
            email: '',
            password: '',
            descripcion: '',
        });
        setErroresForm({});
        setMostrarModal(true);
    };

    //  MODAL: Editar 
    const abrirEditar = (u) => {
        setModoModal('editar');
        setUsuarioEdicion({ ...u });
        setErroresForm({});
        setMostrarModal(true);
    };

    //  MODAL: Validar y guardar 
    const validarForm = () => {
        const err = {};
        if (!usuarioEdicion.nombre?.trim()) err.nombre = 'Requerido';
        if (!usuarioEdicion.email?.trim()) err.email = 'Requerido';
        if (!usuarioEdicion.password?.trim()) err.password = 'Requerido';
        setErroresForm(err);
        return Object.keys(err).length === 0;
    };

    const guardarUsuario = async () => {
        if (!validarForm()) return;

        const metodo = modoModal === 'crear' ? 'POST' : 'PUT';
        const url = modoModal === 'crear'
            ? `${API}/usuarios/validados/crear`
            : `${API}/usuarios/validados/${usuarioEdicion._id}`;

        try {
            const res = await fetch(url, {
                method: metodo,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre: usuarioEdicion.nombre,
                    email: usuarioEdicion.email,
                    password: usuarioEdicion.password,
                    descripcion: usuarioEdicion.descripcion,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Error al guardar');
            }

            setMostrarModal(false);
            cargarUsuarios();
        } catch (err) {
            setError(err.message);
        }
    };

    //  BORRAR: Confirmación 
    const confirmarBorrado = async (id) => {
        try {
            const res = await fetch(`${API}/usuarios/validados/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Error al eliminar');
            setConfirmDelete(null);
            cargarUsuarios();
        } catch (err) {
            setError(err.message);
        }
    };

    //  Filtro 
    const usuariosFiltrados = usuarios.filter(u =>
        u.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
        u.email?.toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
        <div>
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="mb-0 fw-semibold">
                    <i className="bi bi-people-fill me-2 text-primary"></i>
                    Usuarios Validados
                    <span className="badge bg-primary ms-2" style={{ fontSize: '0.75rem' }}>
                        {usuarios.length}
                    </span>
                </h5>
                <div className="d-flex gap-2">
                    <div style={{ width: 250 }}>
                        <div className="input-group input-group-sm">
                            <span className="input-group-text bg-white">
                                <i className="bi bi-search text-muted"></i>
                            </span>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Buscar…"
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                            />
                        </div>
                    </div>
                    <button className="btn btn-sm btn-primary" onClick={abrirCrear}>
                        <i className="bi bi-plus-lg me-1"></i>Nuevo
                    </button>
                </div>
            </div>

            {error && (
                <div className="alert alert-danger d-flex align-items-center gap-2 mb-3">
                    <i className="bi bi-exclamation-triangle-fill"></i>
                    {error}
                    <button
                        className="btn-close ms-auto"
                        onClick={() => setError('')}
                        aria-label="Close"
                    ></button>
                </div>
            )}

            {/* Tabla */}
            {cargando ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                    <p className="text-muted mt-3 mb-0">Cargando…</p>
                </div>
            ) : (
                <div className="card shadow-sm">
                    <div className="table-responsive">
                        <table className="table table-hover table-striped mb-0 align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th style={{ width: 50 }}>#</th>
                                    <th>Nombre</th>
                                    <th>Email</th>
                                    <th>Descripción</th>
                                    <th style={{ width: 140 }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usuariosFiltrados.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="text-center text-muted py-4">
                                            {busqueda ? 'Sin resultados.' : 'No hay usuarios validados.'}
                                        </td>
                                    </tr>
                                ) : (
                                    usuariosFiltrados.map((u, i) => (
                                        <tr key={u._id}>
                                            <td className="text-muted small">{i + 1}</td>
                                            <td>
                                                <span className="fw-medium">{u.nombre}</span>
                                            </td>
                                            <td className="small text-muted">{u.email}</td>
                                            <td className="small text-muted" style={{ maxWidth: 250 }}>
                                                <span className="text-truncate d-block">
                                                    {u.descripcion || <em className="text-muted">—</em>}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    className="btn btn-sm btn-outline-primary me-2"
                                                    onClick={() => abrirEditar(u)}
                                                    title="Editar"
                                                >
                                                    <i className="bi bi-pencil"></i>
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => setConfirmDelete(u)}
                                                    title="Eliminar"
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {usuariosFiltrados.length > 0 && (
                        <div className="card-footer bg-white text-muted small py-2 px-3">
                            Mostrando {usuariosFiltrados.length} de {usuarios.length}
                        </div>
                    )}
                </div>
            )}

            {/* MODAL: Crear/Editar */}
            {mostrarModal && (
                <div className="modal d-block" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 500 }}>
                        <div className="modal-content">
                            <div className="modal-header border-0 pb-2">
                                <h5 className="modal-title">
                                    {modoModal === 'crear' ? 'Nuevo Usuario' : `Editar: ${usuarioEdicion.nombre}`}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setMostrarModal(false)}
                                ></button>
                            </div>

                            <div className="modal-body">
                                {/* Nombre */}
                                <div className="mb-3">
                                    <label className="form-label">Nombre *</label>
                                    <input
                                        type="text"
                                        className={`form-control ${erroresForm.nombre ? 'is-invalid' : ''}`}
                                        value={usuarioEdicion.nombre}
                                        onChange={(e) =>
                                            setUsuarioEdicion({ ...usuarioEdicion, nombre: e.target.value })
                                        }
                                    />
                                    {erroresForm.nombre && (
                                        <div className="invalid-feedback">{erroresForm.nombre}</div>
                                    )}
                                </div>

                                {/* Email */}
                                <div className="mb-3">
                                    <label className="form-label">Email *</label>
                                    <input
                                        type="email"
                                        className={`form-control ${erroresForm.email ? 'is-invalid' : ''}`}
                                        value={usuarioEdicion.email}
                                        onChange={(e) =>
                                            setUsuarioEdicion({ ...usuarioEdicion, email: e.target.value })
                                        }
                                    />
                                    {erroresForm.email && (
                                        <div className="invalid-feedback">{erroresForm.email}</div>
                                    )}
                                </div>

                                {/* Contraseña */}
                                <div className="mb-3">
                                    <label className="form-label">Contraseña *</label>
                                    <input
                                        type="password"
                                        className={`form-control ${erroresForm.password ? 'is-invalid' : ''}`}
                                        value={usuarioEdicion.password}
                                        onChange={(e) =>
                                            setUsuarioEdicion({ ...usuarioEdicion, password: e.target.value })
                                        }
                                        placeholder={modoModal === 'editar' ? '(Dejar en blanco para no cambiar)' : ''}
                                    />
                                    {erroresForm.password && (
                                        <div className="invalid-feedback">{erroresForm.password}</div>
                                    )}
                                </div>

                                {/* Descripción */}
                                <div className="mb-3">
                                    <label className="form-label">Descripción</label>
                                    <textarea
                                        className="form-control"
                                        rows={3}
                                        value={usuarioEdicion.descripcion || ''}
                                        onChange={(e) =>
                                            setUsuarioEdicion({ ...usuarioEdicion, descripcion: e.target.value })
                                        }
                                        placeholder="Información sobre este usuario (especialidad, rol, etc.)"
                                    ></textarea>
                                </div>
                            </div>

                            <div className="modal-footer border-0 pt-2">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setMostrarModal(false)}
                                >
                                    Cancelar
                                </button>
                                <button type="button" className="btn btn-primary" onClick={guardarUsuario}>
                                    {modoModal === 'crear' ? 'Crear' : 'Guardar'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* CONFIRMACIÓN: Borrar */}
            {confirmDelete && (
                <div className="modal d-block" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 400 }}>
                        <div className="modal-content border-danger">
                            <div className="modal-header border-0 bg-danger bg-opacity-10 pb-2">
                                <h5 className="modal-title text-danger">
                                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                    Eliminar usuario
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setConfirmDelete(null)}
                                ></button>
                            </div>

                            <div className="modal-body">
                                <p className="mb-0">
                                    ¿Eliminar a <strong>{confirmDelete.nombre}</strong>? Esta acción no se puede
                                    deshacer.
                                </p>
                            </div>

                            <div className="modal-footer border-0 pt-2">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setConfirmDelete(null)}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={() => confirmarBorrado(confirmDelete._id)}
                                >
                                    <i className="bi bi-trash me-1"></i>Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GestionTabla;