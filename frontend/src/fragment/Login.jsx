import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/Login_Style.css'
import iconLogo from '../img/logo512.png';
import MenuBar from './MenuBar';
import { InicioSesion } from '../utilities/hooks/Conexion';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { getRol, getToken, getUser, saveCorreo, saveRol, saveToken, saveUser } from '../utilities/Sessionutil';
import mensajes from '../utilities/Mensajes';

const Login = () => {
    const navegation = useNavigate();
    const { register, formState: { errors }, handleSubmit } = useForm();
    const [focused, setFocused] = useState({ correo: false, clave: false });

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
                saveRol(infoAux.rol);
                saveUser(infoAux.user);
                saveCorreo(infoAux.correo);
                navegation("/proyectos");
                mensajes(info.msg);
            }
        })
    };

    return (
        <div>
            <MenuBar />
            <div>
                <div className="container-fluid custom-container-login d-flex justify-content-center align-items-center vh-100">
                    <div className="login-container shadow-lg">
                        {/* Parte izquierda con la imagen y el overlay */}
                        <div className="login-left position-relative">
                            <div className="login-overlay d-flex flex-column justify-content-between">
                                <div className="d-flex justify-content-between">

                                </div>
                                <div className="d-flex align-items-center">
                                    <img src={iconLogo} alt="Logo RunQA" className="rounded-circle" style={{ width: '250px' }} />
                                </div>
                            </div>
                        </div>

                        {/* Parte derecha con el formulario */}
                        <div className="login-right p-5 d-flex flex-column justify-content-center">
                            <h2 className="text-center mb-4" style={{ fontWeight: 'bold' }}>Inicio de Sesión</h2>
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label">Correo electronico</label>
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
                                    <input type="password" 
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
                                    {errors.clave && <span className='mensajeerror'>{errors.clave.message}</span>}
                                </div>
                                <div className="mb-3 d-flex justify-content-end">
                                    <a href="#" className="text-muted">¿Olvido su contraseña?</a>
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
