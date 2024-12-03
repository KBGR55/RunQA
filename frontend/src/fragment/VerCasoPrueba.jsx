import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { Button, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import CasoPrueba from './CasoPrueba';
import { peticionGet } from '../utilities/hooks/Conexion';
import { useNavigate, useParams } from 'react-router-dom';
import '../css/style.css';
import mensajes from '../utilities/Mensajes';
import { getToken } from '../utilities/Sessionutil';
import { useForm } from 'react-hook-form';
import swal from 'sweetalert';
import EjecutarCasoPrueba from './EjecutarCasoPrueba';
import TablePagination from '@mui/material/TablePagination';

const VerCasoPrueba = () => {
    const [casosPrueba, setCasosPrueba] = useState({});
    const { external_id_proyecto, external_id } = useParams();
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
        console.log('handleshoModal ejecutado');
        setshoModal(true);
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
                const response = await peticionGet(getToken(), `caso/prueba/obtener?external_id=${external_id}`);
                if (response.code === 200) {
                    const casoPruebaData = response.info;
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
                    }, 1200);
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

    return (
        <div>
            <div className='container-fluid'>
                <div className='contenedor-centro'>

                    <div className="contenedor-carta">
                        <p className="titulo-proyecto">  Proyecto "{infoProyecto.nombre}"</p>
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
                        <div className="form-group">
                            <div className="row">
                                <div className="col-md-6">
                                    <label className="w-100 text-start titulo-secundario">Estado</label>
                                    <p className="w-100 text-start texto-normal">
                                        <span className={`badge ${getEstadoClass(casosPrueba?.estado)}`}>
                                            {casosPrueba?.estado}
                                        </span>
                                    </p>
                                    <label className="w-100 text-start titulo-secundario">Título</label>
                                    <p className="w-100 text-start texto-normal">{casosPrueba?.nombre}</p>

                                    <label className="w-100 text-start titulo-secundario">Clasificación</label>
                                    <p className="w-100 text-start texto-normal">
                                        <span className={`badge ${casosPrueba?.clasificacion === 'ALTA' ? 'bg-danger' : casosPrueba?.clasificacion === 'MEDIA' ? 'bg-warning' : 'bg-success'}`}>
                                            {casosPrueba?.clasificacion}
                                        </span>
                                    </p>


                                    <label className="w-100 text-start titulo-secundario">Tipo de prueba</label>
                                    <p className="w-100 text-start texto-normal">{casosPrueba?.tipo_prueba}</p>
                                </div>
                                <div className="col-md-6">

                                    <label className="w-100 text-start titulo-secundario">Estado de Asignación</label>
                                    <p className="w-100 text-start texto-normal">
                                        <span className={`badge ${casosPrueba?.estadoAsignacion === 'ASIGNADO' ? 'bg-primary' : casosPrueba?.estadoAsignacion === 'REASIGNADO' ? 'bg-warning' : 'bg-secondary'}`}>
                                            {casosPrueba?.estadoAsignacion}
                                        </span>
                                    </p>


                                    <label className="w-100 text-start titulo-secundario">Fecha de diseño</label>
                                    <p className="w-100 text-start texto-normal">
                                        {casosPrueba?.fecha_disenio ? formatDate(casosPrueba.fecha_disenio) : 'No disponible'}
                                    </p>

                                    <label className="w-100 text-start titulo-secundario">Fecha de ejecución de prueba</label>
                                    <p className="w-100 text-start texto-normal">
                                        {casosPrueba?.fecha_ejecucion_prueba ? formatDate(casosPrueba.fecha_ejecucion_prueba) : 'No disponible'}
                                    </p>
                                    <label className="w-100 text-start titulo-secundario">Resultado esperado</label>
                                    <div className="w-100 text-start texto-normal" dangerouslySetInnerHTML={{ __html: casosPrueba?.resultado_esperado ? casosPrueba?.resultado_esperado.replace(/\n/g, '<br />') : '' }} />

                                    <label className="w-100 text-start titulo-secundario">Resultado obtenido</label>
                                    <div className="w-100 text-start texto-normal" dangerouslySetInnerHTML={{ __html: casosPrueba?.resultado_obtenido ? casosPrueba?.resultado_obtenido.replace(/\n/g, '<br />') : '' }} />

                                </div>

                                <div className="col-md-12">
                                    <div className="col-md-12">
                                        <label className="w-100 text-start titulo-secundario">Descripción</label>
                                        <div className="w-100 text-start texto-normal" dangerouslySetInnerHTML={{ __html: casosPrueba?.descripcion ? casosPrueba.descripcion.replace(/\n/g, '<br />') : '' }} />
                                    </div>

                                    <label className="w-100 text-start titulo-secundario">Precondiciones</label>
                                    <div className="w-100 text-start texto-normal" dangerouslySetInnerHTML={{ __html: casosPrueba?.precondiciones ? casosPrueba?.precondiciones.replace(/\n/g, '<br />') : '' }} />

                                    <label className="w-100 text-start titulo-secundario">Datos entrada</label>
                                    <div className="w-100 text-start texto-normal" dangerouslySetInnerHTML={{ __html: casosPrueba?.datos_entrada ? casosPrueba?.datos_entrada.replace(/\n/g, '<br />') : '' }} />

                                    <label className="w-100 text-start titulo-secundario">Pasos</label>
                                    <div className="w-100 text-start texto-normal" dangerouslySetInnerHTML={{ __html: casosPrueba?.pasos ? casosPrueba?.pasos.replace(/\n/g, '<br />') : '' }} />

                                </div>
                            </div>
                        </div>
                        <div className='contenedor-filo'>
                            <Button
                                className="btn-normal mb-3"
                                onClick={handleshoModal}
                            >
                                <FontAwesomeIcon icon={faPlus} /> Ejecutar
                            </Button>

                            <Button variant="btn btn-outline-info btn-rounded" onClick={() => navigate(`/editar/caso/prueba/${external_id_proyecto}/${casosPrueba.external_id}`)} >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil-square" viewBox="0 0 16 16">
                                    <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                                    <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z" />
                                </svg>
                            </Button>
                            <Button
                                className="btn-negativo"
                                onClick={() => handleDeleteCasoPrueba(casosPrueba.external_id)}
                            >
                                <FontAwesomeIcon icon={faTrash} />
                            </Button>
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