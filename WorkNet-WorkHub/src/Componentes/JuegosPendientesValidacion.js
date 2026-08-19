/**
 * COMPONENTE JUEGOS PENDIENTES DE VALIDACIÓN - MEJORADO
 *
 * Muestra todos los juegos (pendientes validados y rechazados) en tarjetas.
 * Los usuarios validados pueden aprobar o rechazar juegos pendientes.
 */

import React, { useState, useEffect } from 'react';

const API = 'http://dam2.colexio-karbo.com:6101/api';

const JuegosPendientesValidacion = ({ usuario }) => {
    const [juegos, setJuegos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const [filtro, setFiltro] = useState('todos'); // 'todos', 'pendientes', 'validados'

    // Detalle de juego
    const [juegoDetalle, setJuegoDetalle] = useState(null);
    const [mostrarDetalle, setMostrarDetalle] = useState(false);
    const [cargandoDetalle, setCargandoDetalle] = useState(false);

    // Validación
    const [validando, setValidando] = useState(false);

    // Cargar juegos al montar el componente
    useEffect(() => {
        cargarTodosLosJuegos();
    }, [filtro]);

    // Cargar TODOS los juegos (pendientes y validados)
    const cargarTodosLosJuegos = async () => {
        setCargando(true);
        setError('');
        try {
            // Cargar pendientes (validado = 0)
            const resPendientes = await fetch(`${API}/juegos?validado=0`);
            if (!resPendientes.ok) throw new Error('Error al cargar juegos pendientes');
            const dataPendientes = await resPendientes.json();

            // Cargar validados (validado = 1)
            const resValidados = await fetch(`${API}/juegos?validado=1`);
            if (!resValidados.ok) throw new Error('Error al cargar juegos validados');
            const dataValidados = await resValidados.json();

            // Cargar rechazados (validado = 2)
            const resRechazados = await fetch(`${API}/juegos?validado=2`);
            if (!resRechazados.ok) throw new Error('Error al cargar juegos rechazados');
            const dataRechazados = await resRechazados.json();

            // Combinar las tres listas
            const todosLosJuegos = [...dataPendientes, ...dataValidados, ...dataRechazados];
            setJuegos(todosLosJuegos);
        } catch (err) {
            setError(err.message);
            console.error('Error cargando juegos:', err);
        } finally {
            setCargando(false);
        }
    };

    // Obtener detalle completo del juego
    const abrirDetalle = async (codigo) => {
        setCargandoDetalle(true);
        setError('');
        try {
            const res = await fetch(`${API}/juegos/${codigo}`);
            if (!res.ok) throw new Error('Error al cargar juego');
            const data = await res.json();
            setJuegoDetalle(data);
            setMostrarDetalle(true);
        } catch (err) {
            setError(err.message);
            console.error('Error cargando detalle:', err);
        } finally {
            setCargandoDetalle(false);
        }
    };

    // Cerrar modal de detalle
    const cerrarDetalle = () => {
        setMostrarDetalle(false);
        setJuegoDetalle(null);
    };

    // Validar juego directamente (aprobar o rechazar) sin pedir nada
    const validarJuego = async (aprobar) => {
        setValidando(true);
        setError('');

        try {
            const res = await fetch(
                `${API}/juegos/${juegoDetalle.codigo}/validacion`,
                {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        // 1 = aprobado, 2 = rechazado
                        validado: aprobar ? 1 : 2,
                        cambiado_por: usuario.email,
                    }),
                }
            );

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Error al validar juego');
            }

            cerrarDetalle();
            // Recargar la lista
            cargarTodosLosJuegos();
        } catch (err) {
            setError(err.message);
            console.error('Error en validación:', err);
        } finally {
            setValidando(false);
        }
    };

    // Normalizar nombre de tipo para comparaciones
    const normalizarTipo = (tipo) => {
        if (!tipo) return '';
        return tipo.toLowerCase().replace(/\s+/g, '_');
    };

    // Filtrar juegos según selección
    const juegosFiltrados = juegos.filter(j => {
        const estado = Number(j.validado);
        if (filtro === 'pendientes') return estado === 0;
        if (filtro === 'validados') return estado === 1;
        if (filtro === 'rechazados') return estado === 2;
        return true;
    });

    // Renderizar contenido del juego según tipo
    const renderContenidoJuego = (juego) => {
        if (!juego) return null;

        const tipoNormalizado = normalizarTipo(juego.tipo);

        // Verdadero y Falso
        if (tipoNormalizado.includes('verdadero')) {
            return (
                <div className="mt-3">
                    <h6 className="mb-3 text-muted">
                        <i className="bi bi-question-circle me-2"></i>Preguntas
                    </h6>
                    {juego.preguntas && juego.preguntas.length > 0 ? (
                        juego.preguntas.map((p, i) => (
                            <div key={i} className="mb-3 pb-3 border-bottom">
                                <p className="mb-2">
                                    <strong className="text-dark">{i + 1}. {p.enunciado}</strong>
                                </p>
                                <p className="mb-2 text-success-emphasis">
                                    <i className="bi bi-check-circle me-1"></i>
                                    <strong>Respuesta: {p.respuesta ? 'Verdadero' : 'Falso'}</strong>
                                </p>
                                {p.explicacion && (
                                    <p className="text-muted small mb-0">
                                        <i className="bi bi-lightbulb me-1"></i>
                                        {p.explicacion}
                                    </p>
                                )}
                            </div>
                        ))
                    ) : (
                        <p className="text-muted">No hay preguntas</p>
                    )}
                </div>
            );
        }

        // Unir Conceptos
        if (tipoNormalizado.includes('unir')) {
            return (
                <div className="mt-3">
                    <h6 className="mb-3 text-muted">
                        <i className="bi bi-diagram-3 me-2"></i>Parejas de Conceptos
                    </h6>
                    {juego.parejas && juego.parejas.length > 0 ? (
                        juego.parejas.map((p, i) => (
                            <div key={i} className="mb-3 pb-3 border-bottom">
                                <p className="mb-2">
                                    <strong className="text-primary-emphasis">{i + 1}. {p.termino}</strong>
                                </p>
                                <p className="mb-2">
                                    <i className="bi bi-arrow-right-short text-success-emphasis me-2"></i>
                                    <span className="text-dark">{p.definicion}</span>
                                </p>
                                {p.explicacion && (
                                    <p className="text-muted small mb-0">
                                        <i className="bi bi-lightbulb me-1"></i>
                                        {p.explicacion}
                                    </p>
                                )}
                            </div>
                        ))
                    ) : (
                        <p className="text-muted">No hay parejas</p>
                    )}
                </div>
            );
        }

        // Rellenar Frases
        if (tipoNormalizado.includes('rellenar')) {
            return (
                <div className="mt-3">
                    <h6 className="mb-3 text-muted">
                        <i className="bi bi-chat-left-text me-2"></i>Frases para Rellenar
                    </h6>
                    {juego.preguntas && juego.preguntas.length > 0 ? (
                        juego.preguntas.map((p, i) => (
                            <div key={i} className="mb-3 pb-3 border-bottom">
                                <p className="mb-2">
                                    <strong className="text-dark">{i + 1}. {p.frase}</strong>
                                </p>
                                <p className="mb-2 text-success-emphasis">
                                    <i className="bi bi-check-circle me-1"></i>
                                    <strong>Respuesta: {p.respuesta}</strong>
                                </p>
                                {p.explicacion && (
                                    <p className="text-muted small mb-0">
                                        <i className="bi bi-lightbulb me-1"></i>
                                        {p.explicacion}
                                    </p>
                                )}
                            </div>
                        ))
                    ) : (
                        <p className="text-muted">No hay frases</p>
                    )}
                </div>
            );
        }

        // Conversación
        if (tipoNormalizado.includes('conversacion') || tipoNormalizado.includes('conv')) {
            return (
                <div className="mt-3">
                    <h6 className="mb-3 text-muted">
                        <i className="bi bi-chat-dots me-2"></i>Diálogos
                    </h6>
                    {juego.dialogos && juego.dialogos.length > 0 ? (
                        <div>
                            {juego.dialogos.map((d, i) => (
                                <div key={i} className="mb-4 p-3 bg-light rounded">
                                    <p className="mb-3">
                                        <strong className="text-dark">Pregunta {i + 1}:</strong>
                                    </p>
                                    <p className="mb-3 text-dark ps-2 border-start border-3 border-info-subtle">
                                        {d.prompt}
                                    </p>
                                    <p className="mb-2 text-muted small">
                                        <strong>Opciones:</strong>
                                    </p>
                                    {d.opciones && d.opciones.length > 0 ? (
                                        <div className="ps-2">
                                            {d.opciones.map((o, j) => (
                                                <div key={j} className="mb-2">
                                                    <span className="badge bg-secondary me-2">{o.letra}</span>
                                                    <span className="text-dark">{o.texto}</span>
                                                    {o.explicacion && (
                                                        <div className="text-muted small ms-4 mt-1">
                                                            💡 {o.explicacion}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-muted">No hay opciones</p>
                                    )}
                                </div>
                            ))}
                            {juego.despedida && (
                                <div className="p-3 bg-info bg-opacity-10 rounded mt-3">
                                    <p className="mb-0">
                                        <strong>Despedida:</strong> {juego.despedida}
                                    </p>
                                </div>
                            )}
                            {juego.puntuadores && juego.puntuadores.length > 0 && (
                                <div className="mt-3">
                                    <p className="text-muted small">
                                        <strong>Puntuadores:</strong> {juego.puntuadores.map(p => p.nombre).join(', ')}
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-muted">No hay diálogos</p>
                    )}
                </div>
            );
        }

        return <p className="text-muted">Tipo de juego no soportado</p>;
    };

    // Renderizar tarjetas de juegos en la lista
    const renderTarjetaJuego = (juego) => {
        const tipoIcon = {
            'verdadero': '✓✗',
            'unir': '🔗',
            'rellenar': '✏️',
            'conversacion': '💬',
        };

        let icon = '📋';
        const tipoNorm = normalizarTipo(juego.tipo);
        if (tipoNorm.includes('verdadero')) icon = tipoIcon['verdadero'];
        else if (tipoNorm.includes('unir')) icon = tipoIcon['unir'];
        else if (tipoNorm.includes('rellenar')) icon = tipoIcon['rellenar'];
        else if (tipoNorm.includes('conversacion') || tipoNorm.includes('conv')) icon = tipoIcon['conversacion'];

        return (
            <div key={juego.codigo} className="card mb-3 shadow-sm">
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                        <div className="flex-grow-1">
                            <h5 className="card-title mb-1">
                                <span className="me-2">{icon}</span>
                                {juego.titulo}
                            </h5>
                            <p className="card-subtitle text-muted small">
                                {juego.codigo} • {juego.tipo}
                            </p>
                        </div>
                        <span className={`badge ${Number(juego.validado) === 1
                            ? 'bg-success-subtle text-success-emphasis border border-success-subtle'
                            : Number(juego.validado) === 2
                                ? 'bg-danger-subtle text-danger-emphasis border border-danger-subtle'
                                : 'bg-warning-subtle text-warning-emphasis border border-warning-subtle'}`}>
                            {Number(juego.validado) === 1 ? '✓ Validado' : Number(juego.validado) === 2 ? '✗ Rechazado' : '⏳ Pendiente'}
                        </span>
                    </div>

                    <div className="mb-3 small">
                        <p className="mb-1">
                            <i className="bi bi-person me-2"></i>
                            <strong>Autor:</strong> {juego.correo_autor}
                        </p>
                    </div>

                    <button
                        className="btn btn-sm btn-primary"
                        onClick={() => abrirDetalle(juego.codigo)}
                    >
                        <i className="bi bi-eye me-1"></i>Ver detalle
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="container-fluid py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>
                    <i className="bi bi-controller me-2"></i>Gestión de actividades
                </h2>
            </div>

            {error && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    <i className="bi bi-exclamation-circle me-2"></i>
                    {error}
                    <button type="button" className="btn-close" onClick={() => setError('')}></button>
                </div>
            )}

            {/* Filtros */}
            <div className="mb-4">
                <div className="btn-group" role="group">
                    <input
                        type="radio"
                        className="btn-check"
                        name="filtro"
                        id="filtro-todos"
                        value="todos"
                        checked={filtro === 'todos'}
                        onChange={(e) => setFiltro(e.target.value)}
                    />
                    <label className="btn btn-outline-primary" htmlFor="filtro-todos">
                        <i className="bi bi-collection me-1"></i>Todos ({juegos.length})
                    </label>

                    <input
                        type="radio"
                        className="btn-check"
                        name="filtro"
                        id="filtro-pendientes"
                        value="pendientes"
                        checked={filtro === 'pendientes'}
                        onChange={(e) => setFiltro(e.target.value)}
                    />
                    <label className="btn btn-outline-secondary" htmlFor="filtro-pendientes">
                        <i className="bi bi-hourglass-split me-1"></i>
                        Pendientes ({juegos.filter(j => Number(j.validado) === 0).length})
                    </label>

                    <input
                        type="radio"
                        className="btn-check"
                        name="filtro"
                        id="filtro-validados"
                        value="validados"
                        checked={filtro === 'validados'}
                        onChange={(e) => setFiltro(e.target.value)}
                    />
                    <label className="btn btn-outline-secondary" htmlFor="filtro-validados">
                        <i className="bi bi-check-circle me-1"></i>
                        Validados ({juegos.filter(j => Number(j.validado) === 1).length})
                    </label>

                    <input
                        type="radio"
                        className="btn-check"
                        name="filtro"
                        id="filtro-rechazados"
                        value="rechazados"
                        checked={filtro === 'rechazados'}
                        onChange={(e) => setFiltro(e.target.value)}
                    />
                    <label className="btn btn-outline-danger" htmlFor="filtro-rechazados">
                        <i className="bi bi-x-circle me-1"></i>
                        Rechazados ({juegos.filter(j => Number(j.validado) === 2).length})
                    </label>
                </div>
            </div>

            {/* Lista de juegos */}
            {cargando ? (
                <div className="text-center py-5">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Cargando…</span>
                    </div>
                    <p className="mt-3 text-muted">Cargando juegos…</p>
                </div>
            ) : juegosFiltrados.length > 0 ? (
                <div className="row">
                    <div className="col-12">
                        {juegosFiltrados.map(juego => renderTarjetaJuego(juego))}
                    </div>
                </div>
            ) : (
                <div className="alert alert-info">
                    <i className="bi bi-info-circle me-2"></i>
                    No hay juegos {filtro === 'todos' ? '' : `${filtro} `}para mostrar.
                </div>
            )}

            {/* MODAL: Detalle del juego */}
            {mostrarDetalle && juegoDetalle && (
                <div className="modal d-block" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-scrollable">
                        <div className="modal-content">
                            <div className="modal-header border-0 pb-2">
                                <div>
                                    <h5 className="modal-title">{juegoDetalle.titulo}</h5>
                                    <small className="text-muted">{juegoDetalle.codigo}</small>
                                </div>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={cerrarDetalle}
                                ></button>
                            </div>

                            <div className="modal-body">
                                <div className="mb-3">
                                    <p className="mb-2">
                                        <strong>Tipo:</strong> {juegoDetalle.tipo}
                                    </p>
                                    <p className="mb-2">
                                        <strong>Autor:</strong> {juegoDetalle.correo_autor}
                                    </p>
                                    <p className="mb-2">
                                        <strong>Categoría:</strong> {juegoDetalle.categoria || 'Sin asignar'}
                                    </p>
                                    <p className="mb-2">
                                        <strong>Estado:</strong>
                                        <span className={`ms-2 badge ${Number(juegoDetalle.validado) === 1
                                            ? 'bg-success-subtle text-success-emphasis border border-success-subtle'
                                            : Number(juegoDetalle.validado) === 2
                                                ? 'bg-danger-subtle text-danger-emphasis border border-danger-subtle'
                                                : 'bg-warning-subtle text-warning-emphasis border border-warning-subtle'}`}>
                                            {Number(juegoDetalle.validado) === 1 ? 'Validado' : Number(juegoDetalle.validado) === 2 ? 'Rechazado' : 'Pendiente'}
                                        </span>
                                    </p>
                                </div>

                                <hr />

                                {cargandoDetalle ? (
                                    <div className="text-center py-4">
                                        <div className="spinner-border" role="status"></div>
                                    </div>
                                ) : (
                                    renderContenidoJuego(juegoDetalle)
                                )}
                            </div>

                            <div className="modal-footer border-0 pt-2">
                                {Number(juegoDetalle.validado) !== 1 && (
                                    <>
                                        <button
                                            type="button"
                                            className="btn btn-success"
                                            onClick={() => validarJuego(true)}
                                            disabled={validando}
                                        >
                                            {validando ? (
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            ) : (
                                                <i className="bi bi-check-circle me-1"></i>
                                            )}
                                            Aprobar
                                        </button>
                                        {Number(juegoDetalle.validado) === 0 && (
                                            <button
                                                type="button"
                                                className="btn btn-danger"
                                                onClick={() => validarJuego(false)}
                                                disabled={validando}
                                            >
                                                {validando ? (
                                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                ) : (
                                                    <i className="bi bi-x-circle me-1"></i>
                                                )}
                                                Rechazar
                                            </button>
                                        )}
                                    </>
                                )}
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={cerrarDetalle}
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

export default JuegosPendientesValidacion;