import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/Login_Style.css'
import { InicioSesion } from '../utilities/hooks/Conexion';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { saveCorreo, saveToken, saveUser } from '../utilities/Sessionutil';
import mensajes from '../utilities/Mensajes';

const Login = () => {
    const navegation = useNavigate();
    const { register, formState: { errors }, handleSubmit } = useForm();
    const [focused, setFocused] = useState({ correo: false, clave: false });
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleFocus = (field) => {
        setFocused({ ...focused, [field]: true });
    };

    const handleBlur = (field, hasValue) => {
        setFocused({ ...focused, [field]: hasValue });
    };


    const onSubmit = (data, event) => {
        var datos = {
            "correo": data.correo,
            "clave": data.clave
        };

        InicioSesion(datos).then((info) => {
            var infoAux = info.info;
            if (info.code !== 200) {
                mensajes(info.msg, "error", "Error")
            } else {
                saveToken(infoAux.token);                
                saveUser(infoAux.user);
                saveCorreo(infoAux.correo);
                navegation("/proyectos");
                mensajes(info.msg);
            }
        })
    };


    return (
        <div>
            <div>
                <div className="container-fluid custom-container-login d-flex justify-content-center align-items-center vh-100">
                    <div className="login-container shadow-lg">
                        <div className="login-left position-relative">
                            <div className="login-overlay d-flex flex-column justify-content-between">
                                <div className="d-flex justify-content-between">

                                </div>
                                <div className="d-flex align-items-center">
                                    <img src= "/logo192.png" alt="Logo RunQA" className="rounded-circle" style={{ width: '250px' }} />
                                </div>
                            </div>
                        </div>

                        <div className="login-right p-5 d-flex flex-column justify-content-center">
                            <h2 className="text-center mb-4" style={{ fontWeight: 'bold', color: '#424874' }}>Inicio de Sesión</h2>
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label">Correo electrónico</label>
                                    <input type="email"
                                        {...register("correo", {
                                            required: {
                                                value: true,
                                                message: "Ingrese un correo"
                                            },
                                            pattern: {
                                                value: /[a-zA-Z0-9_]+([.][a-zA-Z0-9_]+)*@[a-zA-Z0-9_]+([.][a-zA-Z0-9_]+)*[.][a-zA-Z]{2,5}/,
                                                message: "Ingrese un correo válido"
                                            }
                                        })}
                                        onFocus={() => handleFocus('correo')}
                                        onBlur={(e) => handleBlur('correo', e.target.value !== '')}
                                        className="form-control"
                                        id="email" />
                                    {errors.correo && <span className='mensajeerror'>{errors.correo.message}</span>}
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="password" className="form-label">Contraseña</label>
                                    <div className="input-group">
                                        <input type={showPassword ? "text" : "password"}
                                            {...register("clave", {
                                                required: {
                                                    value: true,
                                                    message: "Ingrese una contraseña"
                                                }
                                            })}
                                            onFocus={() => handleFocus('clave')}
                                            onBlur={(e) => handleBlur('clave', e.target.value !== '')}
                                            className="form-control"
                                            id="password" />

                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            onClick={togglePasswordVisibility}
                                        >
                                            {showPassword ? <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye-fill" viewBox="0 0 16 16">
                                                <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0" />
                                                <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7" />
                                            </svg> : <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye-slash-fill" viewBox="0 0 16 16">
                                                <path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7 7 0 0 0 2.79-.588M5.21 3.088A7 7 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474z" />
                                                <path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12z" />
                                            </svg>}
                                        </button>

                                    </div>
                                    {errors.clave && <span className='mensajeerror'>{errors.clave.message}</span>}
                                </div>
                                <button type="submit" className="btn btn-login w-100 mb-3">Ingresar</button>
                                <button type="button" className="btn btn-login-google w-100">Ingresar con Google</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

        </div>


    );
};

export default Login;