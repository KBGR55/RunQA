import 'bootstrap/dist/css/bootstrap.min.css';
import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import mensajes from '../utilities/Mensajes';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCheck } from '@fortawesome/free-solid-svg-icons';
import { getToken, borrarSesion } from '../utilities/Sessionutil';
import { ActualizarImagenes } from '../utilities/hooks/Conexion';
import swal from 'sweetalert';

const EditarPersona = ({ personaObtenida, handleChange }) => {
    const { register, handleSubmit, formState: { errors }, setValue } = useForm();
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [estado, setEstado] = useState(false);
    const estadoInicial = personaObtenida.estado;

    const selectedHandler = e => {
        setFile(e.target.files[0]);
    };

    const handleEstadoChange = () => {
        setEstado(!estado);
    };

    const onSubmit = async (data) => {
        const formData = new FormData();
        formData.append('nombres', data.nombres);
        formData.append('apellidos', data.apellidos);
        formData.append('fecha_nacimiento', data.fecha_nacimiento);
        formData.append('telefono', data.telefono);
        formData.append('estado', estadoInicial ? !estado : estado);
        formData.append('external_id', personaObtenida.external_id);
        formData.append('entidad_id', personaObtenida.id);

        if (file) {
            formData.append('foto', file);
        } else {
            formData.append('foto_actual', personaObtenida.foto);
        }

        ActualizarImagenes(formData, getToken(), "/modificar/entidad")
            .then((info) => {
                if (!info || info.code !== 200) {
                    mensajes(info?.msg || 'Error desconocido', 'error', 'Error');
                    if (info?.msg === "TOKEN NO VALIDO O EXPIRADO") {
                        borrarSesion();
                    }
                } else {
                    setTimeout(() => {
                        window.location.reload();
                    }, 1200);
                    mensajes(info.msg);
                }
            })
            .catch(error => {
                console.error('Error en la solicitud:', error);
                mensajes('Error en la conexión con el servidor', 'error', 'Error');
            });
    };

    useEffect(() => {
        setValue('nombres', personaObtenida.nombres);
        setValue('apellidos', personaObtenida.apellidos);
        setValue('fecha_nacimiento', personaObtenida.fecha_nacimiento);
        setValue('telefono', personaObtenida.telefono);
    }, [personaObtenida, setValue]);

    const handleCancelClick = () => {
        swal({
            title: "¿Está seguro de cancelar la actualización de datos?",
            text: "Una vez cancelado, no podrá revertir esta acción",
            icon: "warning",
            buttons: ["No", "Sí"],
            dangerMode: true,
        }).then((willCancel) => {
            if (willCancel) {
                mensajes("Actualización cancelada", "info", "Información");
                setTimeout(() => {
                    window.location.reload();
                }, 1200);
            }
        });
    };

    return (
        <div className="contenedor-carta">
            <div className="row">
                <div className="col-12">
                    <form className="form-sample" onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
                        <p className="card-description" style={{ fontWeight: 'bold' }}>Datos informativos</p>
                        <div className="row">
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label>Nombres</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        onChange={handleChange}
                                        {...register('nombres', { required: true })}
                                    />
                                    {errors.nombres && <div className='alert alert-danger'>Ingrese los nombres</div>}
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label>Apellidos</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        onChange={handleChange}
                                        {...register('apellidos', { required: true })}
                                    />
                                    {errors.apellidos && <div className='alert alert-danger'>Ingrese los apellidos</div>}
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label>Número telefónico</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Ingrese su número telefónico"
                                        onChange={handleChange}
                                        {...register('telefono', { required: true })}
                                    />
                                    {errors.telefono && <div className='alert alert-danger'>Ingrese un número telefónico</div>}
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label>Foto</label>
                                    <input
                                        type="file"
                                        className="form-control"
                                        onChange={selectedHandler}
                                    />
                                </div>
                            </div>
                            <div className="col-md-12">
                                <div className="form-group">
                                    <label>Estado</label>
                                    <div className="form-check">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            checked={estado}
                                            onChange={handleEstadoChange}
                                        />
                                        <label className="form-check-label">
                                            {estadoInicial ? "Seleccione para Desactivar Cuenta" : "Seleccione para Activar Cuenta"}
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-12" style={{ marginBottom: '10px' }}></div>
                        </div>
                        <div className="contenedor-filo">
                            <button type="button" onClick={handleCancelClick} className="btn-negativo">
                                <FontAwesomeIcon icon={faTimes} /> Cancelar
                            </button>
                            <button className="btn-positivo" type="submit">
                                <FontAwesomeIcon icon={faCheck} /> Aceptar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditarPersona;
