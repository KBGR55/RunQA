import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { peticionGet } from '../utilities/hooks/Conexion';
import { useParams, useNavigate } from 'react-router-dom';
import { borrarSesion, getToken, getUser } from '../utilities/Sessionutil';
import mensajes from '../utilities/Mensajes';
import 'react-datepicker/dist/react-datepicker.css';
import AsignarTesterModal from '../fragment/ModalAsignar';

const AsignarCasosPrueba = () => {
    const { external_id_proyecto } = useParams();
    const [showNewProjectModal, setShowNewProjectModal] = useState(false);
    const [casosPrueba, setCasosPrueba] = useState([]);
    const [selectedCases, setSelectedCases] = useState([]);
    const navigate = useNavigate();
    const usuario = getUser();
    const [infoProyecto,setProyecto] = useState([]);

    useEffect(() => {
        const fetchDataOut = async () => {
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
                const info = await peticionGet(getToken(), `caso/obtener/proyecto/${external_id_proyecto}`);
                if (info.code !== 200) {
                    mensajes(info.msg, 'error');
                    if (info.msg === 'Acceso denegado. Token ha expirado') {
                        borrarSesion();
                        navigate("/login");
                    }
                } else {
                    setCasosPrueba(info.info);
                }
            } catch (error) {
                console.error('Error en la solicitud:', error);
                mensajes("Error al cargar los datos: " + error.message, 'error');
            }
        };

        fetchDataOut();
    }, [external_id_proyecto, navigate]);
    
    const handleShowNewProjectModal = () => {
        setShowNewProjectModal(true);
    };

    const handleCheckboxChange = (id) => {
        setSelectedCases((prevSelected) => {
            if (prevSelected.includes(id)) {
                return prevSelected.filter(selectedId => selectedId !== id);
            } else {
                return [...prevSelected, id];
            }
        });
    };

    return (
        <div>
            <div className='contenedor-fluid'>
                <div className='contenedor-centro'>
                    <div className="contenedor-carta">
                    <p className="titulo-proyecto">{infoProyecto.nombre}</p>
                        <div className='contenedor-filo'>
                            <Button
                                className="btn-login"
                                onClick={handleShowNewProjectModal}
                                disabled={selectedCases.length === 0}
                            >
                                <FontAwesomeIcon icon={faPlus} /> Asignar tester
                            </Button>
                        </div>
                        <p className="titulo-primario">Casos de Prueba</p>
                        {casosPrueba.length === 0 ? (
                            <div className="text-center">
                                <p className="text-muted">No hay casos de prueba por asignar</p>
                            </div>
                        ) : (
                            <div className="row g-1">
                                {casosPrueba.map((casoPrueba) => {
                                    const isSelected = selectedCases.includes(casoPrueba.external_id);
                                    return (
                                        <div className="col-md-4" key={casoPrueba.id}>
                                            <div className={`card border-light ${isSelected ? 'card-selected' : ''}`} style={{ margin: '15px' }}>
                                                <div className="card-header d-flex justify-content-between align-items-center">
                                                    <span style={{ fontWeight: 'bold' }}>Seleccionar</span>
                                                    <input
                                                        type="checkbox"
                                                        className="custom-checkbox"
                                                        checked={isSelected}
                                                        onChange={() => handleCheckboxChange(casoPrueba.external_id)}
                                                    />
                                                </div>
                                                <div className="card-body">
                                                    <h5 className="card-title"><strong>{casoPrueba.nombre}</strong></h5>
                                                    <div style={{ textAlign: 'left', marginLeft: '15px' }}>
                                                        <li className="card-text"><strong>Descripción:</strong> {casoPrueba.descripcion}</li>
                                                        <li className="card-text"><strong>Clasificación:</strong> {casoPrueba.clasificacion}</li>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            

            {/* Modal para asignar testers */}
            <AsignarTesterModal
                showModal={showNewProjectModal}
                setShowModal={setShowNewProjectModal}
                external_id_proyecto={external_id_proyecto}
                external_caso_prueba={selectedCases}
                usuario={usuario}
                setCasosPrueba={setCasosPrueba}
                navigate={navigate}
            />
        </div>
    );
};

export default AsignarCasosPrueba;
