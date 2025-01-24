import React, { useEffect, useState, useMemo } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { peticionGet, URLBASE } from '../utilities/hooks/Conexion';
import { useParams, useNavigate } from 'react-router-dom';
import '../css/style.css';
import mensajes from '../utilities/Mensajes';
import { getToken, getUser } from '../utilities/Sessionutil';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faCheckCircle, faExclamationTriangle, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { Alert, Button } from 'react-bootstrap';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import Reasignar from './Reasginar';
import EstadoDropdown from './EstadoDropdown';
import RegistrarCorreccion from './RegistroCorreccion';
import EvaluarCorreccion from './EvaluarCorreccion';

const VerError = () => {
    const [dataErrror, setDataErrror] = useState({});
    const [contrato, setContrato] = useState({});
    const { external_id_proyecto, external_id, external_id_error } = useParams();
    const [infoProyecto, setProyecto] = useState([]);
    const navigate = useNavigate();
    const [showModalDesarrollador, setShowModalDesarrollador] = useState(false);
    const [showModalRegistrar, setShowModalRegistrar] = useState(false);
    const [showModalEvaluar, setShowModalEvaluar] = useState(false);
    const usuario = getUser();
    const [idError, setIdError] = useState(null);
    const [rol, setRol] = useState([]);

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
                const response = await peticionGet(getToken(), `error/obtener/external/${getUser().user.id}?external_id=${external_id_error}`);
                if (response.code === 200) {
                    setDataErrror(response.info.errorEncontrado);
                    setContrato(response.info.data);
                    setRol(response.info.roles);
                } else {
                    mensajes(`${response.msg}`, 'error');
                }
            } catch (error) {
                mensajes('Error al procesar la solicitud', 'error', 'Error');
                console.error(error);
            }
        };
        fetchCasoPrueba();
    }, [external_id_proyecto, external_id_error, dataErrror.id]);

    const handleEstadoChange = (estado) => {
        setDataErrror((prev) => ({
            ...prev,
            estado,  // Actualiza el estado del error en el componente
        }));
    };

    const formatDate = (dateString) => new Date(dateString).toISOString().slice(0, 10);

    const isDatePassed = (endDate) => {
        const today = new Date().toISOString().slice(0, 10);
        return new Date(endDate) < new Date(today);
    };

    const isButtonEnabled = () => {
        const today = new Date().toISOString().slice(0, 10);
        return new Date(contrato?.fecha_inicio) <= new Date(today);
    };

    const isCerrado = dataErrror.estado === 'CERRADO';

    return (
        <div className="container-fluid contenedor-centro" style={{ margin: '20px' }}>
            <div className="contenedor-carta">
                <p className="titulo-proyecto">{infoProyecto.nombre}</p>
                <div className="d-flex align-items-center mb-3">
                    <FontAwesomeIcon
                        icon={faArrowLeft}
                        onClick={() => navigate(-1)}
                        style={{ cursor: 'pointer', fontSize: '20px', marginRight: '10px', color: 'var(--color-cuarto)' }}
                    />
                    <h4 className="titulo-primario">Error: {dataErrror?.titulo || 'No disponible'}</h4>
                </div>

                {/* Mensaje de Error Cerrado */}
                {isCerrado && (
                    <Alert variant="success" className="mb-4">
                        <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                        Este error fue cerrado por el tester: <strong>{contrato?.persona_que_asigno}</strong>.
                    </Alert>
                )}

                {/* Advertencia de devolución */}
                {dataErrror.fecha_devolucion && dataErrror.motivo_devolucion && (
                    <Alert variant="warning" className="mb-4">
                        <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                        Este error fue devuelto el <strong>{formatDate(dataErrror.fecha_devolucion)}</strong> con el motivo:
                        <br />
                        <em>"{dataErrror.motivo_devolucion}"</em>
                    </Alert>
                )}

                <div className="row mt-4">
                    <div className="col-12 mb-4">
                        <div className="card p-3 shadow-sm card-custom-bord">
                            <h5 className="titulo-secundario" style={{ textAlign: 'left' }}>Descripción</h5>
                            <p className="w-100 text-start texto-normal">{dataErrror?.descripcion || 'No disponible'}</p>
                        </div>
                    </div>

                    <div className="col-6 mb-4">
                        <div className="card p-3 shadow-sm card-custom-bord">
                            <h5 className="titulo-secundario" style={{ textAlign: 'left' }}>Caso de prueba</h5>
                            <p className="w-100 text-start texto-normal">{dataErrror?.caso_prueba?.nombre || 'No disponible'}</p>
                        </div>
                    </div>
                    <div className="col-6 mb-4">
                        <div className="card p-3 shadow-sm card-custom-bord justify-content-start">
                            <h5 className="titulo-secundario" style={{ textAlign: 'left' }}>Funcionalidad</h5>
                            <ul className="w-100 text-start texto-normal" style={{ listStyleType: 'disc', paddingLeft: '20px' }}>
                                <span className="fw-bold" style={{ fontSize: '18px' }}>{dataErrror?.caso_prueba?.funcionalidad?.nombre || "No disponible"}</span>
                                <li><strong>Tipo:</strong> {dataErrror?.caso_prueba?.funcionalidad?.tipo || "No disponible"}</li>
                                <li><strong>Descripción:</strong> {dataErrror?.caso_prueba?.funcionalidad?.descripcion || "No disponible"}</li>
                            </ul>
                        </div>
                    </div>

                    <div className="col-md-6 mb-4">
                        <div className="card p-3 shadow-sm card-custom-bord">
                            <h5 className="titulo-secundario mb-3" style={{ textAlign: 'initial' }}>Detalles del error</h5>
                            {/* Contenedor principal con flex-row para alinear los elementos en fila */}
                            <div className="d-flex flex-row justify-content-between align-items-center gap-4">
                                {/* Estado */}
                                <div className="d-flex flex-column align-items-center">
                                    <p className="mb-1">
                                        <span className="fw-bold">Estado</span>
                                    </p>
                                    <span
                                        className={`badge ${dataErrror?.estado === 'NUEVO'
                                            ? 'bg-primary'
                                            : dataErrror?.estado === 'CERRADO'
                                                ? 'bg-success'
                                                : dataErrror?.estado === 'PENDIENTE_VALIDACION'
                                                    ? 'bg-warning'
                                                    : dataErrror?.estado === 'CORRECCION'
                                                        ? 'bg-info'
                                                        : dataErrror?.estado === 'DEVUELTO'
                                                            ? 'bg-danger'
                                                            : 'bg-secondary'
                                            }`}
                                        style={{ fontSize: '1rem', padding: '0.5rem' }}
                                    >
                                        {dataErrror?.estado === 'NUEVO'
                                            ? 'NUEVO'
                                            : dataErrror?.estado === 'CERRADO'
                                                ? 'CERRADO'
                                                : dataErrror?.estado === 'PENDIENTE_VALIDACION'
                                                    ? 'PENDIENTE DE VALIDACIÓN'
                                                    : dataErrror?.estado === 'CORRECCION'
                                                        ? 'EN CORRECCIÓN'
                                                        : dataErrror?.estado === 'DEVUELTO'
                                                            ? 'DEVUELTO'
                                                            : 'NO DISPONIBLE'}
                                    </span>
                                </div>

                                {/* Severidad */}
                                <div className="d-flex flex-column align-items-center">
                                    <p className="mb-1">
                                        <strong>
                                            Severidad
                                            <OverlayTrigger
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
                                                                    <td>CRÍTICA</td>
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
                                            </OverlayTrigger>
                                        </strong>
                                    </p>
                                    <span
                                        className={`badge ${dataErrror?.severidad === 'MEDIA' ? 'bg-warning' :
                                            dataErrror?.severidad === 'BAJA' ? 'bg-success' :
                                                dataErrror?.severidad === 'CRÍTICA' ? 'bg-danger' :
                                                    'bg-secondary'}`}
                                    >
                                        {dataErrror?.severidad || 'No disponible'}
                                    </span>
                                </div>

                                {/* Prioridad */}
                                <div className="d-flex flex-column align-items-center">
                                    <p className="mb-1">
                                        <strong>
                                            Prioridad
                                            <OverlayTrigger
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
                                            </OverlayTrigger>
                                        </strong>
                                    </p>
                                    <span
                                        className={`badge ${dataErrror?.prioridad === 'ALTA' ? 'bg-danger' :
                                            dataErrror?.prioridad === 'MEDIA' ? 'bg-warning' :
                                                dataErrror?.prioridad === 'BAJA' ? 'bg-success' :
                                                    'bg-secondary'}`}
                                    >
                                        {dataErrror?.prioridad || 'No disponible'}
                                    </span>
                                </div>

                                {/* Ciclo del Error */}
                                <div className="d-flex flex-column align-items-center">
                                    <p className="mb-1">
                                        <span className="fw-bold">Ciclo del Error</span>
                                    </p>
                                    <span className="badge bg-info">{dataErrror?.ciclo_error || 1}</span>
                                </div>
                            </div>
                        </div>
                    </div>


                    <div className="col-md-6 mb-4">
                        <div className="card p-3 shadow-sm card-custom-bord ">
                            <h5 className="titulo-secundario" style={{ textAlign: 'initial' }}>Fechas de Asignación</h5>
                            <div className="mb-2">
                                <strong>Fecha de reporte del error: </strong>
                                {dataErrror?.fecha_reporte ? formatDate(dataErrror.fecha_reporte) : 'No disponible'}
                            </div>
                            <div className="mb-2">
                                <strong>Fecha de asignación al desarrollador: </strong>
                                {contrato?.fecha_inicio ? formatDate(contrato.fecha_inicio) : 'Sin fecha de asignación'}
                            </div>
                            <div className="mb-2">
                                <strong>Fecha de finalización de asignación: </strong>
                                {contrato?.fecha_fin ? (
                                    <span
                                        className={`badge ${isDatePassed(contrato?.fecha_fin) ? 'bg-danger text-light' : 'bg-success text-light'}`}
                                        style={{
                                            fontSize: '0.9rem',
                                            padding: '0.3rem 0.5rem',
                                        }}
                                    >
                                        {`${formatDate(contrato.fecha_fin)} ${isDatePassed(contrato?.fecha_fin) ? '- Corrección atrasada' : ''}`}
                                    </span>
                                ) : (
                                    <span className="badge bg-secondary text-light" style={{ fontSize: '0.9rem', padding: '0.3rem 0.5rem' }}>
                                        Sin fecha de asignación
                                    </span>
                                )}
                            </div>

                            <div className="mb-2">
                                <strong>Fecha de resolución: </strong>
                                {dataErrror?.fecha_resolucion ? (
                                    <span
                                        className={`badge ${new Date(dataErrror.fecha_resolucion) > new Date(contrato?.fecha_fin)
                                                ? 'bg-danger text-light'
                                                : 'bg-success text-light'
                                            }`}
                                        style={{
                                            fontSize: '0.9rem',
                                            padding: '0.3rem 0.5rem',
                                        }}
                                    >
                                        {`${formatDate(dataErrror.fecha_resolucion)} ${new Date(dataErrror.fecha_resolucion) > new Date(contrato?.fecha_fin) ? '- Resolución atrasada' : ''
                                            }`}
                                    </span>
                                ) : (
                                    <span className="badge bg-secondary text-light" style={{ fontSize: '0.9rem', padding: '0.3rem 0.5rem' }}>
                                        No disponible
                                    </span>
                                )}
                            </div>


                        </div>
                    </div>

                    <div className="col-12 mb-4">
                        <div className="card p-3 shadow-sm card-custom-bord">
                            <h5 className="titulo-secundario" style={{ textAlign: 'left' }}>Pasos a reproducir</h5>
                            <p className="texto-normal" style={{ textAlign: 'justify' }} dangerouslySetInnerHTML={{ __html: dataErrror?.pasos_repetir?.replace(/\n/g, '<br />') || 'No disponible' }} />
                        </div>
                    </div>

                    <div className="col-6 mb-4">
                        <div className="card p-3 shadow-sm card-custom-bord ">
                            <h5 className="titulo-secundario" style={{ textAlign: 'initial' }}>Personal responsable</h5>
                            <div className="mb-2">
                                <strong>Asignado a: </strong>
                                {contrato?.persona_asignada || 'Sin responsable asignado'}
                            </div>
                            <div className="mb-2">
                                <strong>Asignado por: </strong>
                                {contrato?.persona_que_asigno || 'No existe registro de persona que asigno'}
                            </div>
                        </div>
                    </div>

                    <div className="col-6 mb-4">
                        <div className="card p-3 shadow-sm card-custom-bord">
                            <h5 className="titulo-secundario" style={{ textAlign: 'left' }}>Resultado obtenido</h5>
                            <p className="texto-normal" style={{ textAlign: 'justify' }} dangerouslySetInnerHTML={{ __html: dataErrror?.resultado_obtenido?.replace(/\n/g, '<br />') || 'No disponible' }} />
                        </div>
                    </div>

                    <div className="col-12 mb-4">
                        <div className="card p-3 shadow-sm card-custom-bord ">
                            <h5 className="titulo-secundario" style={{ textAlign: 'initial' }}>Anexo</h5>
                            <div className="mb-2">
                                <img
                                    src={dataErrror.anexo_foto ? `${URLBASE}images/errors/${dataErrror.anexo_foto}` : `${URLBASE}images/errors/SIN_ANEXO.png`}
                                    alt="Vista previa"
                                    className="img-fluid"
                                    style={{ maxWidth: '100%' }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {!isCerrado && (
                    <div className='contenedor-filo'>
                        <Button variant="btn btn-outline-info btn-rounded" onClick={() => navigate(`/error/editar/${external_id_proyecto}/${external_id}/${external_id_error}`)} >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil-square" viewBox="0 0 16 16">
                                <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                                <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z" />
                            </svg>
                        </Button>

                        {/* Botones de acción */}

                        {rol.includes("tester") && (
                            <Button
                                variant="btn btn-outline-success btn-rounded"
                                onClick={() => {
                                    setIdError(dataErrror.id);
                                    setShowModalDesarrollador(true);
                                }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-person-gear" viewBox="0 0 16 16" style={{ marginRight: '5px' }}>
                                    <path d="M11 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0M8 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4m.256 7a4.5 4.5 0 0 1-.229-1.004H3c.001-.246.154-.986.832-1.664C4.484 10.68 5.711 10 8 10q.39 0 .74.025c.226-.341.496-.65.804-.918Q8.844 9.002 8 9c-5 0-6 3-6 4s1 1 1 1zm3.63-4.54c.18-.613 1.048-.613 1.229 0l.043.148a.64.64 0 0 0 .921.382l.136-.074c.561-.306 1.175.308.87.869l-.075.136a.64.64 0 0 0 .382.92l.149.045c.612.18.612 1.048 0 1.229l-.15.043a.64.64 0 0 0-.38.921l.074.136c.305.561-.309 1.175-.87.87l-.136-.075a.64.64 0 0 0-.92.382l-.045.149c-.18.612-1.048.612-1.229 0l-.043-.15a.64.64 0 0 0-.921-.38l-.136.074c-.561.305-1.175-.309-.87-.87l.075-.136a.64.64 0 0 0-.382-.92l-.148-.045c-.613-.18-.613-1.048 0-1.229l.148-.043a.64.64 0 0 0 .382-.921l-.074-.136c-.306-.561.308-1.175.869-.87l.136.075a.64.64 0 0 0 .92-.382zM14 12.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0" />
                                </svg>

                                Reasignar
                            </Button>
                        )}

                        {rol.includes("tester") && dataErrror.estado === 'PENDIENTE_VALIDACION' && (
                            <Button
                                variant="btn btn-opcional-secundario"
                                onClick={() => setShowModalEvaluar(true)}
                            >

                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-square-fill" viewBox="0 0 16 16" style={{ marginRight: '5px' }}>
                                    <path d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm10.03 4.97a.75.75 0 0 1 .011 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.75.75 0 0 1 1.08-.022z" />
                                </svg>
                                Evaluar Corrección
                            </Button>
                        )}

                        {(rol.includes("desarrollador") && (dataErrror.estado === 'CORRECCION' || dataErrror.estado === 'DEVUELTO')) && (
                            <Button
                                variant="btn btn-opcional"
                                onClick={() => setShowModalRegistrar(true)}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-clipboard-check-fill" viewBox="0 0 16 16" style={{ marginRight: '5px' }}>
                                    <path d="M6.5 0A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0zm3 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5z" />
                                    <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1A2.5 2.5 0 0 1 9.5 5h-3A2.5 2.5 0 0 1 4 2.5zm6.854 7.354-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 0 1 .708-.708L7.5 10.793l2.646-2.647a.5.5 0 0 1 .708.708" />
                                </svg>
                                Registrar Corrección
                            </Button>
                        )}


                    </div>
                )}
            </div>

            {showModalDesarrollador && (
                <Reasignar
                    showModalDesarrollador={showModalDesarrollador}
                    setShowModalDesarrollador={setShowModalDesarrollador}
                    external_id_proyecto={external_id_proyecto}
                    usuario={usuario}
                    id_error={idError}
                />
            )}

            {showModalRegistrar && (
                <RegistrarCorreccion
                    showModalRegistrar={showModalRegistrar}
                    setShowModalRegistrar={setShowModalRegistrar}
                    external_id_error={external_id_error}
                />
            )}

            {showModalEvaluar && (
                <EvaluarCorreccion
                    showModalEvaluar={showModalEvaluar}
                    setShowModalEvaluar={setShowModalEvaluar}
                    external_id_error={external_id_error}
                />
            )}
        </div>
    );
};

export default VerError;