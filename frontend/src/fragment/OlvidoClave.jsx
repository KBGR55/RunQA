import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/Registro_Style.css';
import '../css/style.css';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import mensajes from '../utilities/Mensajes';
import { peticionPut } from '../utilities/hooks/Conexion';

const OlvidoClave = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const navigate = useNavigate();

    const onSubmit = async (data) => {
        const datos = {
           correo: data.correo
        };
        const response = await peticionPut('', 'cuenta/validar', datos);
        if (response.code === 200) {
            mensajes(`Se ha enviado un enlace de restablecimiento a ${data.correo}`, 'success', 'Éxito');
            setTimeout(() => {
                navigate('/login');
            }, 1200);
        } else {
            mensajes("Error al enviar el correo para restablecer contraseña", 'error');
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
                    Introduzca la dirección de correo electrónico verificada de su cuenta de usuario y un administrador le enviara un enlace de restablecimiento de contraseña.
                </p>
                <form className="row g-3 p-2" onSubmit={handleSubmit(onSubmit)}>
                    <div className="col-12">
                        <label htmlFor="correo" className="form-label">Correo electrónico</label>
                        <input
                            type="email"
                            className={`form-control ${errors.correo ? 'is-invalid' : ''}`}
                            id="correo"
                            placeholder="Ingrese su correo electrónico"
                            {...register('correo', {
                                required: 'El correo electrónico es obligatorio',
                                pattern: {
                                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,5}$/,
                                    message: 'Ingrese un correo válido',
                                },
                            })}
                        />
                        
                        {errors.correo && <div className="invalid-feedback">{errors.correo.message}</div>}
                    </div>
                    <div className="col-12 text-center">
                        <button type="submit" className="btn-positivo">
                            Enviar correo electrónico para restablecer contraseña
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default OlvidoClave;
