import 'bootstrap/dist/css/bootstrap.min.css';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import mensajes from '../utilities/Mensajes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCheck } from '@fortawesome/free-solid-svg-icons';
import { peticionPost, peticionGet } from '../utilities/hooks/Conexion';
import { getToken } from '../utilities/Sessionutil';

const CasoPrueba = ({ projectId, id_editar }) => {
    const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm();

    const [clasificaciones] = useState(['ALTA', 'MEDIA', 'BAJA']);
    const [estados] = useState(['DUPLICADO', 'BLOQUEADO', 'RECHAZADO', 'APROBADO']);
    const [estadoSeleccionado, setEstadoSeleccionado] = useState('APROBADO'); 
    const [clasificacionSeleccionada, setClasificacionSeleccionada] = useState('MEDIA'); 
    const [tiposPrueba] = useState([
        'FUNCIONAL', 'INTEGRACION', 'SISTEMA', 'REGRESION', 'EXPLORATORIA',
        'ACEPTACION_USUARIO', 'RENDIMIENTO', 'SEGURIDAD'
    ]);

    useEffect(() => {
        const fetchCasoPrueba = async () => {
            if (id_editar) {
                try {
                    const response = await peticionGet(getToken(), `caso/prueba/obtener?external_id=${id_editar}`);
                    if (response.code === 200) {
                        const casoPruebaData = response.info;
                        setValue('nombre', casoPruebaData.nombre);
                        setValue('descripcion', casoPruebaData.descripcion);
                        setValue('pasos', casoPruebaData.pasos);
                        setValue('resultado_esperado', casoPruebaData.resultado_esperado);
                        setValue('precondiciones', casoPruebaData.precondiciones);
                        setValue('fecha_ejecucion_prueba', new Date(casoPruebaData.fecha_ejecucion_prueba).toISOString().slice(0, 10));
                        setClasificacionSeleccionada(casoPruebaData.clasificacion);
                        setEstadoSeleccionado(casoPruebaData.estado);
                        setValue('tipo_prueba', casoPruebaData.tipo_prueba);
                    } else {
                        mensajes(`Error al obtener caso de prueba: ${response.msg}`, 'error');
                    }
                } catch (error) {
                    mensajes('Error al procesar la solicitud', 'error');
                }
            }
        };

        fetchCasoPrueba();
    }, [id_editar, setValue]);

    const onSubmit = async (data) => {

        const casoPruebaData = {
            "nombre": data.nombre.toUpperCase(),
            "descripcion": data.descripcion,
            "pasos": data.pasos,
            "resultado_esperado": data.resultado_esperado,
            "estado": estadoSeleccionado,
            "clasificacion": clasificacionSeleccionada,
            "tipo_prueba": data.tipo_prueba,
            "precondiciones": data.precondiciones,
            "fecha_ejecucion_prueba": data.fecha_ejecucion_prueba,
            "id_proyecto": projectId
        };

        try {
            if (id_editar) {
                casoPruebaData['external_id'] = id_editar;
                const response = await peticionPost(getToken(), 'caso/prueba/actualizar', casoPruebaData);
                if (response.code === 200) {
                    mensajes('Caso de prueba actualizado con exito', 'success');
                    setTimeout(() => {
                        window.location.reload();
                    }, 1200);
                } else {
                    mensajes(`Error al actualizar caso de prueba: ${response.msg}`, 'error');
                }
            } else {

                if (data.fecha_ejecucion_prueba && new Date(data.fecha_ejecucion_prueba) < new Date()) {
                    mensajes('La fecha de ejecución no puede ser una fecha pasada', 'error');
                    return;
                }
                //permite realizar cuado la fexcha sea mayor o igual a la actual
                const response = await peticionPost('', 'caso/prueba/guardar', casoPruebaData);
                if (response.code === 200) {
                    mensajes('Caso de prueba registrado con éxito', 'success');
                    reset();
                    setTimeout(() => {
                        window.location.reload();
                    }, 1200);
                } else {
                    mensajes(`Error al registrar caso de prueba: ${response.msg}`, 'error');
                }
            }
        } catch (error) {
            mensajes('Error al procesar la solicitud', 'error');
        }
    };

    return (
        <div className="contenedor-carta">
            <form className="form-sample" onSubmit={handleSubmit(onSubmit)}>
                <p className="nombre-secundario">Datos del caso de prueba</p>
                <div className="row">
                    <div className="col-md-6">
                        <div className="form-group">
                            <label>Título</label>
                            <input
                                type="text"
                                className="form-control"
                                {...register('nombre', {
                                    required: 'El título es obligatorio',
                                    maxLength: {
                                        value: 50,
                                        message: 'El título no puede tener más de 50 caracteres'
                                    },
                                    validate: (value) => /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9,.#\s-]+$/.test(value) || "El título solo puede contener letras, números, comas, puntos, '#', y '-'."
                                })}
                            />
                            {errors.nombre && (
                                <div className='alert alert-danger'>{errors.nombre.message}</div>
                            )}
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="form-group">
                            <label>Clasificación</label>
                            <select
                                className="form-control"
                                value={clasificacionSeleccionada}
                                onChange={(e) => setClasificacionSeleccionada(e.target.value)}
                            >
                                {clasificaciones.map((clasificacion, index) => (
                                    <option key={index} value={clasificacion}>
                                        {clasificacion}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="col-md-12">
                        <div className="form-group">
                            <label>Pasos</label>
                            <textarea
                                className="form-control"
                                {...register('pasos', { required: true })}
                            />
                            {errors.pasos && (
                                <div className='alert alert-danger'>Ingrese los pasos del caso de prueba</div>
                            )}
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="form-group">
                            <label>Resultado Esperado</label>
                            <textarea
                                className="form-control"
                                {...register('resultado_esperado', {
                                    required: 'El resultado esperado es obligatorio', 
                                    maxLength: {
                                        value: 255,
                                        message: 'El resultado esperado no puede tener más de 255 caracteres' 
                                    }
                                })}
                            />
                            {errors.resultado_esperado && (
                                <div className='alert alert-danger'>{errors.resultado_esperado.message}</div>
                            )}
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="form-group">
                            <label>Descripción</label>
                            <textarea
                                className="form-control"
                                {...register('descripcion', {
                                    required: 'La descripción es obligatoria', 
                                    maxLength: {
                                        value: 150,
                                        message: 'La descripción no puede tener más de 150 caracteres' 
                                    }
                                })}
                            />
                            {errors.descripcion && (
                                <div className='alert alert-danger'>{errors.descripcion.message}</div>
                            )}
                        </div>
                    </div>

                    <div className="col-md-6">
                        <div className="form-group">
                            <label>Estado</label>
                            <select
                                className="form-control"
                                value={estadoSeleccionado}
                                onChange={(e) => setEstadoSeleccionado(e.target.value)}
                            >
                                {estados.map((estado, index) => (
                                    <option key={index} value={estado}>
                                        {estado}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="form-group">
                            <label>Tipo de Prueba</label>
                            <select
                                className="form-control"
                                {...register('tipo_prueba', { required: true })}
                            >
                                {tiposPrueba.map((tipo, index) => (
                                    <option key={index} value={tipo}>
                                        {tipo}
                                    </option>
                                ))}
                            </select>
                            {errors.tipo_prueba && (
                                <div className='alert alert-danger'>Seleccione el tipo de prueba</div>
                            )}
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="form-group">
                            <label>Precondiciones</label>
                            <textarea
                                className="form-control"
                                {...register('precondiciones', {
                                    required: 'Las precondiciones son obligatorias', 
                                    maxLength: {
                                        value: 150,
                                        message: 'Las precondiciones no pueden tener más de 150 caracteres' 
                                    }
                                })}
                            />
                            {errors.precondiciones && (
                                <div className='alert alert-danger'>{errors.precondiciones.message}</div>
                            )}
                        </div>
                    </div>

                    <div className="col-md-6">
                        <div className="form-group">
                            <label>Fecha de Ejecución</label>
                            <input
                                type="date"
                                className="form-control"
                                {...register('fecha_ejecucion_prueba', { required: true })}
                            />
                            {errors.fecha_ejecucion_prueba && (
                                <div className='alert alert-danger'>Ingrese la fecha de ejecución de la prueba</div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="contenedor-filo">
                    <button type="button"  onClick={() => window.location.reload()} className="btn-negativo">
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

export default CasoPrueba;