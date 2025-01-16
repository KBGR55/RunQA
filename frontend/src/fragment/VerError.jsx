import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { peticionGet, URLBASE } from '../utilities/hooks/Conexion';
import { useParams, useNavigate } from 'react-router-dom';
import '../css/style.css';
import mensajes from '../utilities/Mensajes';
import { getToken } from '../utilities/Sessionutil';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { Button } from 'react-bootstrap';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

const VerError = () => {
    const [dataErrror, setDataErrror] = useState({});
    const [contrato, setContrato] = useState({});
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
                    setDataErrror(response.info.errorEncontrado);
setContrato(response.info.data);
                } else {
                    mensajes(`Error al obtener error: ${response.msg}`, 'error');
                }
            } catch (error) {
                mensajes('Error al procesar la solicitud', 'error');
            }
        };

        fetchCasoPrueba();
    }, []);

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
                            <h5 className="titulo-secundario" style={{ textAlign: 'left' }}>Resultado obtenido</h5>
                            <p className="texto-normal" style={{ textAlign: 'justify' }} dangerouslySetInnerHTML={{ __html: dataErrror?.resultado_obtenido?.replace(/\n/g, '<br />') || 'No disponible' }} />
                        </div>
                    </div>
                    <div className="col-6 mb-4">
                        <div className="card p-3 shadow-sm card-custom-bord">
                            <h5 className="titulo-secundario" style={{ textAlign: 'left' }}>Pasos a reproducir</h5>
                            <p className="texto-normal" style={{ textAlign: 'justify' }} dangerouslySetInnerHTML={{ __html: dataErrror?.pasos_repetir?.replace(/\n/g, '<br />') || 'No disponible' }} />
                        </div>
                    </div>

                    <div className="col-md-6 mb-4">
                        <div className="card p-3 shadow-sm card-custom-bord ">
                            <h5 className="titulo-secundario mb-3" style={{ textAlign: 'initial' }}>Detalles del Caso</h5>
                            <div className="d-flex justify-content-around align-items-center flex-wrap gap-2">
                                <div className="d-flex flex-column align-items-center">
                                    <strong>Estado</strong>
                                    <span className={`badge ${dataErrror?.estado === 'NUEVO' ? 'bg-primary' :
                                        dataErrror?.estado === 'CERRADO' ? 'bg-secondary' :
                                            dataErrror?.estado === 'PENDIENTE_VALIDACION' ? 'bg-warning' :
                                                dataErrror?.estado === 'CORRECCION' ? 'bg-danger' :
                                                    'bg-secondary'}`}>
                                        {dataErrror?.estado || 'No disponible'}
                                    </span>
                                </div>
                                <div className="d-flex flex-column align-items-center">
                                    <strong>Severidad   <OverlayTrigger
                                        placement="top"
                                        overlay={
                                            <Tooltip className="custom-tooltip"> Indica la gravedad del problema detectado
                                                <table className="table table-bordered text-start m-0">
                                                    <thead>
                                                        <tr>
                                                            <th>Valor</th>
                                                            <th>Significado</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td>CRITICO</td>
                                                            <td>Compromete el sistema completo, urgente.</td>
                                                        </tr>
                                                        <tr>
                                                            <td>MEDIA</td>
                                                            <td>Afecta funciones secundarias, no crítico.</td>
                                                        </tr>
                                                        <tr>
                                                            <td>BAJA</td>
                                                            <td>Problema menor, plazo extendido para resolución.</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </Tooltip>
                                        }
                                    >
                                        <FontAwesomeIcon icon={faQuestionCircle} className="ms-2 text-info" />
                                    </OverlayTrigger></strong>
                                    <span className={`badge ${dataErrror?.severidad === 'MEDIA' ? 'bg-warning' :
                                        dataErrror?.severidad === 'BAJA' ? 'bg-success' :
                                            dataErrror?.severidad === 'CRITICO' ? 'bg-dark' :
                                                'bg-secondary'}`}>
                                        {dataErrror?.severidad || 'No disponible'}
                                    </span>
                                </div>
                                <div className="d-flex flex-column align-items-center">
                                    <strong>Prioridad    <OverlayTrigger
                                        placement="top"
                                        overlay={
                                            <Tooltip className="custom-tooltip"> Determina el orden en el que debe resolverse
                                                <table className="table table-bordered text-start m-0">
                                                    <thead>
                                                        <tr>
                                                            <th>Valor</th>
                                                            <th>Significado</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td>ALTA</td>
                                                            <td>Debe resolverse primero, afecta operaciones clave.</td>
                                                        </tr>
                                                        <tr>
                                                            <td>MEDIA</td>
                                                            <td>Intermedio en prioridad, no afecta funciones críticas.</td>
                                                        </tr>
                                                        <tr>
                                                            <td>BAJA</td>
                                                            <td>Puede resolverse en un plazo extendido.</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </Tooltip>
                                        }
                                    >
                                        <FontAwesomeIcon icon={faQuestionCircle} className="ms-2 text-info" />
                                    </OverlayTrigger></strong>
                                    <span className={`badge ${dataErrror?.prioridad === 'ALTA' ? 'bg-danger' :
                                        dataErrror?.prioridad === 'MEDIA' ? 'bg-warning' :
                                            dataErrror?.prioridad === 'BAJA' ? 'bg-success' :
                                                'bg-secondary'}`}>
                                        {dataErrror?.prioridad || 'No disponible'}
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
                            <h5 className="titulo-secundario" style={{ textAlign: 'initial' }}>Persona responsable</h5>
                            <div className="mb-2">
                                <strong>Asignado a: </strong>
                                {contrato?.responsable || 'No disponible'}
                            </div>
                        </div>
                    </div>
                    <div className="col-12 mb-4">
                        <div className="card p-3 shadow-sm card-custom-bord ">
                            <h5 className="titulo-secundario" style={{ textAlign: 'initial' }}>Anexo</h5>
                            <div className="mb-2">
                                <img
                                  src={dataErrror.anexo_foto? `${URLBASE}images/errors/${dataErrror.anexo_foto}` : `${URLBASE}images/errors/SIN_ANEXO.png`}
                                    alt="Vista previa"
                                    className="img-fluid"
                                    style={{ maxWidth: '100%' }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className='contenedor-filo'>
                    <Button variant="btn btn-outline-info btn-rounded" onClick={() => navigate(`/error/editar/${external_id_proyecto}/${external_id}/${external_id_error}`)} >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil-square" viewBox="0 0 16 16">
                            <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                            <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z" />
                        </svg>
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default VerError;