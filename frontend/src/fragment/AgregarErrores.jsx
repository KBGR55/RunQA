import 'bootstrap/dist/css/bootstrap.min.css';
import { useForm } from 'react-hook-form';
import React, { useEffect, useState } from 'react';
import mensajes from '../utilities/Mensajes';
import { peticionGet, peticionPost } from '../utilities/hooks/Conexion';
import { getToken, getUser } from '../utilities/Sessionutil';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCheck, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import swal from 'sweetalert';
import { useNavigate } from 'react-router-dom';
import { useParams, useLocation } from 'react-router-dom';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

const AgregarErrores = () => {
    const { register, handleSubmit, setValue, formState: { errors } } = useForm();
    const [severidad] = useState(['MEDIA', 'BAJA', 'CRITICO']);
    const [prioridad] = useState(['ALTA', 'MEDIA', 'BAJA']);
    const [estados] = useState(['NUEVO', 'CERRADO', 'PENDIENTE_VALIDACION', 'CORRECCION']);
    const [estadoSeleccionado, setEstadoSeleccionado] = useState('PENDIENTE');
    const [clasificacionSeleccionada, setClasificacionSeleccionada] = useState([]);
    const [prioridadSeleccionada, setPrioridadSeleccionada] = useState([]);
    const { external_id_proyecto, external_id, external_id_error } = useParams();
    const location = useLocation();
    const [infoProyecto, setProyecto] = useState([]);
    const navigate = useNavigate();
    const [testers, setTesters] = useState([]);
    const [selectedTester, setSelectedTester] = useState(null);

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

                    // Fetch testers
                    const responseTesters = await peticionGet(getToken(), `proyecto/listar/rol/DESARROLLADOR/${external_id_proyecto}`);
                    if (responseTesters.code === 200) {
                        setTesters(responseTesters.info);
                    } else {
                        mensajes(responseTesters.msg, 'error');
                    }
                }

                if (external_id_error) {
                    const response = await peticionGet(getToken(), `error/obtener/external?external_id=${external_id_error}`);
                    if (response.code === 200) {
                        const dataError = response.info;
                        setValue('titulo', dataError.titulo || '');
                        setValue('funcionalidad', dataError.funcionalidad || '');
                        setValue('pasos_reproducir', dataError.pasos_reproducir || '');
                        setValue('persona_asignada', dataError.persona_asignada || '');
                        setValue('razon', dataError.razon || '');
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
        const errorData = {
            funcionalidad: data.funcionalidad,
            titulo: data.titulo,
            pasos_reproducir: data.pasos_reproducir,
            persona_responsable: data.persona_asignada.id,
            persona_asignadora: getUser().user.id,
            severidad: clasificacionSeleccionada,
            prioridad: prioridadSeleccionada,
            estado: estadoSeleccionado,
            razon: data.razon,
            fecha_reporte: new Date().toISOString(),
            fecha_resolucion: null,
            external_caso_prueba: external_id
        };

        try {
            if (external_id_error) {
                errorData['external_id'] = external_id_error;
                const response = await peticionPost(getToken(), `error/actualizar?external_id=${external_id_error}`, errorData);
                if (response.code === 200) {
                    mensajes('Error actualizado con exito', 'success');
                    navigate(`/error/visualizar/${external_id_proyecto}/${external_id}/${external_id_error}`);
                } else {
                    mensajes(`Error al actualizar el error: ${response.msg}`, 'error');
                }
            } else {
                const response = await peticionPost(getToken(), 'error/guardar', errorData);
                if (response.code === 200) {
                    mensajes('Errores agregados correctamente', 'success');
                    if (response.code === 200) {
                        mensajes('Errores agregados correctamente', 'success');
                        setTimeout(() => {
                            swal({
                                title: "¿Desea seguir agregando errores?",
                                text: "Puede continuar agregando errores o cancelar esta acción.",
                                icon: "warning",
                                buttons: ["Cancelar", "Seguir agregando"],
                                dangerMode: true,
                            }).then((willContinue) => {
                                if (willContinue) {
                                    setTimeout(() => {
                                        window.location.reload();
                                    }, 5000);
                                } else {
                                    mensajes("Operación cancelada", "info", "Información");
                                    navigate(-1);
                                }
                            });
                        }, 2200);
                    }

                } else {
                    mensajes(`Error al agregar el error: ${response.msg}`, 'error');
                }
            }
        } catch (error) {
            mensajes('Error al procesar la solicitud', 'error');
        }
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
            <p className="titulo-proyecto">Proyecto "{infoProyecto.nombre}"</p>
            {!external_id_error ? (<h2 className="titulo-primario">Agregar error</h2>) : <p className="titulo-primario">Editar error</p>}
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
                            <label className="titulo-campos"><strong style={{ color: 'red' }}>* </strong>Funcionalidad</label>
                            <input
                                type="text"
                                className="form-control"
                                {...register('funcionalidad', { required: 'La funcionalidad es obligatoria' })}
                            />
                            {errors.funcionalidad && (
                                <div className="alert alert-danger">{errors.funcionalidad.message}</div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="form-group">
                    <label className="titulo-campos"><strong style={{ color: 'red' }}>* </strong>Pasos para reproducir</label>
                    <textarea
                        className="form-control"
                        {...register('pasos_reproducir', { required: 'Los pasos para reproducir son obligatorios' })}
                    />
                    {errors.pasos_reproducir && (
                        <div className="alert alert-danger">{errors.pasos_reproducir.message}</div>
                    )}
                </div>
                <div className="row">
                    <div className="col-md-6">
                        <div className="form-group">
                            <label className="titulo-campos"><strong style={{ color: 'red' }}>* </strong>Severidad  <OverlayTrigger
                                placement="top"
                                overlay={
                                    <Tooltip> Indica la gravedad del problema detectado
                                        <table className="table table-bordered text-start m-0">
                                            <thead>
                                                <tr>
                                                    <th>Valor</th>
                                                    <th>Significado</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>CRITICO</td>
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
                                    <Tooltip> Determina el orden en el que debe resolverse
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
                                                    <td>Intermedio en prioridad, no afecta funciones críticas.</td>
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
                        <div className="form-group">
                            <label className="titulo-campos">Persona asignada</label>
                            <select
                                className="form-control"
                                onChange={(e) => {
                                    const testerId = e.target.value;
                                    const tester = testers.find(t => t.id === parseInt(testerId));
                                    setSelectedTester(tester);
                                    setValue('persona_asignada', tester ? `${tester.nombres} ${tester.apellidos}` : '');
                                }}
                                value={selectedTester ? selectedTester.id : ''}
                            >
                                <option value="" disabled>Seleccionar un tester</option>
                                {testers.map(tester => (
                                    <option key={tester.id} value={tester.id}>
                                        {tester.nombres} {tester.apellidos}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-">
                        <div className="form-group">
                            <label className="titulo-campos">Razón</label>
                            <textarea
                                type="text"
                                className="form-control"
                                {...register('razon')}
                            />
                        </div>
                    </div>
                </div>
                <div className="form-group d-flex justify-content-end">
                    <button type="submit" className="btn btn-success btn-icon-text">
                        <FontAwesomeIcon icon={faCheck} />
                        Guardar
                    </button>
                    <button
                        type="button"
                        className="btn btn-danger btn-icon-text"
                        style={{ marginLeft: '10px' }}
                        onClick={handleCancelClick}
                    >
                        <FontAwesomeIcon icon={faTimes} />
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AgregarErrores;
