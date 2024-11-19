import 'bootstrap/dist/css/bootstrap.min.css';
import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import mensajes from '../utilities/Mensajes';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCheck, faTrash, faEye } from '@fortawesome/free-solid-svg-icons';
import { getToken, borrarSesion } from '../utilities/Sessionutil';
import { ActualizarImagenes } from '../utilities/hooks/Conexion';
import swal from 'sweetalert';

const EditarPersona = ({ personaObtenida, handleChange }) => {
    const { register, handleSubmit, formState: { errors }, setValue } = useForm();
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [estado, setEstado] = useState(false);
    const estadoInicial = personaObtenida.estado;
    const [uploadedPhoto, setUploadedPhoto] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const selectedHandler = e => {
        setFile(e.target.files[0]);
    };

    const handleEstadoChange = () => {
        setEstado(!estado);
    };

    const handlePhotoChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setUploadedPhoto(file);
        }
    };

    const handleRemovePhoto = () => {
        setUploadedPhoto(null);
        setValue("foto", null);
    };

    const toggleModal = () => {
        setShowModal(!showModal);
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
        formData.append('correo', data.correo);
        if (data.clave) {
            formData.append('clave', data.clave);
        }
        if (file) {
            formData.append('foto', file);
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
        const formattedDate = personaObtenida.fecha_nacimiento
            ? new Date(personaObtenida.fecha_nacimiento).toISOString().split('T')[0]
            : '';
        setValue('fecha_nacimiento', formattedDate);
        setValue('telefono', personaObtenida.telefono);
        setValue('correo', personaObtenida.correo);
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
                                    <label>Fecha de Nacimiento</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        {...register('fecha_nacimiento', { required: true })}
                                    />
                                    {errors.fecha_nacimiento && <div className='alert alert-danger'>Ingrese una fecha de nacimiento</div>}
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
                                <label htmlFor="foto" className="form-label">Foto</label>
                                <input
                                    type="file"
                                    {...register("foto")}
                                    onChange={handlePhotoChange}
                                    className="form-control"
                                    accept="image/*"
                                />
                                {uploadedPhoto && (
                                    <div className="d-flex align-items-center mt-3 justify-content-center">
                                        <button
                                            type="button"
                                            className="btn btn-info btn-sm me-2 btn-mini"
                                            onClick={toggleModal}
                                        >
                                            <FontAwesomeIcon icon={faEye} /> Previsualizar
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-danger btn-sm btn-mini"
                                            onClick={handleRemovePhoto}
                                        >
                                            <FontAwesomeIcon icon={faTrash} /> Eliminar foto
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Modal de Previsualización */}
                            {showModal && (
                                <div className="modal show" tabIndex="-1" style={{ display: 'block' }}>
                                    <div className="modal-dialog modal-dialog-centered">
                                        <div className="modal-content">
                                            <div className="modal-header">
                                                <h5 className="modal-title titulo-secundario">Previsualización de la Foto</h5>
                                                <button
                                                    type="button"
                                                    className="btn-close"
                                                    onClick={toggleModal}
                                                    onChange={handleChange}
                                                    aria-label="Close"
                                                ></button>
                                            </div>
                                            <div className="modal-body text-center">
                                                <img
                                                    src={URL.createObjectURL(uploadedPhoto)}
                                                    alt="Vista previa"
                                                    className="img-fluid"
                                                    style={{ maxWidth: '100%' }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label>Correo</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        placeholder="Ingrese su correo"
                                        onChange={handleChange}
                                        {...register('correo', { required: true })}
                                    />
                                    {errors.correo && <div className='alert alert-danger'>Ingrese un correo</div>}
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label>Clave</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        onChange={handleChange}
                                        {...register('clave', { required: false })}
                                    />
                                    {errors.clave && <div className='alert alert-danger'>Ingrese la clave</div>}
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
