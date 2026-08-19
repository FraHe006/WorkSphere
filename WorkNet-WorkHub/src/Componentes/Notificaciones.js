import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const Notificaciones = ({ notificaciones, onCerrar }) => {
    if (!notificaciones || notificaciones.length === 0) {
        return null;
    }

    return (
        <div style={{
            position: 'fixed',
            top: '80px',
            right: '20px',
            zIndex: 9999,
            maxWidth: '350px',
            width: '100%'
        }}>
            {notificaciones.map((notif) => (
                <div
                    key={notif.id}
                    className="alert alert-primary alert-dismissible fade show shadow-lg mb-2"
                    role="alert"
                    style={{ animation: 'slideInRight 0.3s ease-out' }}
                >
                    <div className="d-flex align-items-start">
                        {notif.imagen ? (
                            <img
                                src={notif.imagen}
                                alt={notif.nombre}
                                className="rounded-circle me-2"
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    objectFit: 'cover',
                                    border: '2px solid #0d6efd'
                                }}
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextElementSibling.style.display = 'flex';
                                }}
                            />
                        ) : null}

                        <div
                            className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2 flex-shrink-0"
                            style={{
                                width: '40px',
                                height: '40px',
                                fontSize: '1.2rem',
                                display: notif.imagen ? 'none' : 'flex'
                            }}
                        >
                            {notif.nombre?.charAt(0).toUpperCase() || 'U'}
                        </div>

                        <div className="flex-grow-1">
                            <strong className="d-block">{notif.nombre}</strong>
                            <small className="text-muted d-block text-truncate" style={{ maxWidth: '220px' }}>
                                {notif.mensaje}
                            </small>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="btn-close"
                        onClick={() => onCerrar(notif.id)}
                        aria-label="Close"
                    ></button>
                </div>
            ))}

            <style>{`
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default Notificaciones;