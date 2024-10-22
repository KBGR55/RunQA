import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Modal, FormControl, InputGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import CasoPrueba from './CasoPrueba';
import { peticionGet } from '../utilities/hooks/Conexion';
import { useParams, useNavigate } from 'react-router-dom'; // Import useNavigate
import '../css/style.css';
import mensajes from '../utilities/Mensajes';
import { getToken } from '../utilities/Sessionutil';
import { faPlus } from '@fortawesome/free-solid-svg-icons'; 

const ListaCasoPrueba = ({ proyecto }) => {
    const [casosPrueba, setCasosPrueba] = useState([]);
    const { id } = useParams();
    const [searchTerm, setSearchTerm] = useState('');
    const [showNewProjectModal, setShowNewProjectModal] = useState(false);
    const navigate = useNavigate(); // Initialize useNavigate

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

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredCasosPrueba = casosPrueba.filter((caso) => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();

        return (
            (caso.nombre && caso.nombre.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (caso.estado && caso.estado.toLowerCase().includes(lowerCaseSearchTerm)) 
        );
    });

    const handleShowNewProjectModal = () => {
        setShowNewProjectModal(true);
    };

    const handleCloseNewProjectModal = () => {
        setShowNewProjectModal(false);
    };

    // Navigate to another view with the external_id
    const handleNavigateToDetail = (external_id) => {
        navigate(`/caso-prueba/${external_id}`); // Update the path as needed
    };

    return (
        <div className='container-fluid'>
            <div className='contenedor-centro'>
                <div className="contenedor-carta">
                    <div className='contenedor-filo'>
                        <Button
                            className="btn-normal mb-3"
                            onClick={handleShowNewProjectModal}
                        >  
                            <FontAwesomeIcon icon={faPlus} /> Crear 
                        </Button>
                    </div>
                    <p className="titulo-primario">Lista de Casos de Prueba</p>

                    <InputGroup className="mb-3">
                        <InputGroup.Text>
                            <FontAwesomeIcon icon={faSearch} />
                        </InputGroup.Text>
                        <FormControl
                            placeholder="Buscar por: Nombre, Estado"
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
                                    <th className="text-center"></th>
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
                                            <td className="text-center">
                                            <Button
    variant="btn btn-outline-info btn-rounded"
    onClick={() => handleNavigateToDetail(caso.external_id)} 
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
        <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0M4.5 7.5a.5.5 0 0 0 0 1h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5z"/>                                             
    </svg>
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

            <Modal show={showNewProjectModal} onHide={handleCloseNewProjectModal}>
                <Modal.Header closeButton>
                    <Modal.Title className='titulo-primario'>Crear Caso Prueba</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <CasoPrueba projectId={proyecto.id} onClose={handleCloseNewProjectModal} />
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default ListaCasoPrueba;
