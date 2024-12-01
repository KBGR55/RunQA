import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { peticionGet } from '../utilities/hooks/Conexion';
import '../css/style.css';
import { useNavigate } from 'react-router-dom';
import { borrarSesion, getToken, getUser, saveExternalProyecto } from '../utilities/Sessionutil';
import mensajes from '../utilities/Mensajes';
import NuevoProyecto from './NuevoProyecto';

const ListaProyectos = () => {
    const [showNewProjectModal, setShowNewProjectModal] = useState(false);
    const [proyectos, setProyectos] = useState([]);
    const [rolLider, setRolLider] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProyectos = async () => {
            try {
                const info = await peticionGet(getToken(), `rol_proyecto/listar/proyectos?id_entidad=${getUser().user.id}`);
                if (info.code !== 200 && info.msg === 'Acceso denegado. Token a expirado') {
                    borrarSesion();
                    mensajes(info.mensajes);
                    navigate("/main");
                } else if (info.code === 200) {
                    setProyectos(info.info);
                    console.log("4444444", info.info);
                    
                } else {
                    console.error('Error al obtener proyectos:', info.msg);
                }
            } catch (error) {
                console.error('Error en la solicitud:', error);
            }
        };
        const fetchRolesLiderCalidad= async () => {
            try {
                const info = await peticionGet(
                    getToken(),
                    `rol/entidad/obtener/lider?id_entidad=${getUser().user.id}`
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
    }, [navigate]);
    console.log('lit',rolLider);

    const handleShowNewProjectModal = () => {
        setShowNewProjectModal(true);
    };

    const handleCloseNewProjectModal = () => {
        setShowNewProjectModal(false);
    };

    const handleProjectClick = (proyecto) => {
        navigate(`/presentacion/${proyecto.external_id}`);
    };

    
    

    return (
        <div>
            <div className='contenedor-centro'>
                <div className="contenedor-carta">
                    { rolLider.length > 0 &&
                        <div className='contenedor-filo'>
                        <Button
                            className="btn-normal mb-3"
                            onClick={handleShowNewProjectModal}
                        >  <FontAwesomeIcon icon={faPlus} />  Crear Proyecto
                        </Button>
                    </div>
                    }
                    
                    <p className="titulo-primario">Lista de Proyectos</p>
                    {proyectos.length === 0 ? (
                        <div className="text-center">
                            <p className="text-muted">No hay proyectos registrados</p>
                        </div>
                    ) : (
                        <div className="row">
                            {proyectos.map((proyecto) => (
                                <div className="col-md-4 mb-4" onClick={() => handleProjectClick(proyecto)} key={proyecto.id}>
                                    <div className="card shadow h-100 py-2">
                                        <div className="card-body text-center">
                                            <h5 className="card-title">{proyecto.nombre}</h5>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div> 
                    )}
                </div>
            </div>
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