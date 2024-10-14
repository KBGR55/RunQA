import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEye } from '@fortawesome/free-solid-svg-icons';
import MenuBar from './MenuBar';
import CasoPrueba from './CasoPrueba';
import { peticionGet } from '../utilities/hooks/Conexion';
import '../css/style.css';
import { Link } from 'react-router-dom';

const ListaProyectos = () => {
    const [showModal, setShowModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [proyectos, setProyectos] = useState([]);

    useEffect(() => {
        const fetchProyectos = async () => {
            try {
                const response = await peticionGet('tu_api_token', 'proyecto/listar');
                if (response.code === 200) {
                    setProyectos(response.info);
                } else {
                    console.error('Error al obtener proyectos:', response.msg);
                }
            } catch (error) {
                console.error('Error en la solicitud:', error);
            }
        };

        fetchProyectos();
    }, []);

    const handleShowModal = (project) => {
        setSelectedProject(project);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedProject(null);
    };

    // Función para formatear fechas
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toISOString().slice(0, 10); // Formato AAAA-MM-DD
    };

    return (
        <div>
            <MenuBar />
            <div className='contenedor-centro'>
                <div className="contenedor-carta">
                    <p className="titulo-primario">Lista de Proyectos</p>
                    <div className="table-responsive">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th className="text-center">Nombre</th>
                                <th className="text-center">Estado</th>
                                <th className="text-center">Fecha Inicio</th>
                                <th className="text-center">Fecha Fin</th>
                                <th className="text-center">Acciones: Casos de Prueba</th>
                            </tr>
                        </thead>
                        <tbody>
                            {proyectos.map((proyecto) => (
                                <tr key={proyecto.id}>
                                    <td>{proyecto.nombre}</td>
                                    <td className="text-center">{proyecto.estado ? 'Activos' : 'Terminados'}</td>
                                    <td className="text-center">{formatDate(proyecto.fecha_inicio)}</td>
                                    <td className="text-center">{formatDate(proyecto.fecha_fin)}</td>
                                    <td className="text-center">
                                        <Button
                                            className={`${!proyecto.estado ? 'btn-desactivado' : 'btn-normal'}`}
                                            onClick={() => handleShowModal(proyecto)}
                                            disabled={!proyecto.estado}
                                        >
                                            <FontAwesomeIcon icon={faPlus} />
                                        </Button>

                                        <Link to={`/casos-prueba/${proyecto.id}`} className="btn-normal">
                                            <FontAwesomeIcon icon={faEye} />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    </div>
                </div>
            </div>

            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title className='titulo-primario'>Agregar Caso de Prueba - {selectedProject?.nombre}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <CasoPrueba projectId={selectedProject?.id} />
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default ListaProyectos;