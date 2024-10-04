import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/Login_Style.css'
import iconLogo from '../img/logo512.png';
import MenuBar from './MenuBar';

const Login = () => {
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
                            <h2 className="text-center mb-4" style={{fontWeight:'bold'}}>Inicio de Sesión</h2>
                            <form>
                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label">Correo electronico</label>
                                    <input type="email" className="form-control" id="email" />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="password" className="form-label">Contraseña</label>
                                    <input type="password" className="form-control" id="password" />
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
