import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons'; // Importar el ícono
import MenuBar from './MenuBar';
import RegistrarCasoPrueba from './CasoPrueba';
import '../css/style.css';

const ListaProtectos = () => {
    const [showModal, setShowModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);

    const proyectos = [
        {
            id: 1,
            nombre: 'Proyecto Alpha',
            estado: true,
            fecha_inicio: '2024-01-01',
            fecha_fin: '2024-12-31',
            descripcion: 'Este es un proyecto activo.'
        },
        {
            id: 2,
            nombre: 'Proyecto Beta',
            estado: false,
            fecha_inicio: '2023-01-01',
            fecha_fin: '2023-06-30',
            descripcion: 'Este proyecto ha terminado.'
        },
        {
            id: 3,
            nombre: 'Proyecto Gamma',
            estado: true,
            fecha_inicio: '2024-03-01',
            fecha_fin: '2025-02-28',
            descripcion: 'Este es un proyecto activo.'
        },
        {
            id: 4,
            nombre: 'Proyecto Delta',
            estado: false,
            fecha_inicio: '2022-07-01',
            fecha_fin: '2023-01-15',
            descripcion: 'Este proyecto ha terminado.'
        },
        {
            id: 5,
            nombre: 'Proyecto Epsilon',
            estado: true,
            fecha_inicio: '2024-04-01',
            fecha_fin: '2025-05-31',
            descripcion: 'Este es un proyecto activo.'
        },
    ];

    const handleShowModal = (project) => {
        setSelectedProject(project);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedProject(null);
    };

    return (
        <div>
            <MenuBar />
            <div className='contenedor-centro'>
                <div className="contenedor-carta">
                    <p className="titulo-primario">Lista de Proyectos</p>
                    <table className="table">
                        <thead>
                            <tr>
                                <th className="text-center">Nombre</th>
                                <th className="text-center">Estado</th>
                                <th className="text-center">Fecha Inicio</th>
                                <th className="text-center">Fecha Fin</th>
                                <th className="text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {proyectos.map((proyecto) => (
                                <tr key={proyecto.id}>
                                    <td>{proyecto.nombre}</td>
                                    <td className="text-center">{proyecto.estado ? 'Activos' : 'Terminados'}</td>
                                    <td className="text-center">{proyecto.fecha_inicio}</td>
                                    <td className="text-center">{proyecto.fecha_fin}</td>
                                    <td className="text-center">
                                        <Button className="btn-normal" onClick={() => handleShowModal(proyecto)}>
                                           <FontAwesomeIcon icon={faPlus} /> {/* Icono añadido aquí */}
                                            Caso de Prueba
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title className='titulo-primario'>Agregar Caso de Prueba - {selectedProject?.nombre}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <RegistrarCasoPrueba />
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default ListaProtectos;