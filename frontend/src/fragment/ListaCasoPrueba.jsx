import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Modal, FormControl, InputGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTrash, faEdit } from '@fortawesome/free-solid-svg-icons';
import MenuBar from './MenuBar';
import CasoPrueba from './CasoPrueba';
import { peticionGet } from '../utilities/hooks/Conexion';
import { useParams } from 'react-router-dom';
import '../css/style.css';
import mensajes from '../utilities/Mensajes';

const ListaCasoPrueba = ({ projectId }) => {
    const [showModal, setShowModal] = useState(false);
    const [editingCaso, setEditingCaso] = useState(null);
    const [casosPrueba, setCasosPrueba] = useState([]);
    const { id } = useParams();
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchCasosPrueba = async () => {
            const response = await peticionGet('tu_api_token', `caso/prueba/listar?id_proyecto=${id}`);
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
            const response = await peticionGet('tu_api_token', `caso/prueba/eliminar?external_id=${external_id}`);
            if (response.code === 200) {
                mensajes('Caso de prueba eliminado exitosamente.');
            } else {
                mensajes(response.msg, 'error', 'Error');
            }
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toISOString().slice(0, 10); // Formato AAAA-MM-DD
    };

    return (
        <div>
            <MenuBar />
            <div className='contenedor-centro'>
                <div className="contenedor-carta">
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
                                            <Button
                                                className="btn-normal"
                                                onClick={() => handleShowModal(caso.external_id)}
                                            >
                                                <FontAwesomeIcon icon={faEdit} />
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
                        projectId={projectId}
                        id_editar={editingCaso}
                    />
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default ListaCasoPrueba;