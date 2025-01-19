import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Form } from 'react-bootstrap';
import { peticionGet, peticionPost } from '../utilities/hooks/Conexion';
import { useNavigate, useParams } from 'react-router-dom';
import { getToken, getUser } from '../utilities/Sessionutil';
import mensajes from '../utilities/Mensajes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCheck } from '@fortawesome/free-solid-svg-icons';
import { useForm } from 'react-hook-form';


const AgregarFuncionalidad = ({ funcionalidad, external_id_proyecto, onClose }) => {
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors, isValid }, reset, setValue } = useForm({ mode: 'onChange' });
    const isEditMode = Boolean(funcionalidad);
    const [tipo] = useState(['REQUISITO', 'CASO DE USO', 'HISTORIA DE USUARIO', 'REGLA DE NEGOCIO']);
    const usuario = getUser();

    useEffect(() => {
        if (isEditMode) {
            setValue('nombre', funcionalidad.nombre);
            setValue('descripcion', funcionalidad.descripcion);
            setValue('tipo', funcionalidad.tipo);
        } else {
            reset();
        }
    }, [funcionalidad, isEditMode, setValue, reset]);

    const onSubmit = async (data) => {
        const body = {
            nombre: data.nombre,
            descripcion: data.descripcion,
            tipo: data.tipo,
            id_proyecto: external_id_proyecto,
            external_id: funcionalidad?.external_id || undefined,
            id_creador: usuario.user.id
        };

        const url = isEditMode ? '/funcionalidad/editar' : '/funcionalidad/guardar';

        try {
            const response = await peticionPost(getToken(), url, body);
            if (response.code === 200) {
                mensajes(response.msg, 'success');
                onClose();
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } else {
                mensajes(response.msg, 'error');
            }
        } catch (error) {
            mensajes("Error al guardar la funcionalidad", "error");
        }
        
    };

    return (
        <div className="contenedor-carta">
            <form className="form-sample" onSubmit={handleSubmit(onSubmit)}>
                <div className="col-md-12">
                    <div className="form-group">
                    <Form.Label><strong style={{ color: 'red' }}>* </strong>Título</Form.Label>
                        <input
                            type="text"
                            className="form-control"
                            {...register('nombre', {
                                required: 'El título es obligatorio',
                                maxLength: {
                                    value: 100,
                                    message: 'El título no puede tener más de 100 caracteres'
                                },
                                validate: (value) => /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9,.#\s-]+$/.test(value) || "El título solo puede contener letras, números, comas, puntos, '#', y '-'."
                            })}
                        />
                        {errors.nombre && (
                            <div className='alert alert-danger'>{errors.nombre.message}</div>
                        )}
                    </div>
                </div>

                <div className="col-md-12">
                    <div className="form-group">
                    <Form.Label><strong style={{ color: 'red' }}>* </strong>Descripción</Form.Label>
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

                <div className="col-md-12">
                    <div className="form-group">
                    <Form.Label><strong style={{ color: 'red' }}>* </strong>Tipo</Form.Label>
                        <select
                            className="form-control"
                            defaultValue=""
                            {...register('tipo', { required: 'Seleccione un tipo' })}
                        >
                            <option value="">Seleccione</option>
                            {tipo.map(tipo => (
                                <option key={tipo} value={tipo}>{tipo}</option>
                            ))}
                        </select>
                        {errors.tipo && (
                            <div className='alert alert-danger'>{errors.tipo.message}</div>
                        )}
                    </div>
                </div>

                <div className="contenedor-filo mt-4">
                    <div className="mt-3">
                        <Button type="submit" className="btn-positivo" disabled={!isValid}>
                        <FontAwesomeIcon icon={faCheck} style={{ marginRight: '5px' }}/> 
                            {isEditMode ? "Actualizar" : "Guardar"}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default AgregarFuncionalidad;
