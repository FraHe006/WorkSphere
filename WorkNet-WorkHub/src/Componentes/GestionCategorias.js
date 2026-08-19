/**
 * COMPONENTE GESTIÓN DE CATEGORÍAS
 *
 * Gestiona la creación, edición y eliminación de categorías.
 * Elimina en cascada todos los juegos relacionados.
 * Solo visible para administradores.
 */

import React, { useState, useEffect } from 'react';

const API = 'http://dam2.colexio-karbo.com:6101/api/juegos';

const GestionCategorias = ({ usuario }) => {
    const [categorias, setCategorias] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const [busqueda, setBusqueda] = useState('');

    // Modal
    const [mostrarModal, setMostrarModal] = useState(false);
    const [modoModal, setModoModal] = useState('crear');
    const [categoriaEdicion, setCategoriaEdicion] = useState(null);
    const [erroresForm, setErroresForm] = useState({});

    // Confirmación borrado
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [juegosCascada, setJuegosCascada] = useState(0);

    // Cargar categorías
    useEffect(() => {
        cargarCategorias();
    }, []);

    const cargarCategorias = async () => {
        setCargando(true);
        setError('');
        try {
            const res = await fetch(`${API}/categorias`);
            if (!res.ok) throw new Error('Error al cargar categorías');
            const data = await res.json();
            setCategorias(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    };

    // Abrir modal crear
    const abrirCrear = () => {
        setModoModal('crear');
        setCategoriaEdicion({ categoria: '' });
        setErroresForm({});
        setMostrarModal(true);
    };

    // Abrir modal editar
    const abrirEditar = (cat) => {
        setModoModal('editar');
        setCategoriaEdicion({ ...cat });
        setErroresForm({});
        setMostrarModal(true);
    };

    // Validar formulario
    const validarForm = () => {
        const err = {};
        if (!categoriaEdicion.categoria?.trim()) err.categoria = 'Requerido';
        setErroresForm(err);
        return Object.keys(err).length === 0;
    };

    // Guardar categoría
    const guardarCategoria = async () => {
        if (!validarForm()) return;

        const metodo = modoModal === 'crear' ? 'POST' : 'PUT';
        const url = modoModal === 'crear'
            ? `${API}/categorias`
            : `${API}/categorias/${categoriaEdicion.id}`;

        try {
            const res = await fetch(url, {
                method: metodo,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    categoria: categoriaEdicion.categoria.trim(),
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Error al guardar');
            }

            setMostrarModal(false);
            cargarCategorias();
        } catch (err) {
            setError(err.message);
        }
    };

    // Preparar eliminación
    const prepararEliminar = async (cat) => {
        try {
            const res = await fetch(`${API}/categorias/${cat.id}/juegos-count`);
            if (!res.ok) throw new Error('Error al contar juegos');
            const data = await res.json();
            setJuegosCascada(data.count);
            setConfirmDelete(cat);
        } catch (err) {
            setError(err.message);
        }
    };

    // Confirmar borrado
    const confirmarBorrado = async () => {
        try {
            const res = await fetch(`${API}/categorias/${confirmDelete.id}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Error al eliminar');
            }

            setConfirmDelete(null);
            setJuegosCascada(0);
            cargarCategorias();
        } catch (err) {
            setError(err.message);
        }
    };

    // Filtro
    const categoriasFiltradas = categorias.filter(c =>
        c.categoria?.toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
        <div>
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="mb-0 fw-semibold">
                    <i className="bi bi-tag-fill me-2 text-info-emphasis"></i>
                    Categorías
                    <span className="badge bg-info-subtle text-info-emphasis border border-info-subtle ms-2" style={{ fontSize: '0.75rem' }}>
                        {categorias.length}
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
                        <i className="bi bi-plus-lg me-1"></i>Nueva
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

            {/* Tarjetas de categorías */}
            {cargando ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-info-emphasis" role="status"></div>
                    <p className="text-muted mt-2">Cargando categorías…</p>
                </div>
            ) : categoriasFiltradas.length === 0 ? (
                <div className="text-center py-5">
                    <i className="bi bi-inbox text-muted" style={{ fontSize: '3rem' }}></i>
                    <p className="text-muted mt-2">No hay categorías</p>
                </div>
            ) : (
                <div className="row g-3">
                    {categoriasFiltradas.map(cat => (
                        <div key={cat.id} className="col-12 col-md-6 col-lg-4">
                            <div className="card h-100 border-0 shadow-sm hover-shadow" style={{ transition: 'all 0.2s' }}>
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div className="flex-grow-1">
                                            <h6 className="card-title mb-2">
                                                <i className="bi bi-tag me-2 text-info-emphasis"></i>
                                                {cat.categoria}
                                            </h6>
                                            <p className="text-muted small mb-0">
                                                ID: {cat.id}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="card-footer bg-white border-top d-flex gap-2 justify-content-end">
                                    <button
                                        className="btn btn-sm btn-outline-secondary"
                                        onClick={() => abrirEditar(cat)}
                                        title="Editar"
                                    >
                                        <i className="bi bi-pencil"></i>
                                    </button>
                                    <button
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() => prepararEliminar(cat)}
                                        title="Eliminar"
                                    >
                                        <i className="bi bi-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* MODAL: Crear/Editar */}
            {mostrarModal && (
                <div className="modal d-block" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 400 }}>
                        <div className="modal-content">
                            <div className="modal-header border-0 pb-2">
                                <h5 className="modal-title">
                                    {modoModal === 'crear' ? 'Nueva Categoría' : 'Editar Categoría'}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setMostrarModal(false)}
                                ></button>
                            </div>

                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label">Nombre de Categoría *</label>
                                    <input
                                        type="text"
                                        className={`form-control ${erroresForm.categoria ? 'is-invalid' : ''}`}
                                        value={categoriaEdicion?.categoria || ''}
                                        onChange={(e) =>
                                            setCategoriaEdicion({
                                                ...categoriaEdicion,
                                                categoria: e.target.value
                                            })
                                        }
                                        placeholder="Ej: Derechos Laborales"
                                        autoFocus
                                    />
                                    {erroresForm.categoria && (
                                        <div className="invalid-feedback">{erroresForm.categoria}</div>
                                    )}
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
                                <button type="button" className="btn btn-primary" onClick={guardarCategoria}>
                                    {modoModal === 'crear' ? 'Crear' : 'Guardar'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* CONFIRMACIÓN: Borrar con cascada */}
            {confirmDelete && (
                <div className="modal d-block" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 450 }}>
                        <div className="modal-content border-danger-subtle">
                            <div className="modal-header border-0 bg-danger bg-opacity-10 pb-2">
                                <h5 className="modal-title text-danger-emphasis">
                                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                    Eliminar Categoría
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setConfirmDelete(null)}
                                ></button>
                            </div>

                            <div className="modal-body">
                                <p className="mb-3">
                                    ¿Eliminar la categoría <strong>{confirmDelete.categoria}</strong>?
                                </p>

                                {juegosCascada > 0 && (
                                    <div className="alert alert-warning mb-3">
                                        <i className="bi bi-exclamation-circle me-2"></i>
                                        <strong>Atención:</strong> Se eliminarán en cascada
                                        <strong> {juegosCascada} juego{juegosCascada !== 1 ? 's' : ''}</strong>
                                        {' '}relacionado{juegosCascada !== 1 ? 's' : ''}.
                                    </div>
                                )}

                                <p className="text-muted small mb-0">
                                    Esta acción no se puede deshacer.
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
                                    onClick={confirmarBorrado}
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

export default GestionCategorias;