import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/Login_Style.css';
import { InicioSesion } from '../utilities/hooks/Conexion';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { saveCorreo, saveToken, saveUser } from '../utilities/Sessionutil';
import  {mensajes, mensajesSinRecargar} from '../utilities/Mensajes';

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
                mensajes(info.msg, "error", "Error");
            } else {
                saveToken(infoAux.token);
                saveUser(infoAux.user);
                saveCorreo(infoAux.correo);
                mensajesSinRecargar(info.msg);
                navegation("/proyectos");
            }
        });
    };

    return (
        <div>
            <div className="container-fluid custom-container-login d-flex justify-content-center align-items-center vh-100">
                <div className="login-container shadow-lg">
                    <div className="login-left position-relative">
                        <div className="login-overlay d-flex flex-column justify-content-between">
                            <div className="d-flex align-items-center">
                                <img src="/logo192.png" alt="Logo RunQA" className="rounded-circle" style={{ width: '250px' }} />
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
                                        required: "Ingrese un correo",
                                        pattern: {
                                            value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,5}$/,
                                            message: "Ingrese un correo válido"
                                        }
                                    })}
                                    onFocus={() => handleFocus('correo')}
                                    onBlur={(e) => handleBlur('correo', e.target.value !== '')}
                                    className="form-control"
                                    id="email" />
                                {errors.correo && <span className="mensajeerror">{errors.correo.message}</span>}
                            </div>
                            <div className="mb-3">
                                <label htmlFor="password" className="form-label">Contraseña</label>
                                <div className="input-group">
                                    <input type={showPassword ? "text" : "password"}
                                        {...register("clave", {
                                            required: "Ingrese una contraseña"
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
                                        {showPassword ? <i className="bi bi-eye-fill"></i> : <i className="bi bi-eye-slash-fill"></i>}
                                    </button>
                                </div>
                                {errors.clave && <span className="mensajeerror">{errors.clave.message}</span>}
                            </div>
                            <button type="submit" className="btn btn-login w-100 mb-3">Ingresar</button>
                            <div className="d-flex justify-content-center align-items-center mt-4">
                                <button
                                    type="button"
                                    className="btn boton-custom"
                                    onClick={() => navegation("/olvidar/clave")}
                                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-terciario)'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-cuarto)'}
                                >¿Has olvidado tu contraseña?</button>
                            </div>
                            <div className="d-flex justify-content-center align-items-center mt-4">
                                <p className="text-muted mb-0" style={{ color: 'var(--color-cuarto)', marginRight: '0.5rem' }}>
                                    ¿No tienes una cuenta?
                                </p>
                                <button
                                    type="button"
                                    className="btn boton-custom"
                                    onClick={() => navegation("/registrarse")}
                                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-terciario)'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-cuarto)'}
                                >
                                    Regístrate
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
