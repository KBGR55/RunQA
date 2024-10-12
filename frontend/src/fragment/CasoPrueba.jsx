import 'bootstrap/dist/css/bootstrap.min.css';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import mensajes from '../utilities/Mensajes';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCheck } from '@fortawesome/free-solid-svg-icons';

const RegistrarCasoPrueba = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const navigate = useNavigate();

    const [clasificaciones, setClasificaciones] = useState(['ALTA', 'MEDIA', 'BAJA']);
    const [estados, setEstados] = useState(['OBSOLETO', 'DUPLICADO', 'BLOQUEADO', 'RECHAZADO', 'APROBADO']);
    const [estadoSeleccionado, setEstadoSeleccionado] = useState('APROBADO'); // Valor por defecto
    const [clasificacionSeleccionada, setClasificacionSeleccionada] = useState('MEDIA'); // Valor por defecto

    const onSubmit = (data) => {
        const casoPruebaData = {
            "titulo": data.titulo,
            "descripcion": data.descripcion,
            "pasos": data.pasos,
            "resultado_esperado": data.resultado_esperado,
            "resultado_obtenido": data.resultado_obtenido,
            "estado": estadoSeleccionado,
            "clasificacion": clasificacionSeleccionada,
            "tipo_prueba": data.tipo_prueba,
            "incidente_numero": data.incidente_numero,
            "fecha_ejecucion_prueba": data.fecha_ejecucion_prueba
        };

        // Lógica para guardar los datos (consola solo para pruebas)
        console.log(casoPruebaData);
        mensajes('Caso de prueba registrado con éxito', 'success');
    };

    return (
        <div className="contenedor-carta">
            <form className="form-sample" onSubmit={handleSubmit(onSubmit)}>
                <p className="titulo-secundario">Datos del caso de prueba</p>
                <div className="row">
                    <div className="col-md-6">
                        <div className="form-group">
                            <label>Titulo</label>
                            <input
                                type="text"
                                className="form-control"
                                {...register('titulo', { required: true })}
                            />
                            {errors.titulo && (
                                <div className='alert alert-danger'>Ingrese el titulo del caso de prueba</div>
                            )}
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="form-group">
                            <label>Clasificación</label>
                            <select
                                className="form-control"
                                {...register('clasificacion', { required: true })}
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
                                {...register('pasos')}
                            />
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
                                {...register('estado', { required: true })}
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
                            <input
                                type="text"
                                className="form-control"
                                {...register('tipo_prueba', { required: true })}
                            />
                            {errors.tipo_prueba && (
                                <div className='alert alert-danger'>Ingrese el tipo de prueba</div>
                            )}
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="form-group">
                            <label>Número de Incidente</label>
                            <input
                                type="number"
                                className="form-control"
                                {...register('incidente_numero', { required: true })}
                                defaultValue={0}
                            />
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
                    <button className="btn-positivo" type="submit">
                        <FontAwesomeIcon icon={faCheck} /> Registrar</button>
                </div>
            </form>
        </div>
    );
};

export default RegistrarCasoPrueba;