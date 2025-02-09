import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/style.css';
import { useForm } from 'react-hook-form';
import React, { useEffect, useState } from 'react';
import { mensajes, mensajesSinRecargar } from '../utilities/Mensajes';
import { ActualizarImagenes, GuardarImages, peticionGet, peticionPost } from '../utilities/hooks/Conexion';
import { borrarSesion, getToken, getUser } from '../utilities/Sessionutil';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCheck, faTrash, faEye, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import swal from 'sweetalert';
import { useNavigate } from 'react-router-dom';
import { useParams, useLocation } from 'react-router-dom';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import ModalAsignarDesarrollador from './ModalAsignarDesarrollador';

const AgregarErrores = () => {
    const { register, handleSubmit, setValue, formState: { errors } } = useForm();
    const [severidad] = useState(['CRITICA', 'MEDIA', 'BAJA']);
    const [prioridad] = useState(['ALTA', 'MEDIA', 'BAJA']);
    const [estadoSeleccionado, setEstadoSeleccionado] = useState('PENDIENTE');
    const [clasificacionSeleccionada, setClasificacionSeleccionada] = useState([]);
    const [prioridadSeleccionada, setPrioridadSeleccionada] = useState([]);
    const { external_id_proyecto, external_id, external_id_error } = useParams();
    const [infoProyecto, setProyecto] = useState([]);
    const [casoPrueba, setCasosPrueba] = useState([]);
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [uploadedPhoto, setUploadedPhoto] = useState(null);
    const [idError, setIdError] = useState(null);
    const [showModalDesarrollador, setShowModalDesarrollador] = useState(false);
    const usuario = getUser();


    useEffect(() => {
        const fetchCasoPrueba = async () => {
            try {
                if (external_id_proyecto) {
                    peticionGet(getToken(), `proyecto/obtener/${external_id_proyecto}`).then((info) => {
                        if (info.code === 200) {
                            setProyecto(info.info);
                        } else {
                            mensajes(info.msg, "error", "Error");
                        }
                    }).catch((error) => {
                        mensajes("Error al cargar el proyecto", "error", "Error");
                        console.error(error);
                    });
                    if (external_id) {
                        peticionGet(getToken(), `caso/prueba/obtener/external/${external_id}`).then((info) => {
                            if (info.code === 200) {
                                setCasosPrueba(info.info);
                            } else {
                                mensajes(info.msg, "error", "Error");
                            }
                        }).catch((error) => {
                            mensajes("Error al cargar el caso de prueba", "error", "Error");
                            console.error(error);
                        });
                    }
                }

                if (external_id_error) {
                    const response = await peticionGet(getToken(), `error/obtener/external?external_id=${external_id_error}`);
                    if (response.code === 200) {
                        const dataError = response.info.errorEncontrado;
                        setValue('titulo', dataError.titulo || '');
                        setValue('descripcion', dataError.descripcion || '');
                        setValue('pasos_repetir', dataError.pasos_repetir || '');
                        setValue('persona_asignada', dataError.persona_asignada || '');
                        setValue('resultado_obtenido', dataError.resultado_obtenido || '');
                        setClasificacionSeleccionada(dataError.severidad || '');
                        setPrioridadSeleccionada(dataError.prioridad || '');
                        setEstadoSeleccionado(dataError.estado || 'PENDIENTE');
                    } else {
                        mensajes(`Error al obtener error: ${response.msg}`, 'error');
                    }
                }
            } catch (error) {
                mensajes('Error al procesar la solicitud', 'error');
            }
        };
        fetchCasoPrueba();
    }, [external_id_proyecto]);

    const onSubmit = async (data) => {
        const formData = new FormData();
        formData.append('descripcion', data.descripcion);
        formData.append('titulo', data.titulo.toUpperCase());
        formData.append('pasos_repetir', data.pasos_repetir);
        formData.append('persona_responsable', 'data.persona_asignada.id');
        formData.append('persona_asignadora', 'getUser().user.id');
        formData.append('severidad', clasificacionSeleccionada);
        formData.append('prioridad', prioridadSeleccionada);
        formData.append('estado', estadoSeleccionado);
        formData.append('resultado_obtenido', data.resultado_obtenido);
        formData.append('fecha_resolucion', null);
        formData.append('external_caso_prueba', external_id);

        if (data.foto && data.foto.length > 0) {
            formData.append('foto', data.foto[0]);
        } else {
            const defaultPhotoUrl = `${process.env.PUBLIC_URL}/errors/SIN_ANEXO.png`;
            formData.append('foto', defaultPhotoUrl);
        }

        try {
            if (external_id_error) {
                formData.append('external_id', external_id_error);
                const response = await ActualizarImagenes(formData, getToken(), `/error/actualizar?external_id=${external_id_error}`);
                if (response.code === 200) {
                    mensajes('Error actualizado con éxito', 'success');
                    navigate(`/error/visualizar/${external_id_proyecto}/${external_id}/${external_id_error}`);
                } else {
                    mensajes(`Error al actualizar el error: ${response.msg}`, 'error');
                }
            } else {
                const response = await GuardarImages(formData, getToken(), "/error/guardar");

                if (response.code === 200) {
                    mensajes('Error agregado correctamente', 'success');

                    setValue('titulo', '');
                    setValue('descripcion', '');
                    setValue('pasos_repetir', '');
                    setValue('persona_asignada', '');
                    setValue('resultado_obtenido', '');
                    setClasificacionSeleccionada('');
                    setPrioridadSeleccionada('');
                    setEstadoSeleccionado('PENDIENTE');
                    setUploadedPhoto(null);

                    setIdError(response.info.id);

                    swal({
                        title: "Errores agregados correctamente",
                        text: "¿Desea asignar un desarrollador para corregir el error?",
                        icon: "warning",
                        buttons: ["No", "Sí"],
                        dangerMode: false,
                    }).then((willAssign) => {
                        if (willAssign) {
                            setShowModalDesarrollador(true);
                        } else {
                            mensajesSinRecargar("Creación del error completada", "success");
                            navigate(-1);
                        }
                    });
                } else {
                    mensajes(`Error al agregar el error: ${response.msg}`, 'error');
                }
            }
        } catch (error) {
            mensajes('Error al procesar la solicitud: ' + error.message, 'error');
        }
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

    const handleCancelClick = () => {
        const isEditMode = Boolean(external_id_error);
        swal({
            title: isEditMode
                ? "¿Está seguro de cancelar la edición del error?"
                : "¿Está seguro de cancelar la creación del error?",
            text: "Una vez cancelado, no podrá revertir esta acción",
            icon: "warning",
            buttons: ["No", "Sí"],
            dangerMode: true,
        }).then((willCancel) => {
            if (willCancel) {
                mensajes(isEditMode
                    ? "Edición del error cancelada"
                    : "Creación del error cancelada",
                    "info",
                    "Información"
                );
                navigate(-1);
            }
        });
    };

    return (
        <div className="contenedor-carta">
            <p className="titulo-proyecto">{infoProyecto.nombre}</p>
            <p className="titulo-secundario">Caso prueba: {casoPrueba.nombre}</p>
            {!external_id_error ? (<h2 className="titulo-primario">Agregar error </h2>) : <p className="titulo-primario">Editar error</p>}
            <form className="form-sample" onSubmit={handleSubmit(onSubmit)}>
                <div className="row">
                    <div className="col-md-6">
                        <div className="form-group">
                            <label className="titulo-campos"><strong style={{ color: 'red' }}>* </strong>Título</label>
                            <input
                                type="text"
                                className="form-control"
                                {...register('titulo', { required: 'El título es obligatorio' })}
                            />
                            {errors.titulo && (
                                <div className="alert alert-danger">{errors.titulo.message}</div>
                            )}
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="form-group">
                            <label className='titulo-campos'><strong style={{ color: 'red' }}>* </strong>Descripción</label>
                            <textarea
                                className="form-control"
                                {...register('descripcion', {
                                    required: 'La descripción es obligatoria',
                                    maxLength: {
                                        value: 350,
                                        message: 'La descripción no puede tener más de 350 caracteres'
                                    }
                                })}
                            />
                            {errors.descripcion && (
                                <div className='alert alert-danger'>{errors.descripcion.message}</div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="form-group">
                    <label className="titulo-campos"><strong style={{ color: 'red' }}>* </strong>Pasos para reproducir</label>
                    <textarea
                        className="form-control"
                        {...register('pasos_repetir', { required: 'Los pasos para reproducir son obligatorios' })}
                    />
                    {errors.pasos_repetir && (
                        <div className="alert alert-danger">{errors.pasos_repetir.message}</div>
                    )}
                </div>
                <div className="row">
                    <div className="col-md-6">
                        <div className="form-group">
                            <label className="titulo-campos"><strong style={{ color: 'red' }}>* </strong>Severidad  <OverlayTrigger
                                placement="top"
                                overlay={
                                    <Tooltip className="custom-tooltip"> Indica la gravedad del problema detectado
                                        <table className="table table-bordered text-start m-0">
                                            <thead>
                                                <tr>
                                                    <th>Valor</th>
                                                    <th>Significado</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>CRITICA</td>
                                                    <td>Compromete el sistema completo, urgente.</td>
                                                </tr>
                                                <tr>
                                                    <td>MEDIA</td>
                                                    <td>Afecta funciones secundarias, no crítico.</td>
                                                </tr>
                                                <tr>
                                                    <td>BAJA</td>
                                                    <td>Problema menor, plazo extendido para resolución.</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </Tooltip>
                                }
                            >
                                <FontAwesomeIcon icon={faQuestionCircle} className="ms-2 text-info" />
                            </OverlayTrigger></label>
                            <select
                                className="form-control"
                                onChange={(e) => setClasificacionSeleccionada(e.target.value)}
                                value={clasificacionSeleccionada}
                            >
                                <option value="" disabled>Seleccionar severidad</option>
                                {severidad.map((clasificacion, index) => (
                                    <option key={index} value={clasificacion}>
                                        {clasificacion}
                                    </option>
                                ))}
                            </select>
                            {errors.severidad && (
                                <div className="alert alert-danger">{errors.severidad.message}</div>
                            )}
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="form-group">
                            <label className="titulo-campos"><strong style={{ color: 'red' }}>* </strong>Prioridad  <OverlayTrigger
                                placement="top"
                                overlay={
                                    <Tooltip className="custom-tooltip"> Determina el orden en el que debe resolverse
                                        <table className="table table-bordered text-start m-0">
                                            <thead>
                                                <tr>
                                                    <th>Valor</th>
                                                    <th>Significado</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>ALTA</td>
                                                    <td>Debe resolverse primero, afecta operaciones clave.</td>
                                                </tr>
                                                <tr>
                                                    <td>MEDIA</td>
                                                    <td>Intermedio en prioridad, no afecta funciones criticas.</td>
                                                </tr>
                                                <tr>
                                                    <td>BAJA</td>
                                                    <td>Puede resolverse en un plazo extendido.</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </Tooltip>
                                }
                            >
                                <FontAwesomeIcon icon={faQuestionCircle} className="ms-2 text-info" />
                            </OverlayTrigger></label>
                            <select
                                className="form-control"
                                onChange={(e) => setPrioridadSeleccionada(e.target.value)}
                                value={prioridadSeleccionada}
                            >
                                <option value="" disabled>Seleccionar prioridad</option>
                                {prioridad.map((prioridad, index) => (
                                    <option key={index} value={prioridad}>
                                        {prioridad}
                                    </option>
                                ))}
                            </select>
                            {errors.prioridad && (
                                <div className="alert alert-danger">{errors.prioridad.message}</div>
                            )}
                        </div>
                    </div>

                    <div className="col-md-6">
                        <label htmlFor="foto" className="titulo-campos">Foto</label>
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
                </div>
                <div className="row m-2">
                    {external_id_error &&
                        <div className="col-md-">
                            <div className="form-group">
                                <label className="titulo-campos">Resultado obtenido</label>
                                <textarea
                                    type="text"
                                    className="form-control"
                                    {...register('resultado_obtenido')}
                                />
                            </div>
                        </div>}
                </div>
                <div className="form-group d-flex justify-content-end">
                    <button
                        type="button"
                        className="btn-negativo"
                        style={{ marginLeft: '10px' }}
                        onClick={handleCancelClick}
                    >
                        <FontAwesomeIcon icon={faTimes} /> Cancelar
                    </button>
                    <button type="submit" className="btn-positivo">
                        <FontAwesomeIcon icon={faCheck} />
                        Guardar
                    </button>
                </div>
            </form>
            {showModalDesarrollador && (
                <ModalAsignarDesarrollador
                    showModalDesarrollador={showModalDesarrollador}
                    setShowModalDesarrollador={setShowModalDesarrollador}
                    external_id_proyecto={external_id_proyecto}
                    usuario={usuario}
                    external_error={idError}
                />
            )}
        </div>

    );

};

export default AgregarErrores;
