import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/style.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { peticionDelete, peticionGet, peticionPut } from '../utilities/hooks/Conexion';
import  {mensajes} from '../utilities/Mensajes';
import { getToken } from '../utilities/Sessionutil';
import swal from 'sweetalert';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';

const TerminarProyecto = ({ }) => {
    const { register, handleSubmit, setValue, formState: { errors } } = useForm();
    const { external_id_proyecto } = useParams();
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
        if (data.razonTerminacion.length > 350) {
            mensajes('La razón no puede exceder los 350 caracteres', 'error', 'Error');
            return;
        }

        try {
            const response = await peticionDelete(getToken(), `proyecto/terminar/${external_id_proyecto}/${data.razonTerminacion}`);
            if (response.code === 200) {
                mensajes(response.msg, 'success', 'Éxito');
                setTimeout(() => {
                   navigate('/proyectos');
                }, 2000);
            } else {
                mensajes(response.msg, 'error', 'Error');
            }
        } catch (error) {
            mensajes('Error al terminar el proyecto', 'error', 'Error');
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
                    mensajes('Terminación del proyecto cancelada',
                        'info',
                        'Información'
                    );
                    navigate(-1); 
                }
            });
    };

    return (
        <div className="contenedor-carta">
            <p className="titulo-proyecto">{infoProyecto.nombre}</p>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-3">
                    <label htmlFor="razonTerminacion" className="form-label">
                        <strong style={{ color: 'red' }}>* </strong>Razón para Terminar
                    </label>
                    <textarea
                        className={`form-control ${errors.razonTerminacion ? 'is-invalid' : ''}`}
                        id="razonTerminacion"
                        rows="3"
                        placeholder="Escribe la razón por la cual se termina el proyecto..."
                        {...register('razonTerminacion', { required: 'La razón es obligatoria', maxLength: { value: 350, message: 'Máximo 350 caracteres' } })}
                    ></textarea>
                    {errors.razonTerminacion && <div className="alert alert-danger">{errors.razonTerminacion.message}</div>}
                </div>

                <div className="contenedor-filo">
                    <button type="button" onClick={handleCancelClick} className="btn-negativo">
                        <FontAwesomeIcon icon={faTimes} /> Cancelar
                    </button>
                    <button type="submit" className="btn-positivo">
                        <FontAwesomeIcon icon={faCheck} /> Terminar Proyecto
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TerminarProyecto;