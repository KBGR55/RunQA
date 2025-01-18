import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { Button, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationCircle, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import CasoPrueba from './CasoPrueba';
import { peticionGet } from '../utilities/hooks/Conexion';
import { useNavigate, useParams } from 'react-router-dom';
import '../css/style.css';
import mensajes from '../utilities/Mensajes';
import { getToken, getUser } from '../utilities/Sessionutil';
import { useForm } from 'react-hook-form';
import swal from 'sweetalert';
import EjecutarCasoPrueba from './EjecutarCasoPrueba';
import TablePagination from '@mui/material/TablePagination';

const VerCasoPrueba = () => {
    const [casosPrueba, setCasosPrueba] = useState({});
    const [infoAsignado, setInfoAsignado] = useState({});
    const { external_id_proyecto, external_id } = useParams();
    const [rol, setRol] = useState('false');
    const [infoProyecto, setProyecto] = useState([]);
    const { setValue } = useForm();
    const navigate = useNavigate();
    const [shoModal, setshoModal] = useState(false);
    const [errores, setErrores] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const handleNavigateToDetail = (external_id_error) => {
        navigate(`/error/visualizar/${external_id_proyecto}/${external_id}/${external_id_error}`);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    const handleshoModal = () => {
        setshoModal(true);
    };

    const handleAddError = () => {
        navigate(`/error/${external_id_proyecto}/${external_id}`);
    };


    const handleCloseModal = () => {
        setshoModal(false);
    };
    const getEstadoClass = (estado) => {
        switch (estado) {
            case 'DISEÑADO':
                return 'bg-secondary';
            case 'REVISADO':
                return 'bg-primary';
            case 'PENDIENTE':
                return 'bg-warning';
            case 'EN PROGRESO':
                return 'bg-info';
            case 'BLOQUEADO':
                return 'bg-danger';
            case 'DUPLICADO':
                return 'bg-secondary';
            case 'OBSOLETO':
                return 'bg-dark';
            case 'NO APLICABLE':
                return 'bg-light';
            case 'FALLIDO':
                return 'bg-danger';
            case 'EXITOSO':
                return 'bg-success';
            case 'CERRADO':
                return 'bg-success';
            case 'REABIERTO':
                return 'bg-warning';
            default:
                return 'bg-secondary';
        }
    };


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
                const response = await peticionGet(getToken(), `caso/prueba/obtener/${getUser().user.id}?external_id=${external_id}`);
                if (response.code === 200) {
                    const casoPruebaData = response.info.caso;
                    if (response.info.rol) {
                        setRol(response.info.rol);
                    }

                    setCasosPrueba(casoPruebaData);
                    peticionGet(getToken(), `error/obtener?external_caso_prueba=${external_id}`).then((info) => {
                        if (info.code === 200) {
                            setErrores(info.info);
                        }
                    }).catch((error) => {
                        mensajes("Error al cargar el ERRORES", "error", "Error");
                        console.error(error);
                    });
                } else {
                    mensajes(`Error al obtener caso de prueba: ${response.msg}`, 'error');
                }
            } catch (error) {
                mensajes('Error al procesar la solicitud', 'error');
            }

        };

        const fetchCasoPruebaAsignado = async () => {
            try {
                const response = await peticionGet(getToken(), `contrato/asignado/${external_id}`);
                if (response.code === 200) {
                    setInfoAsignado(response.info);
                } else {
                    mensajes(`Error al obtener caso de prueba: ${response.msg}`, 'error');
                }
            } catch (error) {
                mensajes('Error al procesar la solicitud', 'error');
            }
        };

        fetchCasoPruebaAsignado();
        fetchCasoPrueba();
    }, [setValue]);


    const handleDeleteCasoPrueba = async (external_id) => {
        swal({
            title: "¿Estás seguro de que deseas eliminar este caso de prueba?",
            text: "Una vez eliminado, no podrás revertir esta acción",
            icon: "warning",
            buttons: ["Cancelar", "Eliminar"],
            dangerMode: true,
        }).then(async (willDelete) => {
            if (willDelete) {
                const response = await peticionGet(getToken(), `caso/prueba/eliminar?external_id=${external_id}`);
                if (response.code === 200) {
                    mensajes('Caso de prueba eliminado exitosamente.', 'success');
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                } else {
                    mensajes(response.msg, 'error', 'Error');
                }
            } else {
                mensajes('Eliminación cancelada', 'info', 'Información');
            }
        });
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toISOString().slice(0, 10);
    }

    console.log("zzzzzzzzzzzzzzz", infoAsignado);
    

    return (
        <div>
            <div className='container-fluid'>
                <div className='contenedor-centro'>

                    <div className="contenedor-carta">
                        <p className="titulo-proyecto">{infoProyecto.nombre}</p>
                        <p className="titulo-primario">Caso de Prueba</p>
                        {errores.length > 0 ? (
                            <div className="accordion" id="accordionExample">
                                <div className="accordion-item ">
                                    <h2 className="accordion-header  " id="headingErrors">
                                        <button
                                            className="accordion-button alert-danger"
                                            type="button"
                                            data-bs-toggle="collapse"
                                            data-bs-target="#collapseErrors"
                                            aria-expanded="true"
                                            aria-controls="collapseErrors"
                                        >
                                            Lista de Errores
                                        </button>
                                    </h2>
                                    <div
                                        id="collapseErrors"
                                        className="accordion-collapse collapse"
                                        aria-labelledby="headingErrors"
                                        data-bs-parent="#accordionExample"
                                    >
                                        <div className="accordion-body">
                                            <div className="table-responsive">
                                                <table className="table table-striped">
                                                    <thead>
                                                        <tr>
                                                            <th className="text-center">Titulo</th>
                                                            <th className="text-center">Severidad</th>
                                                            <th className="text-center">Prioridad</th>
                                                            <th className="text-center">Estado</th>
                                                            <th className="text-center"></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {errores.length === 0 ? (
                                                            <tr>
                                                                <td colSpan="5" className="text-center">
                                                                    No hay errores disponibles.
                                                                </td>
                                                            </tr>
                                                        ) : (
                                                            errores.map((error, index) => (
                                                                <tr key={index}>
                                                                    <td>{error.titulo}</td>
                                                                    <td className="text-center">{error.severidad}</td>
                                                                    <td className="text-center">{error.prioridad}</td>
                                                                    <td className="text-center">{error.estado}</td>
                                                                    <td className="text-center">
                                                                        <Button
                                                                            variant="btn btn-outline-info btn-rounded"
                                                                            onClick={() => handleNavigateToDetail(error.external_id)}
                                                                            className="btn-icon"
                                                                        >
                                                                            <svg
                                                                                xmlns="http://www.w3.org/2000/svg"
                                                                                width="24"
                                                                                height="24"
                                                                                fill="currentColor"
                                                                                className="bi bi-arrow-right-circle-fill"
                                                                                viewBox="0 0 16 16"
                                                                            >
                                                                                <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0M4.5 7.5a.5.5 0 0 0 0 1h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5z" />
                                                                            </svg>
                                                                        </Button>
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                            <TablePagination
                                                rowsPerPageOptions={[10, 25, 100]}
                                                component="div"
                                                count={errores.length}
                                                rowsPerPage={rowsPerPage}
                                                page={page}
                                                onPageChange={handleChangePage}
                                                onRowsPerPageChange={handleChangeRowsPerPage}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                        ) : (
                            <div class="alert alert-success" role="alert">
                                No hay errores generados
                            </div>
                        )}

                        <div className="row mt-4">
                            <div className="col-6 mb-4">
                                <div className="card p-3 shadow-sm card-custom-bord">
                                    <h5 className="titulo-secundario" style={{ textAlign: 'left' }}>Título</h5>
                                    <p className="w-100 text-start texto-normal">{casosPrueba?.nombre}</p>
                                </div>
                            </div>

                            <div className="col-md-6 mb-4">
                                <div className="card p-3 shadow-sm card-custom-bord ">
                                    <h5 className="titulo-secundario mb-3" style={{ textAlign: 'initial' }}>Detalles del Caso</h5>
                                    <div className="d-flex justify-content-around align-items-center flex-wrap gap-2">
                                        <div className="d-flex flex-column align-items-center">
                                            <p className="w-100 text-start texto-normal">
                                                <p><span className="fw-bold">Estado</span></p>
                                                <span className={`badge ${getEstadoClass(casosPrueba?.estado)}`}>
                                                    {casosPrueba?.estado}
                                                </span>
                                            </p>
                                        </div>
                                        <div className="d-flex flex-column align-items-center">
                                            <p><span className="fw-bold">Clasificación</span></p>
                                            <p className="w-100 text-start texto-normal">
                                                <span className={`badge ${casosPrueba?.clasificacion === 'ALTA' ? 'bg-danger' : casosPrueba?.clasificacion === 'MEDIA' ? 'bg-warning' : 'bg-success'}`}>
                                                    {casosPrueba?.clasificacion}
                                                </span>
                                            </p>
                                        </div>
                                        <div className="d-flex flex-column align-items-center">
                                            <p className="w-100 text-start texto-normal">
                                            <p><span className="fw-bold">Estado de asignación</span></p>
                                                <span className={`badge ${casosPrueba?.estadoAsignacion === 'ASIGNADO' ? 'bg-primary' : casosPrueba?.estadoAsignacion === 'REASIGNADO' ? 'bg-warning' : 'bg-secondary'}`}>
                                                    {casosPrueba?.estadoAsignacion}
                                                </span>
                                            </p>
                                        </div>
                                        <div className="d-flex flex-column align-items-center">
                                            <p className="w-100 text-start texto-normal">
                                            <p><span className="fw-bold">Tipo de prueba</span></p>
                                            <p className="w-100 text-start texto-normal">{casosPrueba?.tipo_prueba}</p>
                                            </p>
                                        </div>
                                    </div>

                                </div>
                            </div>

                            <div className="col-6 mb-4">
                                <div className="card p-3 shadow-sm card-custom-bord">
                                    <h5 className="titulo-secundario" style={{ textAlign: 'left' }}>Descripción</h5>
                                    <div className="w-100 text-start texto-normal" dangerouslySetInnerHTML={{ __html: casosPrueba?.descripcion ? casosPrueba.descripcion.replace(/\n/g, '<br />') : '' }} />
                                </div>
                            </div>

                            <div className="col-6 mb-4">
                                <div className="card p-3 shadow-sm card-custom-bord">
                                    <h5 className="titulo-secundario" style={{ textAlign: 'left' }}>Precondiciones</h5>
                                    <div className="w-100 text-start texto-normal" dangerouslySetInnerHTML={{ __html: casosPrueba?.precondiciones ? casosPrueba?.precondiciones.replace(/\n/g, '<br />') : '' }} />
                                </div>
                            </div>

                            <div className="col-6 mb-4">
                                <div className="card p-3 shadow-sm card-custom-bord">
                                    <h5 className="titulo-secundario" style={{ textAlign: 'left' }}>Datos entrada</h5>
                                    <div className="w-100 text-start texto-normal" dangerouslySetInnerHTML={{ __html: casosPrueba?.datos_entrada ? casosPrueba?.datos_entrada.replace(/\n/g, '<br />') : '' }} />
                                </div>
                            </div>

                            <div className="col-6 mb-4">
                                <div className="card p-3 shadow-sm card-custom-bord">
                                    <h5 className="titulo-secundario" style={{ textAlign: 'left' }}>Pasos</h5>
                                    <div className="w-100 text-start texto-normal" dangerouslySetInnerHTML={{ __html: casosPrueba?.pasos ? casosPrueba?.pasos.replace(/\n/g, '<br />') : '' }} />
                                </div>
                            </div>

                            <div className="col-6 mb-4">
                                <div className="card p-3 shadow-sm card-custom-bord">
                                    <h5 className="titulo-secundario" style={{ textAlign: 'left' }}>Resultado esperado</h5>
                                    <div className="w-100 text-start texto-normal" dangerouslySetInnerHTML={{ __html: casosPrueba?.resultado_esperado ? casosPrueba?.resultado_esperado.replace(/\n/g, '<br />') : '' }} />
                                </div>
                            </div>

                            <div className="col-6 mb-4">
                                <div className="card p-3 shadow-sm card-custom-bord">
                                    <h5 className="titulo-secundario" style={{ textAlign: 'left' }}>Resultado obtenido</h5>
                                    <div className="w-100 text-start texto-normal" dangerouslySetInnerHTML={{ __html: casosPrueba?.resultado_obtenido ? casosPrueba?.resultado_obtenido.replace(/\n/g, '<br />') : '' }} />
                                </div>
                            </div>

                            <div className="col-md-6 mb-4">
                                <div className="card p-3 shadow-sm card-custom-bord ">
                                    <h5 className="titulo-secundario" style={{ textAlign: 'initial' }}>Fechas de Asignación</h5>
                                    <div className="mb-2">
                                        <strong>Fecha de creación: </strong>
                                        {casosPrueba?.fecha_disenio ? formatDate(casosPrueba.fecha_disenio) : 'No disponible'}
                                    </div>
                                    <div className="mb-2">
                                        <strong>Fecha de asignación al tester: </strong>
                                        {infoAsignado?.fecha_inicio ? formatDate(infoAsignado.fecha_inicio) : 'Sin fecha de asignación'}
                                    </div>
                                    <div className="mb-2">
                                        <strong>Fecha de ejecución: </strong>
                                        {infoAsignado?.fecha_fin ? formatDate(infoAsignado.fecha_fin) : 'No disponible'}
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-6 mb-4">
                                <div className="card p-3 shadow-sm card-custom-bord ">
                                    <h5 className="titulo-secundario" style={{ textAlign: 'initial' }}>Personal responsable</h5>
                                    <div className="mb-2">
                                        <strong>Asignado a: </strong>
                                        {infoAsignado?.persona_asignada || 'Sin responsable asignado'}
                                    </div>
                                    <div className="mb-2">
                                        <strong>Asignado por: </strong>
                                        {infoAsignado?.persona_que_asigno || 'No existe registro de persona que asigno'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='contenedor-filo'>

                            {/* Mostrar botón "Ejecutar" solo si rol es true y el estado no es FALLIDO o EXITOSO */}
                            {(rol === 'tester' || rol === 'lider-tester') && !['FALLIDO', 'EXITOSO'].includes(casosPrueba.estado) ? (
                                <Button
                                    className="btn-normal mb-3"
                                    onClick={handleshoModal}
                                >
                                    <FontAwesomeIcon icon={faPlus} /> Ejecutar
                                </Button>
                            ) : (
                                // Mostrar botón "Agregar errores" solo si el estado es "FALLIDO"
                                (rol === 'tester' || rol === 'lider-tester') && casosPrueba.estado === 'FALLIDO' && (
                                    <Button
                                        className="btn-danger mb-3"
                                        onClick={handleAddError}
                                    >
                                        <FontAwesomeIcon icon={faExclamationCircle} /> Agregar errores
                                    </Button>
                                )
                            )}

                            {/* Botón "Editar" siempre visible */}
                            <Button
                                variant="btn btn-outline-info btn-rounded"
                                onClick={() => navigate(`/editar/caso/prueba/${external_id_proyecto}/${casosPrueba.external_id}`)}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil-square" viewBox="0 0 16 16">
                                    <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                                    <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z" />
                                </svg>
                            </Button>

                            {/* Mostrar el botón de "Eliminar" solo si el rol no es true */}
                            {rol !== 'tester' && (
                                <Button
                                    className="btn-negativo"
                                    onClick={() => handleDeleteCasoPrueba(casosPrueba.external_id)}
                                >
                                    <FontAwesomeIcon icon={faTrash} />
                                </Button>
                            )}

                        </div>

                    </div>
                </div>

            </div>
            <Modal show={shoModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                </Modal.Header>
                <Modal.Body>
                    <EjecutarCasoPrueba external_id_proyecto={external_id_proyecto}
                        external_id={external_id} onClose={handleCloseModal} />
                </Modal.Body>
            </Modal>


        </div>
    );
};

export default VerCasoPrueba;