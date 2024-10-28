import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/Registro_Style.css';
import '../css/Login_Style.css';
import '../css/style.css';
import { GuardarImages } from '../utilities/hooks/Conexion';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { borrarSesion, getToken } from '../utilities/Sessionutil';
import mensajes from '../utilities/Mensajes';
import swal from 'sweetalert';

const Registrar = () => {
    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordMatch, setPasswordMatch] = useState(null);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    useEffect(() => {
        // Actualiza el estado de coincidencia de la clave y confirmación
        setPasswordMatch(confirmPassword === watch('clave'));
    }, [confirmPassword, watch('clave')]);

    const onSubmit = data => {
        if (!passwordMatch) {
            mensajes('Las contraseñas no coinciden', 'error', 'Error');
            return;
        }
        const formData = new FormData();
        formData.append('nombres', data.nombres.toUpperCase());
        formData.append('apellidos', data.apellidos.toUpperCase());
        formData.append('correo', data.correo);
        formData.append('fecha_nacimiento', data.fecha_nacimiento);
        formData.append('telefono', data.telefono);
        formData.append('clave', data.clave);
        if (data.foto && data.foto.length > 0) {
            formData.append('foto', data.foto[0]);
        } else {
            const defaultPhotoUrl = `${process.env.PUBLIC_URL}/img/USUARIO_ICONO.png`;
            formData.append('foto', defaultPhotoUrl);
        }

        GuardarImages(formData, getToken(), "/entidad/guardar").then(info => {
            if (info.code !== 200) {
                mensajes(info.msg, 'error', 'Error');
                borrarSesion();
                navigate('/login');
            } else {
                mensajes(info.msg);
                setTimeout(() => {
                    window.location.reload();
                }, 1200);
            }
        });
    };

    const handleCancelClick = () => {
        swal({
            title: "¿Está seguro de cancelar el registro?",
            text: "Una vez cancelado, no podrá revertir esta acción",
            icon: "warning",
            buttons: ["No", "Sí"],
            dangerMode: true,
        }).then((willCancel) => {
            if (willCancel) {
                mensajes("Registro cancelado", "info", "Información");
                setTimeout(() => {
                    window.location.reload();
                }, 1200);
            }
        });
    };

    return (
        <div>
            <div className="contenedor-carta">
                <p className="titulo-primario">Registro de usuario</p>
                <form className="row g-3 p-2" onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
                    <div className="col-md-6">
                        <label htmlFor="nombres" className="form-label">Ingrese sus nombres</label>
                        <input
                            type="text"
                            {...register("nombres", {
                                required: {
                                    value: true,
                                    message: "Ingrese sus nombres"
                                },
                                pattern: {
                                    value: /^(?!\s*$)[a-zA-Z\s]+$/,
                                    message: "Ingrese un nombre correcto"
                                }
                            })}
                            className="form-control"
                        />
                        {errors.nombres && <span className='mensajeerror'>{errors.nombres.message}</span>}
                    </div>

                    <div className="col-md-6">
                        <label htmlFor="apellidos" className="form-label">Ingrese sus apellidos</label>
                        <input
                            type="text"
                            {...register("apellidos", {
                                required: {
                                    value: true,
                                    message: "Ingrese sus apellidos"
                                },
                                pattern: {
                                    value: /^(?!\s*$)[a-zA-Z\s]+$/,
                                    message: "Ingrese un apellido correcto"
                                }
                            })}
                            className="form-control"
                        />
                        {errors.apellidos && <span className='mensajeerror'>{errors.apellidos.message}</span>}
                    </div>

                    <div className="col-md-6">
                        <label htmlFor="fecha_nacimiento" className="form-label">Ingrese su fecha de nacimiento</label>
                        <input type="date"
                            {...register("fecha_nacimiento", {
                                required: {
                                    value: true,
                                    message: "Ingrese su fecha de nacimiento"
                                },
                                validate: (value) => {
                                    const fechaNacimiento = new Date(value);
                                    const fechaActual = new Date();
                                    const edad =
                                        fechaActual.getFullYear() - fechaNacimiento.getFullYear();
                                    return edad >= 16 || "Debe ser mayor de 16 años"
                                }
                            })}
                            className="form-control"
                        />
                        {errors.fecha_nacimiento && <span className='mensajeerror'>{errors.fecha_nacimiento.message}</span>}
                    </div>

                    <div className="col-md-6">
                        <label htmlFor="telefono" className="form-label">Ingrese su telefono</label>
                        <input type="text"
                            {...register("telefono", {
                                required: {
                                    value: true,
                                    message: "Ingrese su telefono"
                                },
                                pattern: {
                                    value: /^[0-9]+$/,
                                    message: "Ingrese su telefono correctamente"
                                },
                                minLength: {
                                    value: 5,
                                    message: "El teléfono debe tener mínimo 5 caracteres"
                                },
                                maxLength: {
                                    value: 10,
                                    message: "El teléfono debe tener máximo 10 caracteres"
                                }
                            })}
                            className="form-control"
                        />
                        {errors.telefono && <span className='mensajeerror'>{errors.telefono.message}</span>}
                    </div>

                    <div className="col-md-6">
                        <label htmlFor="correo" className="form-label">Ingrese su correo electrónico</label>
                        <input type="email"
                            {...register("correo", {
                                required: {
                                    value: true,
                                    message: "Ingrese un correo"
                                },
                                pattern: {
                                    value: /^[a-zA-Z0-9._%+-]+@unl\.edu\.ec$/,
                                    message: "Ingrese un correo válido institucional UNL (@unl.edu.ec)"
                                }
                            })}
                            className="form-control"
                        />
                        {errors.correo && <span className='mensajeerror'>{errors.correo.message}</span>}
                    </div>

                    <div className="col-md-6">
                        <label htmlFor="clave" className="form-label">Ingrese su clave</label>
                        <div className="input-group">
                            <input
                                type={showPassword ? "text" : "password"}
                                {...register("clave", {
                                    required: {
                                        value: true,
                                        message: "Ingrese una clave"
                                    },
                                    minLength: {
                                        value: 5,
                                        message: "La contraseña debe tener al menos 5 caracteres"
                                    },
                                    pattern: {
                                        value: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/,
                                        message: "La clave debe contener al menos una letra y un número"
                                    }
                                })}
                                className="form-control"
                            />
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={togglePasswordVisibility}
                            >
                                {showPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>
                        {errors.clave && <span className='mensajeerror'>{errors.clave.message}</span>}
                    </div>

                    <div className="col-md-6">
                        <label htmlFor="foto" className="form-label">Seleccionar foto</label>
                        <input type="file"
                            {...register("foto", {
                                required: {
                                    message: "Seleccione una foto"
                                }
                            })}
                            className="form-control"
                        />
                        {errors.foto && <span className='mensajeerror'>{errors.foto.message}</span>}
                    </div>
                    <div className="col-md-6">
                        <label htmlFor="confirmPassword" className="form-label">Confirme su clave</label>
                        <div className="input-group">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="form-control"
                            />
                            <span className="input-group-text">
                                {passwordMatch === null ? '' : passwordMatch ? '✔️' : '❌'}
                            </span>
                        </div>
                        {confirmPassword && !passwordMatch && (
                            <span className='mensajeerror'>Las claves no coinciden</span>
                        )}
                    </div>


                    <div className="contenedor-filo">
                        <button type="button" onClick={handleCancelClick} className="btn-negativo">Cancelar</button>
                        <button type="submit" className="btn-positivo">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Registrar;
