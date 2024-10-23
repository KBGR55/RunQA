import React, { useState } from 'react';
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
    const { register, handleSubmit, formState: { errors } } = useForm();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const onSubmit = data => {
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
            console.log("data", defaultPhotoUrl);
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
            title: "¿Está seguro de cancelar el registro",
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
            <div className='contenedor-centro'>
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
                                        message: "El telefóno debe tener mínimo 5 caracteres"
                                    },
                                    maxLength: {
                                        value: 10,
                                        message: "El telefóno debe tener máximo 10 caracteres"
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
                        <div className="col-md-12">
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
                        <div className="contenedor-filo">
                            <button type="button" onClick={() => { handleCancelClick() }} className="btn-negativo">Cancelar</button>
                            <button type="submit" className="btn-positivo">Guardar</button>
                        </div>

                    </form>
                </div>
            </div>
        </div>

    );
};

export default Registrar;