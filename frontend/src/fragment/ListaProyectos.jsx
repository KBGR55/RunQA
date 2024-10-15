import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEye, faUsers } from '@fortawesome/free-solid-svg-icons'; // Import the users icon
import MenuBar from './MenuBar';
import CasoPrueba from './CasoPrueba';
import NuevoProyecto from './NuevoProyecto'; // Importar el componente de nuevo proyecto
import { peticionGet } from '../utilities/hooks/Conexion';
import '../css/style.css';
import { Link, Navigate } from 'react-router-dom';
import { borrarSesion, getToken, getUser } from '../utilities/Sessionutil';
import mensajes from '../utilities/Mensajes';

const ListaProyectos = () => {
    const [showModal, setShowModal] = useState(false);
    const [showNewProjectModal, setShowNewProjectModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [proyectos, setProyectos] = useState([]);
    const [roles, setRoles] = useState([]);

    useEffect(() => {
        const fetchProyectos = async () => {
            try {
                const info = await peticionGet(getToken(), `rol_proyecto/listar?id_entidad=${getUser().user.id}`);
                if (info.code !== 200 && info.msg === 'Acceso denegado. Token a expirado') {
                    borrarSesion();
                    mensajes(info.mensajes);
                    Navigate("/main");
                } else if (info.code === 200) {
                    setProyectos(info.info);
                } else {
                    console.error('Error al obtener proyectos:', info.msg);
                }
            } catch (error) {
                console.error('Error en la solicitud:', error);
            }
        };

        const fetchRoles = async () => {
            try {
                const info = await peticionGet(getToken(), 'rol/listar');
                if (info.code !== 200 && info.msg === 'Acceso denegado. Token a expirado') {
                    borrarSesion();
                    mensajes(info.mensajes);
                    Navigate("/main");
                } else if (info.code === 200) {
                    setRoles(info.info);
                } else {
                    console.error('Error al obtener roles:', info.msg);
                }
            } catch (error) {
                console.error('Error en la solicitud:', error);
            }
        };

        fetchProyectos();
        fetchRoles();
    }, []);

    const handleShowModal = (project) => {
        setSelectedProject(project);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedProject(null);
    };

    const handleShowNewProjectModal = () => {
        setShowNewProjectModal(true);
    };

    const handleCloseNewProjectModal = () => {
        setShowNewProjectModal(false);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toISOString().slice(0, 10); // Formato AAAA-MM-DD
    };

    const getRoleName = (idRol) => {
        const role = roles.find((role) => role.id === idRol);
        if (!role) {
            console.error(`Rol no encontrado para el ID: ${idRol}`);
            return 'Desconocido';
        }
        return role.nombre;
    };

    return (
        <div>
            <MenuBar />

            <div className='contenedor-centro'>

                <div className="contenedor-carta">
                    <div className='contenedor-filo'>
                        <Button
                            className="btn-normal mb-3"
                            onClick={handleShowNewProjectModal}
                        >  <FontAwesomeIcon icon={faPlus} />  Crear Proyecto
                        </Button>
                    </div>
                    <p className="titulo-primario">Lista de Proyectos</p>
                    <div className="table-responsive">
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th className="text-center">Nombre</th>
                                    <th className="text-center">Estado</th>
                                    <th className="text-center">Descripción</th>
                                    <th className="text-center">Fecha Inicio</th>
                                    <th className="text-center">Rol</th>
                                    <th className="text-center">Acciones: Casos de Prueba</th>
                                    <th className="text-center">Acciones: Gestión de Usuarios</th> {/* Nueva columna */}
                                </tr>
                            </thead>
                            <tbody>
                                {proyectos.map((proyecto) => (
                                    <tr key={proyecto.proyecto.id}>
                                        <td>{proyecto.proyecto.nombre}</td>
                                        <td className="text-center">{proyecto.proyecto.estado ? 'Activos' : 'Terminados'}</td>
                                        <td>{proyecto.proyecto.descripcion}</td>
                                        <td className="text-center">{formatDate(proyecto.proyecto.fecha_inicio)}</td>
                                        <td className="text-center">{getRoleName(proyecto.id_rol)}</td>
                                        <td className="text-center">
                                         
                                                <Button
                                                    className={`${!proyecto.proyecto.estado ? 'btn-desactivado' : 'btn-normal'}`}
                                                    onClick={() => handleShowModal(proyecto.proyecto)}
                                                    disabled={!proyecto.proyecto.estado}
                                                >
                                                    <FontAwesomeIcon icon={faPlus} />
                                                </Button>
                                        
                                            <Link to={`/casos-prueba/${proyecto.id_proyecto}`} className="btn-normal">
                                                <FontAwesomeIcon icon={faEye} />
                                            </Link>
                                        </td>
                                        <td className="text-center">
                                            <Link to={`/proyecto/usuarios/${proyecto.proyecto.external_id}`} className="btn-normal">
                                                <FontAwesomeIcon icon={faUsers} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal para agregar caso de prueba */}
            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title className='titulo-primario'>Agregar Caso de Prueba - {selectedProject?.nombre}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <CasoPrueba projectId={selectedProject?.id} />
                </Modal.Body>
            </Modal>

            {/* Modal para crear un nuevo proyecto */}
            <Modal show={showNewProjectModal} onHide={handleCloseNewProjectModal}>
                <Modal.Header closeButton>
                    <Modal.Title className='titulo-primario'>Crear Nuevo Proyecto</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <NuevoProyecto onClose={handleCloseNewProjectModal} />
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default ListaProyectos;