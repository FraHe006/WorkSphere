/**
 * COMPONENTE CONFIGURACIÓN
 * 
 * Funcionalidad principal:
 * - Personalización de colores de la aplicación (primario, secundario, éxito, peligro)
 * - Temas preestablecidos con combinaciones de colores profesionales
 * - Selectores de color visuales y mediante código hexadecimal
 * - Vista previa en tiempo real de los colores seleccionados
 * - Persistencia de configuración en localStorage por usuario
 * - Aplicación dinámica de estilos mediante inyección de CSS
 * - Opción para restaurar colores por defecto
 */

import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const Configuracion = ({ usuario }) => {
    // Estado para el tema de colores
    const [tema, setTema] = useState({
        colorPrimario: '#0d6efd',
        colorSecundario: '#6c757d',
        colorExito: '#198754',
        colorPeligro: '#dc3545'
    });
    const [guardado, setGuardado] = useState(false);

    // Cargar configuración al montar el componente
    useEffect(() => {
        cargarConfiguracion();
    }, [usuario._id]);

    // Función para cargar la configuración guardada
    const cargarConfiguracion = () => {
        const configGuardada = localStorage.getItem(`config_${usuario._id}`);
        if (configGuardada) {
            try {
                const parsed = JSON.parse(configGuardada);
                setTema(parsed);
            } catch (err) {
                // Error silencioso - se mantiene configuración por defecto
            }
        }
    };

    // Manejador de cambio de color
    const handleColorChange = (campo, valor) => {
        setTema(prev => ({
            ...prev,
            [campo]: valor
        }));
        setGuardado(false);
    };

    // Función para guardar la configuración
    const guardarConfiguracion = () => {
        localStorage.setItem(`config_${usuario._id}`, JSON.stringify(tema));
        aplicarTemaGlobal(tema);
        setGuardado(true);
        
        // Ocultar mensaje de confirmación después de 3 segundos
        setTimeout(() => setGuardado(false), 3000);
    };

    // Función para aplicar el tema globalmente mediante inyección de CSS
    const aplicarTemaGlobal = (nuevoTema) => {
        // Eliminar estilo anterior si existe
        const estiloAnterior = document.getElementById('tema-personalizado');
        if (estiloAnterior) {
            estiloAnterior.remove();
        }

        // Crear nuevo estilo
        const style = document.createElement('style');
        style.id = 'tema-personalizado';
        style.innerHTML = `
            /* Botones Primarios */
            .btn-primary,
            .btn-primary:hover,
            .btn-primary:focus,
            .btn-primary:active {
                background-color: ${nuevoTema.colorPrimario} !important;
                border-color: ${nuevoTema.colorPrimario} !important;
            }
            
            /* Botones Outline Primary */
            .btn-outline-primary {
                color: ${nuevoTema.colorPrimario} !important;
                border-color: ${nuevoTema.colorPrimario} !important;
            }
            .btn-outline-primary:hover {
                background-color: ${nuevoTema.colorPrimario} !important;
                border-color: ${nuevoTema.colorPrimario} !important;
            }
            
            /* Backgrounds Primary */
            .bg-primary {
                background-color: ${nuevoTema.colorPrimario} !important;
            }
            
            /* Text Primary */
            .text-primary {
                color: ${nuevoTema.colorPrimario} !important;
            }
            
            /* Card Headers Primary */
            .card-header.bg-primary {
                background-color: ${nuevoTema.colorPrimario} !important;
            }
            
            /* Badges Primary */
            .badge.bg-primary,
            .badge.text-primary {
                background-color: ${nuevoTema.colorPrimario} !important;
            }
            
            /* Spinners Primary */
            .spinner-border.text-primary {
                color: ${nuevoTema.colorPrimario} !important;
            }
            
            /* Botones Success */
            .btn-success,
            .btn-success:hover,
            .btn-success:focus,
            .btn-success:active {
                background-color: ${nuevoTema.colorExito} !important;
                border-color: ${nuevoTema.colorExito} !important;
            }
            
            .bg-success {
                background-color: ${nuevoTema.colorExito} !important;
            }
            
            .text-success {
                color: ${nuevoTema.colorExito} !important;
            }
            
            /* Botones Danger */
            .btn-danger,
            .btn-danger:hover,
            .btn-danger:focus,
            .btn-danger:active {
                background-color: ${nuevoTema.colorPeligro} !important;
                border-color: ${nuevoTema.colorPeligro} !important;
            }
            
            .btn-outline-danger {
                color: ${nuevoTema.colorPeligro} !important;
                border-color: ${nuevoTema.colorPeligro} !important;
            }
            .btn-outline-danger:hover {
                background-color: ${nuevoTema.colorPeligro} !important;
                border-color: ${nuevoTema.colorPeligro} !important;
            }
            
            .bg-danger {
                background-color: ${nuevoTema.colorPeligro} !important;
            }
            
            .text-danger {
                color: ${nuevoTema.colorPeligro} !important;
            }
            
            /* Botones Secondary */
            .btn-secondary,
            .btn-secondary:hover,
            .btn-secondary:focus,
            .btn-secondary:active {
                background-color: ${nuevoTema.colorSecundario} !important;
                border-color: ${nuevoTema.colorSecundario} !important;
            }
            
            .bg-secondary {
                background-color: ${nuevoTema.colorSecundario} !important;
            }
            
            .text-secondary {
                color: ${nuevoTema.colorSecundario} !important;
            }
        `;

        document.head.appendChild(style);
    };

    // Función para restaurar los colores por defecto
    const restaurarDefecto = () => {
        const temaDefecto = {
            colorPrimario: '#0d6efd',
            colorSecundario: '#6c757d',
            colorExito: '#198754',
            colorPeligro: '#dc3545'
        };
        setTema(temaDefecto);
        localStorage.removeItem(`config_${usuario._id}`);

        // Remover estilos personalizados
        const estiloAnterior = document.getElementById('tema-personalizado');
        if (estiloAnterior) {
            estiloAnterior.remove();
        }

        setGuardado(true);
        setTimeout(() => setGuardado(false), 3000);
    };

    // Temas de colores preestablecidos
    const coloresPreestablecidos = [
        {
            nombre: 'Azul Noche',
            colorPrimario: '#1a365d',
            colorSecundario: '#4a5568',
            colorExito: '#2f855a',
            colorPeligro: '#e53e3e'
        },
        {
            nombre: 'Gris Urbano',
            colorPrimario: '#2d3748',
            colorSecundario: '#4a5568',
            colorExito: '#38a169',
            colorPeligro: '#dd6b20'
        },
        {
            nombre: 'Verde Bosque',
            colorPrimario: '#2c5530',
            colorSecundario: '#4b6b4e',
            colorExito: '#34a853',
            colorPeligro: '#c53030'
        },
        {
            nombre: 'Morado Profundo',
            colorPrimario: '#4c1d95',
            colorSecundario: '#6b46c1',
            colorExito: '#2f855a',
            colorPeligro: '#e53e3e'
        },
        {
            nombre: 'Carbón',
            colorPrimario: '#1a202c',
            colorSecundario: '#2d3748',
            colorExito: '#38a169',
            colorPeligro: '#f56565'
        }
    ];

    // Función para aplicar un tema preestablecido
    const aplicarPreestablecido = (preset) => {
        setTema(preset);
        setGuardado(false);
    };

    return (
        <div className="card shadow-sm">
            {/* Encabezado */}
            <div className="card-header bg-primary text-white">
                <h5 className="mb-0">
                    <i className="bi bi-palette me-2"></i>
                    Configuración de Colores
                </h5>
            </div>
            
            <div className="card-body">
                {/* Temas preestablecidos */}
                <div className="mb-4">
                    <h6 className="mb-3">
                        <i className="bi bi-stars me-2"></i>
                        Temas Preestablecidos
                    </h6>
                    <div className="d-flex flex-wrap gap-2">
                        {coloresPreestablecidos.map((preset, index) => (
                            <button
                                key={index}
                                className="btn btn-outline-secondary btn-sm"
                                onClick={() => aplicarPreestablecido(preset)}
                            >
                                <div
                                    className="d-inline-block rounded me-2"
                                    style={{
                                        width: '16px',
                                        height: '16px',
                                        backgroundColor: preset.colorPrimario,
                                        border: '1px solid #dee2e6'
                                    }}
                                ></div>
                                {preset.nombre}
                            </button>
                        ))}
                    </div>
                </div>

                <hr />

                {/* Selectores de color personalizados */}
                <div className="mb-4">
                    <h6 className="mb-3">
                        <i className="bi bi-brush me-2"></i>
                        Personalizar Colores
                    </h6>

                    <div className="row g-3">
                        {/* Color Primario */}
                        <div className="col-md-6">
                            <label className="form-label">
                                <i className="bi bi-circle-fill text-primary me-2"></i>
                                Color Primario
                            </label>
                            <div className="input-group">
                                <input
                                    type="color"
                                    className="form-control form-control-color"
                                    value={tema.colorPrimario}
                                    onChange={(e) => handleColorChange('colorPrimario', e.target.value)}
                                />
                                <input
                                    type="text"
                                    className="form-control"
                                    value={tema.colorPrimario}
                                    onChange={(e) => handleColorChange('colorPrimario', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Color Secundario */}
                        <div className="col-md-6">
                            <label className="form-label">
                                <i className="bi bi-circle-fill text-secondary me-2"></i>
                                Color Secundario
                            </label>
                            <div className="input-group">
                                <input
                                    type="color"
                                    className="form-control form-control-color"
                                    value={tema.colorSecundario}
                                    onChange={(e) => handleColorChange('colorSecundario', e.target.value)}
                                />
                                <input
                                    type="text"
                                    className="form-control"
                                    value={tema.colorSecundario}
                                    onChange={(e) => handleColorChange('colorSecundario', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Color Éxito */}
                        <div className="col-md-6">
                            <label className="form-label">
                                <i className="bi bi-circle-fill text-success me-2"></i>
                                Éxito
                            </label>
                            <div className="input-group">
                                <input
                                    type="color"
                                    className="form-control form-control-color"
                                    value={tema.colorExito}
                                    onChange={(e) => handleColorChange('colorExito', e.target.value)}
                                />
                                <input
                                    type="text"
                                    className="form-control"
                                    value={tema.colorExito}
                                    onChange={(e) => handleColorChange('colorExito', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Color Advertencia */}
                        <div className="col-md-6">
                            <label className="form-label">
                                <i className="bi bi-circle-fill text-danger me-2"></i>
                                Advertencia
                            </label>
                            <div className="input-group">
                                <input
                                    type="color"
                                    className="form-control form-control-color"
                                    value={tema.colorPeligro}
                                    onChange={(e) => handleColorChange('colorPeligro', e.target.value)}
                                />
                                <input
                                    type="text"
                                    className="form-control"
                                    value={tema.colorPeligro}
                                    onChange={(e) => handleColorChange('colorPeligro', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Vista previa */}
                <div className="mb-4">
                    <h6 className="mb-3">
                        <i className="bi bi-eye me-2"></i>
                        Vista Previa
                    </h6>
                    <div className="d-flex gap-2 flex-wrap">
                        <button className="btn btn-primary" style={{ backgroundColor: tema.colorPrimario, borderColor: tema.colorPrimario }}>
                            Primario
                        </button>
                        <button className="btn btn-secondary" style={{ backgroundColor: tema.colorSecundario, borderColor: tema.colorSecundario }}>
                            Secundario
                        </button>
                        <button className="btn btn-success" style={{ backgroundColor: tema.colorExito, borderColor: tema.colorExito }}>
                            Éxito
                        </button>
                        <button className="btn btn-danger" style={{ backgroundColor: tema.colorPeligro, borderColor: tema.colorPeligro }}>
                            Peligro
                        </button>
                    </div>
                </div>

                {/* Botones de acción */}
                <div className="d-flex gap-2">
                    <button
                        className="btn btn-primary"
                        onClick={guardarConfiguracion}
                    >
                        <i className="bi bi-save me-2"></i>
                        Guardar Configuración
                    </button>
                    <button
                        className="btn btn-outline-secondary"
                        onClick={restaurarDefecto}
                    >
                        <i className="bi bi-arrow-counterclockwise me-2"></i>
                        Restaurar Defecto
                    </button>
                </div>

                {/* Mensaje de confirmación */}
                {guardado && (
                    <div className="alert alert-success mt-3 mb-0" role="alert">
                        <i className="bi bi-check-circle me-2"></i>
                        Configuración guardada correctamente
                    </div>
                )}
            </div>
        </div>
    );
};

export default Configuracion;
