import 'bootstrap/dist/css/bootstrap.min.css';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import mensajes from '../utilities/Mensajes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCheck } from '@fortawesome/free-solid-svg-icons';
import { peticionPost, peticionGet } from '../utilities/hooks/Conexion';
import { getToken } from '../utilities/Sessionutil';
import { useNavigate, useParams } from 'react-router-dom';
import swal from 'sweetalert';

const CasoPrueba = () => {
    const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm();
    const { external_id_proyecto, external_id } = useParams();
    const [infoProyecto, setProyecto] = useState([]);
    const navigate = useNavigate();

    const [clasificaciones] = useState(['ALTA', 'MEDIA', 'BAJA']);
    const [estados] = useState(['DUPLICADO', 'BLOQUEADO', 'RECHAZADO', 'APROBADO']);

    const [estadoSeleccionado, setEstadoSeleccionado] = useState('APROBADO');

    const [clasificacionSeleccionada, setClasificacionSeleccionada] = useState([]);
    const [tiposPrueba] = useState([
        'FUNCIONAL', 'INTEGRACION', 'SISTEMA', 'REGRESION', 'EXPLORATORIA',
        'ACEPTACION_USUARIO', 'RENDIMIENTO', 'SEGURIDAD'
    ]);


    useEffect(() => {
        const fetchCasoPrueba = async () => {
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
            if (external_id) {

                try {
                    const response = await peticionGet(getToken(), `caso/prueba/obtener?external_id=${external_id}`);
                    if (response.code === 200) {
                        const casoPruebaData = response.info;
                        setValue('nombre', casoPruebaData.nombre);
                        setValue('descripcion', casoPruebaData.descripcion);
                        setValue('pasos', casoPruebaData.pasos);
                        setValue('resultado_esperado', casoPruebaData.resultado_esperado);
                        setValue('precondiciones', casoPruebaData.precondiciones);
                        setValue('datos_entrada', casoPruebaData.datos_entrada);
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
    }, [external_id, setValue]);

    const handleCancelClick = () => {
        const isEditMode = Boolean(external_id);

        swal({
            title: isEditMode
                ? "¿Está seguro de cancelar la edición del caso de prueba?"
                : "¿Está seguro de cancelar la creación del caso de prueba?",
            text: "Una vez cancelado, no podrá revertir esta acción",
            icon: "warning",
            buttons: ["No", "Sí"],
            dangerMode: true,
        }).then((willCancel) => {
            if (willCancel) {
                mensajes(isEditMode
                    ? "Edición del caso de prueba cancelada"
                    : "Creación del caso de prueba cancelada",
                    "info",
                    "Información"
                );
                navigate(-1);
            }
        });
    };

    const onSubmit = async (data) => {

        console.log('888888', external_id_proyecto);

        const casoPruebaData = {

            "nombre": data.nombre.toUpperCase(),
            "descripcion": data.descripcion,
            "pasos": data.pasos,
            "resultado_esperado": data.resultado_esperado,
            "estado": estadoSeleccionado,
            "estadoActual": "PENDIENTE",
            "clasificacion": clasificacionSeleccionada,
            "tipo_prueba": data.tipo_prueba,
            "precondiciones": data.precondiciones,
            "datos_entrada": data.datos_entrada,
            "fecha_ejecucion_prueba": data.fecha_ejecucion_prueba,
            "external_proyecto": external_id_proyecto
        };

        try {
            if (external_id) {
                casoPruebaData['external_id'] = external_id;
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
                <p className="titulo-proyecto">  Proyecto "{infoProyecto.nombre}"</p>
                {!external_id ? (<h2 className='titulo-primario '>Registrar caso de prueba</h2>) : <p className="titulo-primario">Editar caso de prueba</p>}
                <div className="row">
                    <div className="col-md-6">
                        <div className="form-group">
                            <label className='titulo-campos'><strong style={{ color: 'red' }}>* </strong>Título</label>
                            <input
                                type="text"
                                className="form-control"
                                {...register('nombre', {
                                    required: 'El título es obligatorio',
                                    maxLength: {
                                        value: 100,
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
                            <label className='titulo-campos'><strong style={{ color: 'red' }}>* </strong>Tipo de Prueba</label>
                            <select
                                className="form-control"
                                defaultValue=""  // Establece el valor predeterminado en vacío
                                {...register('tipo_prueba', { required: "Seleccione el tipo de prueba" })}
                            >
                                <option value="" disabled>Seleccione</option>  {/* Opción predeterminada */}
                                {tiposPrueba.map((tipo, index) => (
                                    <option key={index} value={tipo}>
                                        {tipo}
                                    </option>
                                ))}
                            </select>
                            {errors.tipo_prueba && (
                                <div className='alert alert-danger'>{errors.tipo_prueba.message}</div>
                            )}
                        </div>
                    </div>

                    <div className="col-md-6">
                        <div className="form-group">
                            <label className='titulo-campos'><strong style={{ color: 'red' }}>* </strong>Clasificación</label>
                            <select
                                className="form-control"
                                {...register('clasificacion', { required: 'Seleccione una clasificación' })}
                                value={clasificacionSeleccionada}
                                onChange={e => setClasificacionSeleccionada(e.target.value)}
                            >
                                <option value="">Seleccione</option>
                                {clasificaciones.map(clasificacion => (
                                    <option key={clasificacion} value={clasificacion}>{clasificacion}</option>
                                ))}
                            </select>
                            {errors.clasificacion && (
                                <div className='alert alert-danger'>{errors.clasificacion.message}</div>
                            )}
                        </div>
                    </div>


                    <div className="col-md-6">
                        <div className="form-group">
                            <label className='titulo-campos'><strong style={{ color: 'red' }}>* </strong>Datos de entrada</label>
                            <textarea
                                className="form-control"
                                {...register('datos_entrada', {
                                    required: 'Los datos de entrada son obligatorios',
                                    maxLength: {
                                        value: 350,
                                        message: 'Los datos de entrada no pueden tener más de 100 caracteres'
                                    }
                                })}
                            />
                            {errors.datos_entrada && (
                                <div className='alert alert-danger'>{errors.datos_entrada.message}</div>
                            )}
                        </div>
                    </div>

                    <div className="col-md-12">
                        <div className="form-group">
                            <label className='titulo-campos'><strong style={{ color: 'red' }}>* </strong>Precondiciones</label>
                            <textarea
                                className="form-control"
                                {...register('precondiciones', {
                                    required: 'Las precondiciones son obligatorias',
                                    maxLength: {
                                        value: 350,
                                        message: 'Las precondiciones no pueden tener más de 150 caracteres'
                                    }
                                })}
                            />
                            {errors.precondiciones && (
                                <div className='alert alert-danger'>{errors.precondiciones.message}</div>
                            )}
                        </div>
                    </div>

                    <div className="col-md-12">
                        <div className="form-group">
                            <label className='titulo-campos'><strong style={{ color: 'red' }}>* </strong>Descripción</label>
                            <textarea
                                className="form-control"
                                {...register('descripcion', {
                                    required: 'La descripción es obligatoria',
                                    maxLength: {
                                        value: 350,
                                        message: 'La descripción no puede tener más de 150 caracteres'
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
                            <label className='titulo-campos'><strong style={{ color: 'red' }}>* </strong>Pasos</label>
                            <textarea
                                className="form-control"
                                {...register('pasos', { required: true })}
                            />
                            {errors.pasos && (
                                <div className='alert alert-danger'>Ingrese los pasos del caso de prueba</div>
                            )}
                        </div>
                    </div>

                    <div className="col-md-12">
                        <div className="form-group">
                            <label className='titulo-campos'><strong style={{ color: 'red' }}>* </strong>Resultado Esperado</label>
                            <textarea
                                className="form-control"
                                {...register('resultado_esperado', {
                                    required: 'El resultado esperado es obligatorio',
                                    maxLength: {
                                        value: 350,
                                        message: 'El resultado esperado no puede tener más de 255 caracteres'
                                    }
                                })}
                            />
                            {errors.resultado_esperado && (
                                <div className='alert alert-danger'>{errors.resultado_esperado.message}</div>
                            )}
                        </div>
                    </div>

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

export default CasoPrueba;