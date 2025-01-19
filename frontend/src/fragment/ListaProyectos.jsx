import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Modal, Dropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import swal from 'sweetalert';
import { peticionGet } from '../utilities/hooks/Conexion';
import '../css/style.css';
import { useNavigate } from 'react-router-dom';
import { borrarSesion, getToken, getUser } from '../utilities/Sessionutil';
import mensajes from '../utilities/Mensajes';
import NuevoProyecto from './NuevoProyecto';

const ListaProyectos = () => {
    const [showNewProjectModal, setShowNewProjectModal] = useState(false);
    const [proyectos, setProyectos] = useState([]);
    const [rolLider, setRolLider] = useState([]);
    const [showEditProjectModal, setShowEditProjectModal] = useState(false);
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const navigate = useNavigate();
    const user = getUser().user;

    useEffect(() => {
        const fetchProyectos = async () => {
            try {
                const info = await peticionGet(getToken(), `rol_proyecto/listar/proyectos?id_entidad=${user.id}`);
                if (info.code !== 200 && info.msg === 'Acceso denegado. Token ha expirado') {
                    borrarSesion();
                    mensajes(info.mensajes);
                    navigate("/main");
                } else if (info.code === 200) {
                    setProyectos(info.info);
                } else {
                    console.error('Error al obtener proyectos:', info.msg);
                }
            } catch (error) {
                console.error('Error en la solicitud:', error);
            }
        };

        const fetchRolesLiderCalidad = async () => {
            try {
                const info = await peticionGet(
                    getToken(),
                    `rol/entidad/obtener/lider?id_entidad=${user.id}`
                );
                if (info.code !== 200 && info.msg === 'Acceso denegado. Token ha expirado') {
                    borrarSesion();
                    mensajes(info.mensajes);
                    navigate("/main");
                } else if (info.code === 200) {
                    setRolLider(info.info);
                } else {
                    console.error('Error al obtener roles:', info.msg);
                }
            } catch (error) {
                console.error('Error en la solicitud:', error);
            }
        };

        fetchRolesLiderCalidad();
        fetchProyectos();
    }, [navigate, user.id]);

    const handleShowNewProjectModal = () => setShowNewProjectModal(true);
    const handleCloseNewProjectModal = () => setShowNewProjectModal(false);

    const handleProjectClick = (proyecto) => navigate(`/presentacion/${proyecto.external_id}`);

    const handleEliminarProyecto = async (externalId) => {
        swal({
            title: "¿Está seguro?",
            text: "Una vez eliminado, no podrá recuperar este proyecto.",
            icon: "warning",
            buttons: ["Cancelar", "Eliminar"],
            dangerMode: true,
        }).then(async (confirmacion) => {
            if (confirmacion) {
                try {
                    const respuesta = await peticionGet(getToken(), `proyecto/eliminar/${externalId}`);
                    if (respuesta.code === 200) {
                        swal({
                            title: "¡Eliminado!",
                            text: "El proyecto ha sido eliminado correctamente.",
                            icon: "success",
                        });
                        setProyectos(proyectos.filter((p) => p.external_id !== externalId));
                    } else {
                        swal({
                            title: "Error",
                            text: respuesta.msg || "No se pudo eliminar el proyecto.",
                            icon: "error",
                        });
                    }
                } catch (error) {
                    console.error('Error al eliminar el proyecto:', error);
                    swal({
                        title: "Error",
                        text: "Ocurrió un problema al intentar eliminar el proyecto.",
                        icon: "error",
                    });
                }
            }
        });
    };

    const handleCloseModal = () => {
        setShowEditProjectModal(false);
        setSelectedProjectId(null); // Limpiar el external_id cuando se cierra el modal
    };

    const handleEditClick = (externalId) => {
        setSelectedProjectId(externalId);
        setShowEditProjectModal(true);
    };
    console.log(proyectos);

    return (
        <div>
            <div className="contenedor-centro">
                <div className="contenedor-carta">
                    {rolLider.length > 0 && (
                        <div className="contenedor-filo">
                            <Button className="btn-normal mb-3" onClick={handleShowNewProjectModal}>
                                <FontAwesomeIcon icon={faPlus} /> Crear Proyecto
                            </Button>
                        </div>
                    )}
                    <p className="titulo-primario">Lista de Proyectos</p>
                    {proyectos.length === 0 ? (
                        <div className="text-center">
                            <p className="text-muted">No hay proyectos registrados</p>
                        </div>
                    ) : (
                        <div className="row">
                            {proyectos.map((proyecto) => (
                                <div className="col-md-4 mb-4" key={proyecto.id}>
                                    <div
                                        className={`card shadow-sm h-100 position-relative ${proyecto.terminado ? 'card-opaca' : ''}`}
                                        style={{ cursor: 'pointer', borderColor: '#e0e0e0' }}
                                        onClick={() => !proyecto.terminado && handleProjectClick(proyecto)}
                                    >
                                      {proyecto.terminado && (
                                            <div className="overlay-terminar">
                                                <p className="razon-terminar text-center">
                                                    {proyecto.razon_terminado || 'Sin razón especificada'}
                                                </p>
                                            </div>
                                        )}
                                        {/* Imagen */}
                                        <div className="text-center" style={{ paddingTop: '10px' }}>
                                            <img
                                                src="/img/fondo1.jpeg"
                                                alt="Imagen del proyecto"
                                                className="img-fluid rounded"
                                            />
                                        </div>
                                        {/* Cuerpo de la tarjeta */}
                                        <div className="card-body">
                                            <div className="d-flex justify-content-between align-items-start">
                                                <h5 className="card-title fw-bold">{proyecto.nombre}</h5>
                                                <Dropdown onClick={(e) => e.stopPropagation()}>
                                                    <Dropdown.Toggle
                                                        variant="light"
                                                        id="dropdown-basic"
                                                        className="btn-sm"
                                                    >
                                                        <FontAwesomeIcon icon={faEllipsisV} />
                                                    </Dropdown.Toggle>
                                                    <Dropdown.Menu>
                                                        <Dropdown.Item
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleEditClick(proyecto.external_id);
                                                            }}
                                                        >
                                                            Editar Proyecto
                                                        </Dropdown.Item>
                                                        <Dropdown.Item
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleEliminarProyecto(proyecto.external_id);
                                                            }}
                                                        >
                                                            Eliminar Proyecto
                                                        </Dropdown.Item>
                                                    </Dropdown.Menu>
                                                </Dropdown>
                                            </div>
                                            <p className="card-text text-muted">{proyecto.descripcion || 'Sin descripción'}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}

                        </div>
                    )}
                </div>
            </div>

            {/* Modal para crear/editar proyecto */}
            <Modal show={showEditProjectModal} onHide={handleCloseModal} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title className="titulo-primario">Editar Proyecto</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <NuevoProyecto external_id_proyecto={selectedProjectId} onClose={handleCloseNewProjectModal} />
                </Modal.Body>
            </Modal>

            {/* Modal para crearproyecto */}
            <Modal show={showNewProjectModal} onHide={handleCloseNewProjectModal}>
                <Modal.Header closeButton>
                    <Modal.Title className="titulo-primario">Crear Nuevo Proyecto</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <NuevoProyecto onClose={handleCloseNewProjectModal} />
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default ListaProyectos;
