import 'bootstrap/dist/css/bootstrap.min.css';
import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import mensajes from '../utilities/Mensajes';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCheck } from '@fortawesome/free-solid-svg-icons';
import { getToken, borrarSesion } from '../utilities/Sessionutil';
import { ActualizarImagenes, GuardarImages } from '../utilities/hooks/Conexion';
import swal from 'sweetalert';

const EditarPersona = ({ personaObtenida, handleChange }) => {
    const { register, handleSubmit, formState: { errors }, setValue } = useForm();
    const navegation = useNavigate();
    const navigate = useNavigate();
    const [file, setFile] = useState(null);

    const selectedHandler = e => {
        setFile(e.target.files[0]);
    };

    const onSubmit = async (data) => {
        const formData = new FormData();
        formData.append('nombres', data.nombres);
        formData.append('apellidos', data.apellidos);
        formData.append('fecha_nacimiento', data.fecha_nacimiento);
        formData.append('telefono', data.telefono);
        formData.append('estado', data.estado);
        formData.append('external_id', personaObtenida.external_id);
        formData.append('entidad_id', personaObtenida.id);

        if (file) {
            formData.append('foto', file);
        } else {
            formData.append('foto_actual', personaObtenida.foto);
        }

        ActualizarImagenes(formData, getToken(), "/modificar/entidad").then((info) => {
            if (!info || info.code !== 200) {
                mensajes(info?.msg || 'Error desconocido', 'error', 'Error');
                if (info?.msg === "TOKEN NO VALIDO O EXPIRADO") {
                    borrarSesion();
                }
            } else {
                navegation('/actualizar');
                mensajes(info.msg);
            }
        }).catch(error => {
            console.error('Error en la solicitud:', error);
            mensajes('Error en la conexión con el servidor', 'error', 'Error');
        });

    }

    useEffect(() => {
        console.log("aqui", personaObtenida);
        setValue('nombres', personaObtenida.nombres);
        setValue('apellidos', personaObtenida.apellidos);
        setValue('fecha_nacimiento', personaObtenida.fecha_nacimiento);
        setValue('telefono', personaObtenida.telefono);
        setValue('estado', personaObtenida.estado);
    }, [personaObtenida, setValue]);

    const handleCancelClick = () => {
        swal({
            title: "¿Está seguro de cancelar la actualización de datos?",
            text: "Una vez cancelado, no podrá revertir esta acción",
            icon: "warning",
            buttons: ["No", "Sí"],
            dangerMode: true,
        }).then((willCancel) => {
            if (willCancel) {
                mensajes("Actualización cancelada", "info", "Información");
                navigate('/actualizar');
            }
        });
    };

    return (
        <div className="contenedor-carta">
            <div className="row">
                <div className="col-12">
                    <form className="form-sample" onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
                        <p className="card-description" style={{ fontWeight: 'bold' }}>Datos informativos</p>
                        <div className="row">
                            {/** INGRESAR NOMBRES */}
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label>Nombres</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        defaultValue={personaObtenida.nombres} onChange={handleChange}
                                        {...register('nombres', { required: true })}
                                    />
                                    {errors.nombres && errors.nombres.type === 'required' && (
                                        <div className='alert alert-danger'>Ingrese los nombres</div>
                                    )}
                                </div>
                            </div>
                            {/** INGRESAR APELLIDOS */}
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label>Apellidos</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        defaultValue={personaObtenida.apellidos} onChange={handleChange}
                                        {...register('apellidos', { required: true })}
                                    />
                                    {errors.apellidos && errors.apellidos.type === 'required' && (
                                        <div className='alert alert-danger'>Ingrese los apellidos</div>
                                    )}
                                </div>
                            </div>

                            {/** INGRESAR NUMERO DE TELEFONO*/}
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label>Número telefónico</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Ingrese su número telefónico"
                                        defaultValue={personaObtenida.telefono} onChange={handleChange}
                                        {...register('telefono', { required: true })}
                                    />
                                    {errors.ntelefono && errors.ntelefono.type === 'required' && (
                                        <div className='alert alert-danger'>Ingrese un número telefónico</div>
                                    )}
                                </div>
                            </div>
                            {/** ESCOGER FOTO */}
                            <div className="col-md-6">
                                <div className="form-data">
                                    <label>Foto</label>
                                    <input
                                        type="file"
                                        className="form-control"
                                        placeholder="Seleccionar una Foto"
                                        onChange={selectedHandler}
                                    />
                                </div>
                            </div>
                            {/** CAMBIAR ESTADO */}
                            <div className="col-md-12">
                                <div className="form-group">
                                    <label>Estado</label>
                                    <div className="form-check">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            defaultChecked={personaObtenida.estado}
                                            {...register('estado')}
                                        />
                                        <label className="form-check-label">{personaObtenida.estado ? "Seleccione para Desactivar Cuenta" : "Seleccione para Activar Cuenta"}</label>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-12" style={{ marginBottom: '10px' }}></div>
                        </div>
                        <div className="contenedor-filo">
                            <button type="button" onClick={() => { handleCancelClick() }} className="btn-negativo">
                                <FontAwesomeIcon icon={faTimes} /> Cancelar
                            </button>

                            <button className="btn-positivo" type="submit">
                                <FontAwesomeIcon icon={faCheck} /> Registrar</button>
                        </div>

                    </form>

                </div>
            </div>
        </div>
    );
};

export default EditarPersona;
