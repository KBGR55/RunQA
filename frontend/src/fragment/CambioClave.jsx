import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/Registro_Style.css';
import '../css/style.css';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router';
import mensajes from '../utilities/Mensajes';
import { peticionPut } from '../utilities/hooks/Conexion';
import { borrarSesion } from '../utilities/Sessionutil';

const CambioClave = () => {
    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    const navigate = useNavigate();
    const { external_id, token } = useParams(); // Extraer external_id y token de la URL
    const [claveCoincide, setClaveCoincide] = useState(false);
    const [mostrarClave, setMostrarClave] = useState(false);
    const [mostrarConfirmarClave, setMostrarConfirmarClave] = useState(false);

    const nuevaClave = watch('nuevaClave');
    const confirmarClave = watch('confirmarClave');

    const validarClaves = () => {
        if (nuevaClave && confirmarClave) {
            setClaveCoincide(nuevaClave === confirmarClave);
        } else {
            setClaveCoincide(false);
        }
    };

    const onSubmit = async (data) => {
        const datos = {
            clave_nueva: data.nuevaClave
        };
        const response = await peticionPut(token, `cuenta/restablecer/clave/${external_id}`, datos);
        if (response.code === 200) {
            mensajes("La contraseña ha sido actualizada exitosamente", 'success', 'Éxito');
            setTimeout(() => {
                navigate('/login');
                borrarSesion();
            }, 1200);
        } else {
            mensajes(response.msg, 'error');
        }
    };

    return (
        <div className="container-fluid d-flex justify-content-center align-items-center custom-container-register">
            <div className="register-container">
                <div className="text-center mb-4">
                    <img src="/logo192.png" alt="RunQA" style={{ width: '150px' }} />
                </div>
                <h2 className="text-center mb-4 titulo-primario">Cambio de Clave</h2>
                <p className="text-center">
                    Establezca su nueva contraseña.
                </p>
                <form className="row g-3 p-2" onSubmit={handleSubmit(onSubmit)}>
                    <div className="col-12">
                        <label htmlFor="nuevaClave" className="form-label">Nueva Clave</label>
                        <div className="input-group">
                            <input
                                type={mostrarClave ? "text" : "password"}
                                className={`form-control ${errors.nuevaClave ? 'is-invalid' : ''}`}
                                id="nuevaClave"
                                placeholder="Ingrese su nueva clave"
                                {...register('nuevaClave', {
                                    required: 'La nueva clave es obligatoria',
                                    pattern: {
                                        value: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+\-=[\]{}|\\:";'?/.,`~]+$/,
                                        message: "La clave debe contener al menos una letra, un número y puede incluir caracteres especiales, excepto < y >"
                                    },
                                })}
                                onChange={validarClaves}
                            />
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() => setMostrarClave(!mostrarClave)}
                            >
                                <i className={`bi ${mostrarClave ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                            </button>
                            {errors.nuevaClave && <div className="invalid-feedback">{errors.nuevaClave.message}</div>}
                        </div>
                    </div>
                    <div className="col-12">
                        <label htmlFor="confirmarClave" className="form-label">Confirmar Clave</label>
                        <div className="input-group">
                            <input
                                type={mostrarConfirmarClave ? "text" : "password"}
                                className={`form-control ${errors.confirmarClave ? 'is-invalid' : ''}`}
                                id="confirmarClave"
                                placeholder="Confirme su clave"
                                {...register('confirmarClave', {
                                    required: 'La confirmación de la clave es obligatoria',
                                    validate: value => value === nuevaClave || "Las claves no coinciden"
                                })}
                                onChange={validarClaves}
                            />
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() => setMostrarConfirmarClave(!mostrarConfirmarClave)}
                            >
                                <i className={`bi ${mostrarConfirmarClave ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                            </button>
                            {claveCoincide && (
                                <span className="input-group-text text-success">
                                    <i className="bi bi-check-circle-fill"></i>
                                </span>
                            )}
                        </div>
                        {errors.confirmarClave && <div className="invalid-feedback">{errors.confirmarClave.message}</div>}
                    </div>
                    <div className="col-12 text-center">
                        <button
                            type="submit"
                            className="btn-positivo"
                            disabled={!claveCoincide}
                        >
                            Cambiar Clave
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CambioClave;
