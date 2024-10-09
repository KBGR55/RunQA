import 'bootstrap/dist/css/bootstrap.min.css';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import mensajes from '../utilities/Mensajes';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCheck } from '@fortawesome/free-solid-svg-icons';
import { peticionPost, peticionGet } from '../utilities/hooks/Conexion';

const CasoPrueba = ({ projectId, id_editar }) => {
    const { register, handleSubmit, setValue, formState: { errors } } = useForm();
    const navigate = useNavigate();

    const [clasificaciones] = useState(['ALTA', 'MEDIA', 'BAJA']);
    const [estados] = useState(['DUPLICADO', 'BLOQUEADO', 'RECHAZADO', 'APROBADO']);
    const [estadoSeleccionado, setEstadoSeleccionado] = useState('APROBADO'); // Default value
    const [clasificacionSeleccionada, setClasificacionSeleccionada] = useState('MEDIA'); // Default value
    const [tiposPrueba] = useState([
        'FUNCIONAL', 'INTEGRACION', 'SISTEMA', 'REGRESION', 'EXPLORATORIA', 
        'ACEPTACION_USUARIO', 'RENDIMIENTO', 'SEGURIDAD'
    ]);

    useEffect(() => {
        const fetchCasoPrueba = async () => {
            if (id_editar) {
                try {
                    const response = await peticionGet('', `caso/prueba/obtener?external_id=${id_editar}`);
                    if (response.code === 200) {
                        const casoPruebaData = response.info;
                        setValue('titulo', casoPruebaData.nombre);
                        setValue('descripcion', casoPruebaData.descripcion);
                        setValue('pasos', casoPruebaData.pasos);
                        setValue('resultado_esperado', casoPruebaData.resultado_esperado);
                        setValue('precondiciones', casoPruebaData.precondiciones);
                        setValue('fecha_ejecucion_prueba', casoPruebaData.fecha_ejecucion_prueba);
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
        if (data.fecha_ejecucion_prueba && new Date(data.fecha_ejecucion_prueba) < new Date()) {
            mensajes('La fecha de ejecución no puede ser una fecha pasada', 'error');
            return;
        }
        const casoPruebaData = {
            "titulo": data.titulo,
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
                const response = await peticionPost('', 'caso/prueba/actualizar', casoPruebaData);
                if (response.code === 200) {
                    mensajes('Caso de prueba actualizado con exito', 'success');
                    navigate('/proyectos'); 
                } else {
                    mensajes(`Error al actualizar caso de prueba: ${response.msg}`, 'error');
                }
            } else{
                const response = await peticionPost('', 'caso/prueba/guardar', casoPruebaData);
                if (response.code === 200) {
                    mensajes('Caso de prueba registrado con éxito', 'success');
                    navigate('/proyectos'); 
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
                <p className="titulo-secundario">Datos del caso de prueba</p>
                <div className="row">
                    <div className="col-md-6">
                        <div className="form-group">
                            <label>Título</label>
                            <input
                                type="text"
                                className="form-control"
                                {...register('titulo', { required: true })}
                            />
                            {errors.titulo && (
                                <div className='alert alert-danger'>Ingrese el título del caso de prueba</div>
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
                                {...register('resultado_esperado', { required: true })}
                            />
                            {errors.resultado_esperado && (
                                <div className='alert alert-danger'>Ingrese el resultado esperado</div>
                            )}
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="form-group">
                            <label>Descripción</label>
                            <textarea
                                className="form-control"
                                {...register('descripcion', { required: true })}
                            />
                            {errors.descripcion && (
                                <div className='alert alert-danger'>Ingrese una descripción</div>
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
                                {...register('precondiciones', { required: true })}
                            />
                            {errors.precondiciones && (
                                <div className='alert alert-danger'>Ingrese las precondiciones</div>
                            )}
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="form-group">
                            <label>Fecha de Ejecución</label>
                            <input
                                type="date"
                                className="form-control"
                                {...register('fecha_ejecucion_prueba')}
                            />
                        </div>
                    </div>
                </div>
                <div className="contenedor-filo">
                    <button type="button" onClick={() => navigate('/proyectos')} className="btn-negativo">
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