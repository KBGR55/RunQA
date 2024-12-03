import 'bootstrap/dist/css/bootstrap.min.css';
import { useForm } from 'react-hook-form';
import React, { useEffect, useState } from 'react';
import mensajes from '../utilities/Mensajes';
import { peticionGet, peticionPost } from '../utilities/hooks/Conexion';
import { getToken } from '../utilities/Sessionutil';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCheck } from '@fortawesome/free-solid-svg-icons'; import swal from 'sweetalert';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';

const AgregarErrores = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [clasificaciones] = useState(['ALTA', 'MEDIA', 'BAJA']);
    const [estados] = useState(['DUPLICADO', 'BLOQUEADO', 'RECHAZADO', 'APROBADO']);
    const [estadoSeleccionado, setEstadoSeleccionado] = useState('PENDIENTE');
    const [clasificacionSeleccionada, setClasificacionSeleccionada] = useState([]);
    const { external_id_proyecto, external_id } = useParams();
    const [infoProyecto, setProyecto] = useState([]);
    const navigate = useNavigate();

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
            persona_asignada: data.persona_asignada,
            severidad: clasificacionSeleccionada,
            prioridad: data.prioridad,
            estado: estadoSeleccionado,
            razon: data.razon,
            fecha_reporte: new Date().toISOString(),
            fecha_resolucion: null,
            external_caso_prueba: external_id
        };

        try {
            const response = await peticionPost(getToken(), 'error/guardar', errorData);
            if (response.code === 200) {
                mensajes('Errores agregados correctamente', 'success');
                setTimeout(() => {
                    window.location.reload();
                }, 1200);
            } else {
                mensajes(`Error al agregar el error: ${response.msg}`, 'error');
            }
        } catch (error) {
            mensajes('Error al procesar la solicitud', 'error');
        }
    };

    const handleCancelClick = () => {
        swal({
            title: "¿Está seguro de cancelar la creación del error?",
            text: "Una vez cancelado, no podrá revertir esta acción",
            icon: "warning",
            buttons: ["No", "Sí"],
            dangerMode: true,
        }).then((willCancel) => {
            if (willCancel) {
                mensajes("Creación del error cancelada", "info", "Información");
                navigate(-1); // Regresa a la página anterior
            }
        });
    };

    //buscar un get router.get('/proyecto/:id_proyect',proyectoController.getEntidadProyecto);
    return (
        <div className="contenedor-carta">
            <p className="titulo-proyecto">  Proyecto "{infoProyecto.nombre}"</p>
            <p className="titulo-primario">Error</p>
            <form className="form-sample" onSubmit={handleSubmit(onSubmit)}>
                <div className="row">
                    <div className="col-md-6">
                        <div className="form-group">
                            <label className='titulo-campos'><strong style={{ color: 'red' }}>* </strong>Funcionalidad</label>
                            <input
                                type="text"
                                className="form-control"
                                {...register('funcionalidad', { required: 'La funcionalidad es obligatoria' })}
                            />
                            {errors.funcionalidad && (
                                <div className='alert alert-danger'>{errors.funcionalidad.message}</div>
                            )}
                        </div>
                    </div>

                    <div className="col-md-6">
                        <div className="form-group">
                            <label className='titulo-campos'><strong style={{ color: 'red' }}>* </strong>Título</label>
                            <input
                                type="text"
                                className="form-control"
                                {...register('titulo', { required: 'El título es obligatorio' })}
                            />
                            {errors.titulo && (
                                <div className='alert alert-danger'>{errors.titulo.message}</div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="form-group">
                    <label className='titulo-campos'><strong style={{ color: 'red' }}>* </strong>Pasos para reproducir</label>
                    <textarea
                        className="form-control"
                        {...register('pasos_reproducir', { required: 'Los pasos para reproducir son obligatorios' })}
                    />
                    {errors.pasos_reproducir && (
                        <div className='alert alert-danger'>{errors.pasos_reproducir.message}</div>
                    )}
                </div>

                <div className="form-group">
                    <label className='titulo-campos'>Persona asignada</label>
                    <input
                        type="text"
                        className="form-control"
                        {...register('persona_asignada')}
                    />
                </div>

                <div className="row">
                    <div className="col-md-6">
                        <div className="form-group">
                            <label className='titulo-campos'><strong style={{ color: 'red' }}>* </strong>Severidad</label>
                            <select
                                className="form-control"
                                onChange={(e) => setClasificacionSeleccionada(e.target.value)}
                                value={clasificacionSeleccionada}
                            >
                                <option value="" disabled>Seleccionar severidad</option>
                                {clasificaciones.map((clasificacion, index) => (
                                    <option key={index} value={clasificacion}>
                                        {clasificacion}
                                    </option>
                                ))}
                            </select>
                            {errors.severidad && (
                                <div className='alert alert-danger'>{errors.severidad.message}</div>
                            )}
                        </div>
                    </div>

                    <div className="col-md-6">
                        <div className="form-group">
                            <label className='titulo-campos'><strong style={{ color: 'red' }}>* </strong>Prioridad</label>
                            <input
                                type="number"
                                className="form-control"
                                {...register('prioridad', { required: 'La prioridad es obligatoria' })}
                            />
                            {errors.prioridad && (
                                <div className='alert alert-danger'>{errors.prioridad.message}</div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="form-group">
                    <label className='titulo-campos'>Razón</label>
                    <textarea
                        className="form-control"
                        {...register('razon', { required: 'La razón es obligatoria' })}
                    />
                    {errors.razon && (
                        <div className='alert alert-danger'>{errors.razon.message}</div>
                    )}
                </div>

                <div className="contenedor-filo">
                    <button type="button" onClick={handleCancelClick} className="btn-negativo">
                        <FontAwesomeIcon icon={faTimes} /> Cancelar
                    </button>
                    <button type="submit" className="btn-positivo">
                        <FontAwesomeIcon icon={faCheck} /> Aceptar
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AgregarErrores;
