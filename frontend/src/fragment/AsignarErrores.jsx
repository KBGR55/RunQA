import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { peticionGet } from '../utilities/hooks/Conexion';
import { useParams, useNavigate } from 'react-router-dom';
import { borrarSesion, getToken, getUser } from '../utilities/Sessionutil';
import  {mensajes}  from '../utilities/Mensajes';
import 'react-datepicker/dist/react-datepicker.css';
import ModalAsignarDesarrollador from './ModalAsignarDesarrollador';

const AsignarErrores = () => {
    const { external_id_proyecto } = useParams();
    const [showModalDesarrollador, setShowModalDesarrollador] = useState(false);
    const [error, setErrores] = useState([]);
    const [selectedError, setSelectedErrors] = useState([]);
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
                const info = await peticionGet(getToken(), `/error/obtener/proyecto/${external_id_proyecto}`);
                if (info.code !== 200) {
                    mensajes(info.msg, 'warning', 'Advertencia');
                    if (info.msg === 'Acceso denegado. Token ha expirado') {
                        borrarSesion();
                        navigate("/login");
                    }
                } else {
                    setErrores(info.info);
                }
            } catch (error) {
                console.error('Error en la solicitud:', error);
                mensajes("Error al cargar los datos: " + error.message, 'error');
            }
        };

        fetchDataOut();
    }, [external_id_proyecto, navigate]);
    
    const handleShowNewProjectModal = () => {
        setShowModalDesarrollador(true);
    };

    const handleCheckboxChange = (id) => {
        setSelectedErrors((prevSelected) => {
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
                                disabled={selectedError.length === 0}
                            >
                                <FontAwesomeIcon icon={faPlus} /> Asignar desarrollador
                            </Button>
                        </div>
                        <p className="titulo-primario">Errores registrados</p>
                        {error.length === 0 ? (
                            <div className="text-center">
                                <p className="text-muted">No hay errores registrados por asignar</p>
                            </div>
                        ) : (
                            <div className="row g-1">
                                {error.map((error) => {
                                    const isSelected = selectedError.includes(error.id);
                                    return (
                                        <div className="col-md-4" key={error.id}>
                                            <div className={`card border-light ${isSelected ? 'card-selected' : ''}`} style={{ margin: '15px' }}>
                                                <div className="card-header d-flex justify-content-between align-items-center">
                                                    <span style={{ fontWeight: 'bold' }}>Seleccionar</span>
                                                    <input
                                                        type="checkbox"
                                                        className="custom-checkbox"
                                                        checked={isSelected}
                                                        onChange={() => handleCheckboxChange(error.id)}
                                                    />
                                                </div>
                                                <div className="card-body">
                                                    <h5 className="card-title"><strong>{error.titulo}</strong></h5>
                                                    <div style={{ textAlign: 'left', marginLeft: '15px' }}>
                                                        <li className="card-text"><strong>Descripción:</strong> {error.descripcion}</li>
                                                        <li className="card-text"><strong>Severidad:</strong> {error.severidad}</li>
                                                        <li className="card-text"><strong>Prioridad:</strong> {error.prioridad}</li>
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
            <ModalAsignarDesarrollador
                showModalDesarrollador={showModalDesarrollador}
                setShowModalDesarrollador={setShowModalDesarrollador}
                external_id_proyecto={external_id_proyecto}
                external_error={selectedError}
                usuario={usuario}
                setErrores={setErrores}
                navigate={navigate}
            />
        </div>
    );
};

export default AsignarErrores;
