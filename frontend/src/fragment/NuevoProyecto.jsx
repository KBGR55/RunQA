import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/style.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { peticionPost, peticionGet, peticionPut } from '../utilities/hooks/Conexion';
import  {mensajes} from '../utilities/Mensajes';
import { getToken, getUser } from '../utilities/Sessionutil';
import swal from 'sweetalert';
import { useForm } from 'react-hook-form';

const NuevoProyecto = ({ external_id_proyecto, onClose }) => {
    const { register, handleSubmit, setValue, formState: { errors }, watch } = useForm();
    const [proyecto, setProyecto] = useState([]);
    const horasDiarias = watch('horasDiarias'); // Monitorea el valor de horasDiarias

    useEffect(() => {
        // Si existe external_id_proyecto, cargar los datos del proyecto para editar
        if (external_id_proyecto) {
            peticionGet(getToken(), `proyecto/obtener/${external_id_proyecto}`)
                .then((info) => {
                    if (info.code === 200) {
                        setValue('name', info.info.nombre);
                        setValue('description', info.info.descripcion);
                        setProyecto(info.info);
                    } else {
                        mensajes(info.msg, 'error', 'Error');
                    }
                })
                .catch((error) => {
                    mensajes('Error al cargar el proyecto', 'error', 'Error');
                    console.error(error);
                });
        }
    }, [external_id_proyecto, setValue]);

    const onSubmit = async (data) => {
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

        try {
            if (external_id_proyecto) {
                // Modo editar
                requestData.id_proyect = proyecto.id;
                const response = await peticionPut(getToken(), 'proyecto', requestData);
                if (response.code === 200) {
                    mensajes(response.msg, 'success', 'Éxito');
                } else {
                    mensajes(response.msg, 'error', 'Error');
                }
            } else {
                // Modo agregar
                const response = await peticionPost(getToken(), 'proyecto', requestData);
                if (response.code === 200) {
                    mensajes(response.msg, 'success', 'Éxito');
                } else {
                    mensajes(response.msg, 'error', 'Error');
                }
            }
        } catch (error) {
            mensajes('Error al guardar el proyecto', 'error', 'Error');
            console.error(error);
        }
        
    };

    const handleCancelClick = () => {
        swal({
            title: '¿Está seguro de cancelar?',
            text: 'Se perderán los datos no guardados',
            icon: 'warning',
            buttons: ['No', 'Sí'],
            dangerMode: true,
        }).then((willCancel) => {
            if (willCancel) {
                onClose();
            }
        });
    };

    return (
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
                        {...register('name', { required: 'El nombre del proyecto es obligatorio', maxLength: { value: 40, message: 'Máximo 40 caracteres' } })}
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
                        {...register('description', { required: 'La descripción es obligatoria', maxLength: { value: 350, message: 'Máximo 350 caracteres' } })}
                    ></textarea>
                    {errors.description && <div className="alert alert-danger">{errors.description.message}</div>}
                </div>

                {!external_id_proyecto && (
                    <div className="mb-3">
                        <label htmlFor="horasDiarias" className="form-label">
                            <strong style={{ color: 'red' }}>* </strong>Horas Diarias
                        </label>
                        <input
                            type="number"
                            className={`form-control ${errors.horasDiarias ? 'is-invalid' : ''}`}
                            id="horasDiarias"
                            {...register('horasDiarias', {
                                required: 'Este campo es obligatorio',
                                min: { value: 1, message: 'Mínimo 1 hora' },
                                max: { value: 24, message: 'Máximo 24 horas' },
                            })}
                        />
                        {errors.horasDiarias && <div className="alert alert-danger">{errors.horasDiarias.message}</div>}
                        {horasDiarias > 8 && (
                            <span className="mensajeerror">
                                Trabajar más de 8 horas implica mayor compromiso.
                            </span>
                        )}
                    </div>
                )}

                <div className="contenedor-filo">
                    <button type="button" onClick={handleCancelClick} className="btn-negativo">
                        <FontAwesomeIcon icon={faTimes} /> Cancelar
                    </button>
                    <button type="submit" className="btn-positivo">
                        <FontAwesomeIcon icon={faCheck} /> {external_id_proyecto ? 'Actualizar' : 'Registrar'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default NuevoProyecto;
