import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { peticionGet } from '../utilities/hooks/Conexion';
import { useParams, useNavigate } from 'react-router-dom';
import '../css/style.css';
import mensajes from '../utilities/Mensajes';
import { getToken } from '../utilities/Sessionutil';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const VerError = () => {
    const [dataErrror, setDataErrror] = useState({});
    const { external_id_proyecto, external_id, external_id_error } = useParams();
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
                const response = await peticionGet(getToken(), `error/obtener/external?external_id=${external_id_error}`);
                if (response.code === 200) {
                    setDataErrror(response.info);
                } else {
                    mensajes(`Error al obtener error: ${response.msg}`, 'error');
                }
            } catch (error) {
                mensajes('Error al procesar la solicitud', 'error');
            }
        };

        fetchCasoPrueba();
    }, []);

    console.log('lol', dataErrror);
    const formatDate = (dateString) => new Date(dateString).toISOString().slice(0, 10);

    return (
        <div className="container-fluid contenedor-centro" style={{ margin: '20px' }}>
            <div className="contenedor-carta">
                <p className="titulo-proyecto">  Proyecto "{infoProyecto.nombre}"</p>
                <div className="d-flex align-items-center mb-3">
                    <FontAwesomeIcon
                        icon={faArrowLeft}
                        onClick={() => navigate(`/caso-prueba/${external_id_proyecto}/${external_id}`, { replace: true })}
                        style={{ cursor: 'pointer', fontSize: '20px', marginRight: '10px', color: 'var(--color-cuarto)' }}
                    />
                    <h4 className="titulo-primario">Error: {dataErrror?.titulo || 'No disponible'}</h4>
                </div>

                <div className="row mt-4">
                    <div className="col-6 mb-4">
                        <div className="card p-3 shadow-sm card-custom-bord">
                            <h5 className="titulo-secundario" style={{ textAlign: 'left' }}>Razón</h5>
                            <p className="texto-normal" style={{ textAlign: 'justify' }} dangerouslySetInnerHTML={{ __html: dataErrror?.razon?.replace(/\n/g, '<br />') || 'No disponible' }} />
                        </div>
                    </div>
                    <div className="col-6 mb-4">
                        <div className="card p-3 shadow-sm card-custom-bord">
                            <h5 className="titulo-secundario" style={{ textAlign: 'left' }}>Pasos a reproducir</h5>
                            <p className="texto-normal" style={{ textAlign: 'justify' }} dangerouslySetInnerHTML={{ __html: dataErrror?.pasos_reproducir?.replace(/\n/g, '<br />') || 'No disponible' }} />
                        </div>
                    </div>

                    <div className="col-md-6 mb-4">
                        <div className="card p-3 shadow-sm card-custom-bord ">
                            <h5 className="titulo-secundario mb-3" style={{ textAlign: 'initial' }}>Detalles del Caso</h5>
                            <div className="d-flex justify-content-around align-items-center flex-wrap gap-2">
                                <div className="d-flex flex-column align-items-center">
                                    <strong>Estado</strong>
                                    <span className={`badge ${dataErrror?.estado === 'PENDIENTE' ? 'bg-warning' : dataErrror?.estado === 'RESUELTO' ? 'bg-success' :
                                        dataErrror?.estado === 'NO_REPUDIO' ? 'bg-danger' : dataErrror?.estado === 'EN_PROCESO' ? 'bg-info' : 'bg-secondary'}`}>
                                        {dataErrror?.estado || 'No disponible'}
                                    </span>

                                </div>
                                <div className="d-flex flex-column align-items-center">
                                    <strong>Severidad</strong>
                                    <span
                                        className={`badge ${dataErrror?.severidad === 'ALTA' ? 'bg-danger' :
                                                dataErrror?.severidad === 'CRITICO' ? 'bg-dark' :
                                                    dataErrror?.severidad === 'MEDIA' ? 'bg-warning' :
                                                        dataErrror?.severidad === 'BAJA' ? 'bg-success' :
                                                            'bg-secondary'
                                            }`}
                                    >
                                        {dataErrror?.severidad || 'No disponible'}
                                    </span>
                                </div>
                                <div className="d-flex flex-column align-items-center">
                                    <strong>Funcionalidad</strong>
                                    <p className="texto-normal" style={{ textAlign: 'justify' }} dangerouslySetInnerHTML={{ __html: dataErrror?.funcionalidad?.replace(/\n/g, '<br />') || 'No disponible' }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-6 mb-4">
                        <div className="card p-3 shadow-sm card-custom-bord ">
                            <h5 className="titulo-secundario" style={{ textAlign: 'initial' }}>Fechas de Asignación</h5>
                            <div className="mb-2">
                                <strong>Fecha de reporte: </strong>
                                {dataErrror?.fecha_reporte ? formatDate(dataErrror.fecha_reporte) : 'No disponible'}
                            </div>
                            <div className="mb-2">
                                <strong>Fecha de resolucion: </strong>
                                {dataErrror?.fecha_resolucion ? formatDate(dataErrror.fecha_resolucion) : 'No disponible'}
                            </div>
                        </div>
                    </div>

                    <div className="col-12 mb-4">
                        <div className="card p-3 shadow-sm card-custom-bord ">
                            <h5 className="titulo-secundario" style={{ textAlign: 'initial' }}>Personas Involucradas</h5>
                            <div className="mb-2">
                                <strong>Asignado por: </strong>
                                {dataErrror?.persona_que_asigno || 'No disponible'}
                            </div>
                            <div className="mb-2">
                                <strong>Asignado a: </strong>
                                {dataErrror?.persona_asignada || 'No disponible'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerError;