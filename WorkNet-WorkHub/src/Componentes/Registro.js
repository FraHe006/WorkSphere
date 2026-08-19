import React, { useState } from 'react';

const Registro = ({ onRegistroSuccess, onCambiarVista }) => {
    // Estados del formulario
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmarPassword, setConfirmarPassword] = useState('');
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);

    // Estados del modal de verificación
    const [mostrarModal, setMostrarModal] = useState(false);
    const [codigoGenerado, setCodigoGenerado] = useState('');
    const [codigoIntroducido, setCodigoIntroducido] = useState('');
    const [cargandoVerificacion, setCargandoVerificacion] = useState(false);

    const API_URL = 'http://dam2.colexio-karbo.com:6101/api';

    const generarCodigo = () => {
        return Math.floor(100000 + Math.random() * 900000).toString();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validaciones
        if (password !== confirmarPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }
        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        setCargando(true);
        try {
            const checkResponse = await fetch(`${API_URL}/usuarios/existe-email/${encodeURIComponent(email)}`);
            const checkData = await checkResponse.json();

            if (checkData.existe) {
                setError('Ya existe una cuenta con este correo electrónico');
                setCargando(false);
                return;
            }

            const codigo = generarCodigo();
            setCodigoGenerado(codigo);

            const emailResponse = await fetch(`${API_URL}/email/enviar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    destinatario: email,
                    asunto: 'Código de verificación - Registro',
                    cuerpo: `Hola ${nombre},\n\nTu código de verificación es: ${codigo}\n\nIntroduce este código en la ventana de registro para completar tu cuenta.\n\nSi no has solicitado este registro, ignora este correo.`
                })
            });

            const emailData = await emailResponse.json();

            if (!emailData.success) {
                throw new Error(emailData.error || 'No se pudo enviar el correo de verificación');
            }

            setMostrarModal(true);
            setCargando(false);

        } catch (err) {
            console.error('Error en handleSubmit:', err);
            setError(err.message || 'Ocurrió un error al enviar el código.');
            setCargando(false);
        }
    };

    // Verificar el código introducido
    const handleVerificarCodigo = async (e) => {
        e.preventDefault();
        setError('');

        if (codigoIntroducido !== codigoGenerado) {
            setError('Código incorrecto. Inténtalo de nuevo.');
            setCodigoIntroducido('');
            return;
        }

        setCargandoVerificacion(true);
        try {
            const response = await fetch(`${API_URL}/usuarios`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, email, password })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Error al crear usuario');

            if (data.usuarioId) {
                const userResponse = await fetch(`${API_URL}/usuarios/${data.usuarioId}`);
                const userData = await userResponse.json();

                if (!userData._id) {
                    throw new Error('Error: El usuario no tiene un ID válido');
                }

                onRegistroSuccess(userData);
            } else {
                throw new Error('Error: No se recibió el ID del usuario');
            }

        } catch (err) {
            console.error('Error al crear usuario:', err);
            setError(err.message);
        } finally {
            setCargandoVerificacion(false);
        }
    };

    // Reenviar código
    const handleReenviarCodigo = async () => {
        setError('');
        setCargando(true);
        try {
            const nuevoCodigo = generarCodigo();
            setCodigoGenerado(nuevoCodigo);
            setCodigoIntroducido('');

            await fetch(`${API_URL}/email/enviar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    destinatario: email,
                    asunto: 'Nuevo código de verificación',
                    cuerpo: `Hola ${nombre},\n\nTu nuevo código de verificación es: ${nuevoCodigo}\n\nEl código anterior ya no es válido.`
                })
            });

            setError('Se ha enviado un nuevo código a tu correo.');
        } catch (err) {
            console.error('Error al reenviar:', err);
            setError('Error al reenviar el código');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="container">
            <div className="row justify-content-center align-items-center vh-100">
                <div className="col-md-6 col-lg-4">
                    <div className="card shadow">
                        <div className="card-body p-4">
                            <h2 className="card-title text-center mb-4">
                                {mostrarModal ? 'Verificación' : 'Registro'}
                            </h2>

                            {error && (
                                <div className="alert alert-danger" role="alert">
                                    {error}
                                </div>
                            )}

                            {/* FORMULARIO PRINCIPAL */}
                            {!mostrarModal && (
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label htmlFor="nombre" className="form-label">Nombre</label>
                                        <input type="text" className="form-control" id="nombre"
                                            value={nombre} onChange={(e) => setNombre(e.target.value)}
                                            required disabled={cargando} />
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="email" className="form-label">Email</label>
                                        <input type="email" className="form-control" id="email"
                                            value={email} onChange={(e) => setEmail(e.target.value)}
                                            required disabled={cargando} />
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="password" className="form-label">Contraseña</label>
                                        <input type="password" className="form-control" id="password"
                                            value={password} onChange={(e) => setPassword(e.target.value)}
                                            required minLength="6" disabled={cargando} />
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="confirmarPassword" className="form-label">Confirmar Contraseña</label>
                                        <input type="password" className="form-control" id="confirmarPassword"
                                            value={confirmarPassword} onChange={(e) => setConfirmarPassword(e.target.value)}
                                            required minLength="6" disabled={cargando} />
                                    </div>

                                    <button type="submit" className="btn btn-primary w-100" disabled={cargando}>
                                        {cargando ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Enviando código...
                                            </>
                                        ) : 'Registrarse'}
                                    </button>
                                </form>
                            )}

                            {/* MODAL DE VERIFICACIÓN */}
                            {mostrarModal && (
                                <div>
                                    <div className="alert alert-info text-center">
                                        📧 Hemos enviado un código de 6 dígitos a<br />
                                        <strong>{email}</strong>
                                    </div>

                                    <form onSubmit={handleVerificarCodigo}>
                                        <div className="mb-3">
                                            <label htmlFor="codigo" className="form-label">Código de verificación</label>
                                            <input
                                                type="text"
                                                className="form-control text-center"
                                                id="codigo"
                                                value={codigoIntroducido}
                                                onChange={(e) => setCodigoIntroducido(e.target.value)}
                                                maxLength="6"
                                                placeholder="000000"
                                                required
                                                disabled={cargandoVerificacion}
                                                style={{ fontSize: '1.5rem', letterSpacing: '0.5rem' }}
                                            />
                                        </div>

                                        <button type="submit" className="btn btn-success w-100 mb-2" disabled={cargandoVerificacion}>
                                            {cargandoVerificacion ? 'Verificando...' : 'Verificar y crear cuenta'}
                                        </button>

                                        <button type="button" className="btn btn-outline-secondary w-100 mb-2"
                                            onClick={handleReenviarCodigo} disabled={cargando}>
                                            🔄 Reenviar código
                                        </button>

                                        <button type="button" className="btn btn-link w-100"
                                            onClick={() => {
                                                setMostrarModal(false);
                                                setCodigoGenerado('');
                                                setCodigoIntroducido('');
                                                setError('');
                                            }}
                                            disabled={cargandoVerificacion}>
                                            Cancelar
                                        </button>
                                    </form>
                                </div>
                            )}

                            {!mostrarModal && (
                                <div className="text-center mt-3">
                                    <p className="mb-0">
                                        ¿Ya tienes cuenta?{' '}
                                        <button className="btn btn-link p-0" onClick={() => onCambiarVista('login')}>
                                            Inicia sesión
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

export default Registro;