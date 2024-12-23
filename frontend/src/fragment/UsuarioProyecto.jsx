import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { peticionGet, peticionDelete, URLBASE } from '../utilities/hooks/Conexion';
import { useNavigate, useParams } from 'react-router-dom';
import { getToken, borrarSesion, getUser } from '../utilities/Sessionutil';
import mensajes from '../utilities/Mensajes';
import RoleDialog from './RoleDialog';

const UsuarioProyecto = () => {
    const [data, setData] = useState([]);
    const [showModalAddMembers, setShowModalAddMembers] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [rolLider, setRolLider] = useState([]);
    const [userIdToDelete, setUserIdToDelete] = useState(null);
    const { external_id_proyecto } = useParams();
    const [infoProyecto, setProyecto] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
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
                const info = await peticionGet(getToken(), `proyecto/${external_id_proyecto}`);
                if (info.code !== 200) {
                    mensajes(info.msg || 'Error al obtener datos del proyecto');
                    navigate("/main");
                } else {
                    setData(info.info);
                }
            } catch (error) {
                mensajes(error.message || 'Error al hacer la petición');
            }
        };

        const fetchRolesLiderCalidad = async () => {
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

        fetchData();
    }, [navigate, external_id_proyecto]);

    const handleShowModal = (id) => {
        setUserIdToDelete(id);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setUserIdToDelete(null);
    };

    const handleShowModalAddMembers = () => {
        setShowModalAddMembers(true);
    };

    const handleCloseModalAddMembers = () => {
        setShowModalAddMembers(false);
    };

    const handleDeleteUser = async () => {
        try {
            const response = await peticionDelete(getToken(), `proyecto/${external_id_proyecto}/${userIdToDelete}`);
            if (response.code === 200) {
                mensajes('Usuario eliminado exitosamente', 'success', 'Éxito');
                setTimeout(() => {
                    window.location.reload();
                }, 5000);
            } else {
                mensajes(response.msg || 'Error al eliminar usuario', 'error', 'Error');
            }
        } catch (error) {
            console.error("Error al eliminar usuario:", error);
            mensajes('Error al eliminar usuario', 'error', 'Error');
        } finally {
            handleCloseModal();
        }
    };

    return (
        <div>
            <div className="contenedor-centro">
                <div className='contenedor-carta'>
                    <p className="titulo-proyecto">  Proyecto "{infoProyecto.nombre}"</p>
                    <div className="contenedor-filo">
                        <td className="text-center">
                            <Button className="btn-normal" onClick={handleShowModalAddMembers}>
                                <FontAwesomeIcon icon={faPlus} />
                                Asignar Miembros
                            </Button>
                        </td>
                        <Modal show={showModalAddMembers} onHide={handleCloseModalAddMembers}>
                            <Modal.Header closeButton>
                                <Modal.Title className='titulo-primario'>Agregar miembros</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                {showModalAddMembers && <RoleDialog handleClose={handleCloseModalAddMembers} external_id={external_id_proyecto} />}
                            </Modal.Body>
                        </Modal>
                    </div>

                    <main className="table">
                        <section className='table_header'>
                            <h1 className="titulo-primario">Lista de Usuarios</h1>
                        </section>
                        <section className='table_body'>
                            <div className="table-responsive">
                                <table className="table table-striped">
                                    <thead>
                                        <tr>
                                            <th className="text-center">Avatar</th>
                                            <th className="text-center">Nombres</th>
                                            <th className="text-center">Apellidos</th>
                                            <th className="text-center">Rol</th>
                                            <th className="text-center">Horas diarias</th>
                                            <th className="text-center"> </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.map((user) => (
                                            <tr key={user.id}>
                                                <td className="text-center" style={{ backgroundColor: "#FFFFFF", border: "none" }}>
                                                    <img src={URLBASE + "/images/users/" + user.rol_entidad.entidad.foto} alt="Avatar" style={{ width: '30px', height: '30px' }} />
                                                </td>
                                                <td className="text-center">{user.rol_entidad.entidad.nombres}</td>
                                                <td className="text-center">{user.rol_entidad.entidad.apellidos}</td>
                                                <td className="text-center">{user.rol_entidad.rol.nombre}</td>
                                                <td className="text-center">{user.horasDiarias}</td>
                                                <td className="text-center">
                                                    <Button
                                                        className="btn btn-danger"
                                                        disabled={rolLider && rolLider[0] && rolLider[0].nombre === user.rol_entidad.rol.nombre}
                                                        onClick={() => handleShowModal(user.rol_entidad.entidad.id)}
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </Button>


                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </main>
                </div>
            </div>
            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmación de Eliminación</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    ¿Estás seguro de que deseas eliminar este usuario?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Cancelar
                    </Button>
                    <Button variant="danger" onClick={handleDeleteUser}>
                        Eliminar
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default UsuarioProyecto;