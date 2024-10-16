import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Modal, FormControl, InputGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTrash} from '@fortawesome/free-solid-svg-icons';
import CasoPrueba from './CasoPrueba';
import { peticionGet } from '../utilities/hooks/Conexion';
import { useParams } from 'react-router-dom';
import '../css/style.css';
import mensajes from '../utilities/Mensajes';
import { getToken } from '../utilities/Sessionutil';
import { faPlus } from '@fortawesome/free-solid-svg-icons'; 

const ListaCasoPrueba = ({ proyecto }) => {
    const [showModal, setShowModal] = useState(false);
    const [editingCaso, setEditingCaso] = useState(null);
    const [casosPrueba, setCasosPrueba] = useState([]);
    const { id } = useParams();
    const [searchTerm, setSearchTerm] = useState('');
    const [showNewProjectModal, setShowNewProjectModal] = useState(false);

    useEffect(() => {
        const fetchCasosPrueba = async () => {
            const response = await peticionGet(getToken(), `caso/prueba/listar?id_proyecto=${proyecto.id}`);
            
            if (response.code === 200) {
                setCasosPrueba(response.info);
            } else {
                console.error('Error al obtener casos de prueba:', response.msg);
            }
        };

        fetchCasosPrueba();
    }, [id]); 

    const handleShowModal = (casoId) => {
        setEditingCaso(casoId);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setEditingCaso(null);
        setShowModal(false);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredCasosPrueba = casosPrueba.filter((caso) => {
        const estadoString = caso.estado ? 'Activos' : 'Terminados';
        const lowerCaseSearchTerm = searchTerm.toLowerCase();

        return (
            (caso.nombre && caso.nombre.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (caso.descripcion && caso.descripcion.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (caso.pasos && caso.pasos.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (caso.resultado_esperado && caso.resultado_esperado.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (caso.resultado_obtenido && caso.resultado_obtenido.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (estadoString.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (caso.clasificacion && caso.clasificacion.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (caso.tipo_prueba && caso.tipo_prueba.toLowerCase().includes(lowerCaseSearchTerm))
        );
    });

    const handleDeleteCasoPrueba = async (external_id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este caso de prueba?')) {
            const response = await peticionGet(getToken(), `caso/prueba/eliminar?external_id=${external_id}`);
            if (response.code === 200) {
                mensajes('Caso de prueba eliminado exitosamente.');
            } else {
                mensajes(response.msg, 'error', 'Error');
            }
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toISOString().slice(0, 10); // Formato AAAA-MM-DD
    }
    const handleShowNewProjectModal = () => {
        setShowNewProjectModal(true);
    };

    const handleCloseNewProjectModal = () => {
        setShowNewProjectModal(false);
    };

    return (
        <div className='container-fluid'>
            <div className='contenedor-centro'>
                <div className="contenedor-carta">
                <div className='contenedor-filo'>
                        <Button
                            className="btn-normal mb-3"
                            onClick={handleShowNewProjectModal}
                        >  <FontAwesomeIcon icon={faPlus} />  Crear 
                        </Button>
                    </div>
                    <p className="titulo-primario">Lista de Casos de Prueba</p>

                    <InputGroup className="mb-3">
                        <InputGroup.Text>
                            <FontAwesomeIcon icon={faSearch} />
                        </InputGroup.Text>
                        <FormControl
                            placeholder="Buscar por: Nombre, Pasos, Resultado Esperado, Estado, Clasificación"
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                    </InputGroup>
                    <div className="table-responsive">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th className="text-center">Nombre</th>
                                <th className="text-center">Estado</th>
                                <th className="text-center">Descripción</th>
                                <th className="text-center">Pasos</th>
                                <th className="text-center">Resultado Esperado</th>
                                <th className="text-center">Resultado Obtenido</th>
                                <th className="text-center">Clasificación</th>
                                <th className="text-center">Tipo de Prueba</th>
                                <th className="text-center">Precondiciones</th>
                                <th className="text-center">Fecha Diseño</th>
                                <th className="text-center">Fecha Ejecución</th>
                                <th className="text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCasosPrueba.length === 0 ? (
                                <tr>
                                    <td colSpan="12" className="text-center">No hay casos de prueba disponibles.</td>
                                </tr>
                            ) : (
                                filteredCasosPrueba.map((caso) => (
                                    <tr key={caso.external_id}>
                                        <td>{caso.nombre}</td>
                                        <td className="text-center">{caso.estado}</td>
                                        <td>{caso.descripcion}</td>
                                        <td>{caso.pasos}</td>
                                        <td>{caso.resultado_esperado}</td>
                                        <td>{caso.resultado_obtenido}</td>
                                        <td>{caso.clasificacion}</td>
                                        <td>{caso.tipo_prueba}</td>
                                        <td>{caso.precondiciones}</td>
                                        <td className="text-center">{formatDate(caso.fecha_disenio)}</td>
                                        <td className="text-center">{formatDate(caso.fecha_ejecucion_prueba)}</td>
                                        <td className="text-center">
                                        
                                            <Button variant="btn btn-outline-info btn-rounded"  onClick={() => handleShowModal(caso.external_id)} >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil-square" viewBox="0 0 16 16">
                                                                <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                                                                <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z" />
                                                            </svg>
                                                        </Button>
                                            <Button
                                                className="btn-negativo"
                                                onClick={() => handleDeleteCasoPrueba(caso.external_id)}
                                            >
                                                <FontAwesomeIcon icon={faTrash} />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                    </div>
                </div>
            </div>

            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title className='titulo-primario'>
                        {editingCaso ? 'Editar Caso de Prueba' : 'Agregar Caso de Prueba'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <CasoPrueba
                        projectId={proyecto.id}
                        id_editar={editingCaso}
                    />
                </Modal.Body>
            </Modal>
            <Modal show={showNewProjectModal} onHide={handleCloseNewProjectModal}>
                <Modal.Header closeButton>
                    <Modal.Title className='titulo-primario'>Crear Caso Prueba</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <CasoPrueba  projectId={proyecto.id} onClose={handleCloseNewProjectModal} />
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default ListaCasoPrueba;