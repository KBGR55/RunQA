import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/style.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useNavigate, useParams } from 'react-router-dom';
import { peticionPost, peticionGet, peticionPut } from '../utilities/hooks/Conexion';
import mensajes from '../utilities/Mensajes';
import { getToken, getUser } from '../utilities/Sessionutil';
import swal from 'sweetalert';
import { useForm } from 'react-hook-form';

const NuevoProyecto = () => {
    const { external_id_proyecto } = useParams();
    const navigate = useNavigate();
    const [proyecto, setProyecto] = useState([]);
    const {register, handleSubmit, setValue,formState: { errors }, watch } = useForm();
    const horasDiarias = watch('horasDiarias');
  
    useEffect(() => {
        if (external_id_proyecto) {
            peticionGet(getToken(), `proyecto/obtener/${external_id_proyecto}`).then((info) => {
                if (info.code === 200) {
                    setValue('name', info.info.nombre);
                    setValue('description', info.info.descripcion);
                    setProyecto(info.info);
                } else {
                    mensajes(info.msg, 'error', 'Error');
                }
            }).catch((error) => {
                mensajes('Error al cargar el proyecto', 'error', 'Error');
                console.error(error);
            });
        }
    }, [external_id_proyecto, setValue]);

    const onSubmit = (data) => {
        if (data.name.length > 40) {
            mensajes('El nombre del proyecto no puede exceder los 40 caracteres', 'error', 'Error');
            return;
        }

        if (data.description.length > 350) {
            mensajes('La descripción no puede exceder los 350 caracteres', 'error', 'Error');
            return;
        }

        const requestData = {
            id_entidad: getUser().user.id,
            name: data.name,
            horasDiarias: data.horasDiarias,
            description: data.description,
        };

        if (external_id_proyecto) {
            requestData.id_proyect = proyecto.id;
            peticionPut(getToken(), 'proyecto', requestData).then((info) => {
                if (info.code !== 200) {
                    mensajes(info.msg, 'error', 'Error');
                } else {
                    mensajes(info.msg, 'success', 'Éxito');
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                }
            }).catch((error) => {
                mensajes('Error al guardar el proyecto', 'error', 'Error');
                console.error(error);
            });
        } else {
            peticionPost(getToken(), 'proyecto', requestData).then((info) => {
                if (info.code !== 200) {
                    mensajes(info.msg, 'error', 'Error');
                } else {
                    mensajes(info.msg, 'success', 'Éxito');
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                }
            }).catch((error) => {
                mensajes('Error al guardar el proyecto', 'error', 'Error');
                console.error(error);
            });
        }
    };

    const handleCancelClick = () => {
        swal({
            title: '¿Está seguro de cancelar el registro?',
            text: 'Una vez cancelado, no podrá revertir esta acción',
            icon: 'warning',
            buttons: ['No', 'Sí'],
            dangerMode: true,
        }).then((willCancel) => {
            if (willCancel) {
                mensajes('Actualización cancelada', 'info', 'Información');
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            }
        });
    };

    return (
        <>
            <div className="contenedor-carta">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-3">
                        <label htmlFor="nombreProyecto" className="form-label">
                            <strong style={{ color: 'red' }}>* </strong>Nombre del Proyecto
                        </label>
                        <input
                            type="text"
                            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                            id="nombreProyecto"
                            placeholder="Escribe el nombre del proyecto..."
                            {...register('name', { required: 'El nombre del proyecto es obligatorio', maxLength: { value: 40, message: 'El nombre no puede exceder los 40 caracteres' } })}
                        />
                        {errors.name && <div className="alert alert-danger">{errors.name.message}</div>}
                    </div>

                    <div className="mb-3">
                        <label htmlFor="descripcionProyecto" className="form-label">
                            <strong style={{ color: 'red' }}>* </strong>Descripción
                        </label>
                        <textarea
                            className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                            id="descripcionProyecto"
                            rows="3"
                            placeholder="Escribe la descripción..."
                            {...register('description', { required: 'La descripción es obligatoria', maxLength: { value: 350, message: 'La descripción no puede exceder los 350 caracteres' } })}
                        ></textarea>
                        {errors.description && <div className="alert alert-danger">{errors.description.message}</div>}
                    </div>

                    <div className="">
                        <label htmlFor="horasDiarias" className="form-label d-flex align-items-center">
                            <strong style={{ color: 'red' }}>* </strong>Horas diarias a trabajar como líder
                        </label>
                        <input
                            type="number"
                            id="horasDiarias"
                            className={`form-control ${errors.horasDiarias ? 'is-invalid' : ''}`}
                            {...register('horasDiarias', {
                                required: 'Las horas diarias son obligatorias',
                                min: { value: 1, message: 'Debe ser al menos 1 hora' },
                                max: { value: 24, message: 'Por favor, ingrese un valor válido. Recuerde que un día solo tiene 24 horas.' },
                            })}
                        />
                        {errors.horasDiarias && <div className="alert alert-danger">{errors.horasDiarias.message}</div>}
                        {horasDiarias > 8 && (
                            <span className="mensajeerror">
                                Al trabajar más de 8 horas, reconoce que está aceptando un mayor nivel de compromiso.
                            </span>
                        )}

                    </div>

                    <div className="contenedor-filo">
                        <button type="button" onClick={handleCancelClick} className="btn-negativo">
                            <FontAwesomeIcon icon={faTimes} /> Cancelar
                        </button>
                        <button className="btn-positivo" type="submit">
                            <FontAwesomeIcon icon={faCheck} /> {external_id_proyecto ? 'Actualizar' : 'Registrar'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default NuevoProyecto;