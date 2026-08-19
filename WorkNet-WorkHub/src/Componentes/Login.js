/**
 * COMPONENTE LOGIN
 * - Botón de volver a la página de inicio
 * - Sin enlace a registro cuando mostrarRegistro=false
 * - Prop `modo`: 'chat' (por defecto) | 'colaborar'
 *   · Cambia el subtítulo informativo bajo el título
 *   · En modo colaborar avisa que solo entran validados/admin
 */

import React, { useState } from 'react';

const Login = ({ onLoginSuccess, onCambiarVista, mostrarRegistro = true, modo = 'chat' }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setCargando(true);

        try {
            const response = await fetch('http://dam2.colexio-karbo.com:6101/api/usuarios/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Error del servidor: Respuesta inválida. Verifica que el servidor esté funcionando correctamente.');
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al iniciar sesión');
            }

            if (!data._id) {
                throw new Error('Error: El servidor no devolvió un ID válido');
            }

            // Guardar sesión con validado y admin explícitos
            const usuarioGuardar = {
                ...data,
                validado: data.validado ?? false,
                admin: data.admin ?? false,
            };
            localStorage.setItem('usuario', JSON.stringify(usuarioGuardar));

            onLoginSuccess(usuarioGuardar);

        } catch (err) {
            if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
                setError('No se pudo conectar con el servidor. Verifica tu conexión a internet y que el servidor esté funcionando.');
            } else if (err.name === 'SyntaxError' && err.message.includes('JSON')) {
                setError('Error del servidor: Respuesta inválida. El servidor puede no estar funcionando correctamente.');
            } else {
                setError(err.message);
            }
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="container">
            <div className="row justify-content-center align-items-center vh-100">
                <div className="col-md-6 col-lg-4">

                    {/* Botón volver */}
                    <button
                        className="btn btn-link text-muted p-0 mb-3 d-flex align-items-center gap-1"
                        onClick={() => onCambiarVista('inicio')}
                    >
                        <i className="bi bi-arrow-left"></i>
                        Volver al inicio
                    </button>

                    <div className="card shadow">
                        <div className="card-body p-4">
                            <h2 className="card-title text-center mb-2">Iniciar Sesión</h2>

                            {/* Aviso contextual según modo */}
                            {modo === 'colaborar' && (
                                <div className="alert alert-info py-2 px-3 mb-3 d-flex align-items-center gap-2" style={{ fontSize: '0.85rem' }}>
                                    <i className="bi bi-shield-lock-fill flex-shrink-0"></i>
                                    Acceso restringido a usuarios <strong>validados</strong> o <strong>administradores</strong>.
                                </div>
                            )}

                            {error && (
                                <div className="alert alert-danger" role="alert">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label">Email</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        disabled={cargando}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="password" className="form-label">Contraseña</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        disabled={cargando}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary w-100"
                                    disabled={cargando}
                                >
                                    {cargando ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Iniciando...
                                        </>
                                    ) : 'Iniciar Sesión'}
                                </button>
                            </form>

                            {/* Enlace a registro solo si está habilitado */}
                            {mostrarRegistro && (
                                <div className="text-center mt-3">
                                    <p className="mb-0">
                                        ¿No tienes cuenta?{' '}
                                        <button
                                            className="btn btn-link p-0"
                                            onClick={() => onCambiarVista('registro')}
                                        >
                                            Regístrate
                                        </button>
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;