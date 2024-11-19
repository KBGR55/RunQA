import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/Registro_Style.css';
import '../css/style.css';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router';
import mensajes from '../utilities/Mensajes';
import { peticionPut } from '../utilities/hooks/Conexion';
import { borrarSesion, getUser } from '../utilities/Sessionutil';

const CambioClave = () => {
    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    const navigate = useNavigate();
    const { external_id, token } = useParams();
    const [claveCoincide, setClaveCoincide] = useState(false);
    const [mostrarClaveActual, setMostrarClaveActual] = useState(false);
    const [mostrarClave, setMostrarClave] = useState(false);
    const [mostrarConfirmarClave, setMostrarConfirmarClave] = useState(false);

    const nuevaClave = watch('nuevaClave');
    const confirmarClave = watch('confirmarClave');

    useEffect(() => {
        // Valida las claves cada vez que cualquiera de los campos cambia
        setClaveCoincide(nuevaClave === confirmarClave && nuevaClave?.length > 0);
    }, [nuevaClave, confirmarClave]);

    const onSubmit = async (data) => {
        const datos = token && external_id
            ? { clave_nueva: data.nuevaClave }
            : { clave_vieja: data.claveActual, clave_nueva: data.nuevaClave };

        const endpoint = token && external_id
            ? `cuenta/restablecer/clave/${external_id}`
            : `cuenta/clave/${getUser().external_cuenta}`;

        const response = await peticionPut(token, endpoint, datos);
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
                    {token && external_id
                        ? 'Establezca su nueva contraseña.'
                        : 'Ingrese su contraseña actual y establezca una nueva.'}
                </p>
                <form className="row g-3 p-2" onSubmit={handleSubmit(onSubmit)}>
                    {!token || !external_id ? (
                        <div className="col-12">
                            <label htmlFor="claveActual" className="form-label">Clave Actual</label>
                            <div className="input-group">
                                <input
                                    type={mostrarClaveActual ? "text" : "password"}
                                    className={`form-control ${errors.claveActual ? 'is-invalid' : ''}`}
                                    id="claveActual"
                                    placeholder="Ingrese su contraseña actual"
                                    {...register('claveActual', { required: 'La contraseña actual es obligatoria' })}
                                />
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={() => setMostrarClaveActual(!mostrarClaveActual)}
                                >
                                    <i className={`bi ${mostrarClaveActual ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                                </button>
                                {errors.claveActual && <div className="invalid-feedback">{errors.claveActual.message}</div>}
                            </div>
                        </div>
                    ) : null}
                    <div className="col-12">
                        <label htmlFor="nuevaClave" className="form-label">Nueva Clave</label>
                        <div className="input-group">
                            <input
                                type={mostrarClave ? "text" : "password"}
                                className={`form-control ${errors.nuevaClave ? 'is-invalid' : ''}`}
                                id="nuevaClave"
                                placeholder="Ingrese su nueva clave"
                                {...register('nuevaClave', {
                                    required: "Ingrese una clave",
                                    minLength: {
                                        value: 5,
                                        message: "La contraseña debe tener al menos 5 caracteres"
                                    },
                                    pattern: {
                                        value: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+\-=[\]{}|\\:";'?/.,`~]+$/,
                                        message: "Debe incluir al menos una letra, un número, y no usar < o >"
                                    }
                                })}
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
                                    required: "La confirmación de la clave es obligatoria",
                                    validate: value => value === nuevaClave || "Las claves no coinciden"
                                })}
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
