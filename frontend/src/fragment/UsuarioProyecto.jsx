import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
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
    const [showModalEditHours, setShowModalEditHours] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [newHours, setNewHours] = useState(0);

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
                console.log(data);
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

    /**
     * Función que se encarga de eliminar un usuario de un proyecto.
     * @function
     * @param {number} userIdToDelete - El id del usuario que se va a eliminar.
     * @returns {Promise<void>}
     * @throws Si ocurre un error al eliminar el usuario.
     */
    const handleDeleteUser = async () => {
        console.log('handleDeleteUser', userIdToDelete);
        try {
            const response = await peticionDelete(getToken(), `proyecto/${external_id_proyecto}/${userIdToDelete}`);
            if (response.code === 200) {
                mensajes('Usuario eliminado exitosamente', 'success', 'Éxito');
                setData((prevData) => prevData.filter((user) => user.rol_entidad.entidad.id !== userIdToDelete));
                const updatedData = await peticionGet(getToken(), `proyecto/${external_id_proyecto}`);
                if (updatedData.code === 200) {
                    setData(updatedData.info); 
                }
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
    

    const handleShowModalEditHours = (user) => {
        setSelectedUser(user);
        setNewHours(user.horasDiarias);
        setShowModalEditHours(true);
    };

    const handleCloseModalEditHours = () => {
        setShowModalEditHours(false);
        setSelectedUser(null);
    };

    const handleUpdateHours = async () => {
        try {
            const response = await peticionGet(getToken(), `proyecto/horas/cambiar/${selectedUser.rol_entidad.entidad.id}/${selectedUser.id}/${newHours}`);
            if (response.code === 200) {
                mensajes('Horas actualizadas exitosamente', 'success', 'Éxito');
                
                setData(prevData => {
                    return prevData.map(user =>
                        user.id === selectedUser.id
                            ? { ...user, horasDiarias: newHours }
                            : user
                    );
                });
            } else {
                mensajes(response.msg || 'Error al actualizar las horas', 'error', 'Error');
            }
        } catch (error) {
            console.error("Error al actualizar las horas:", error);
            mensajes('Error al actualizar las horas', 'error', 'Error');
        } finally {
            handleCloseModalEditHours();
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
                                            <th className="text-center">Modificar horas</th>
                                            <th className="text-center">Eliminar</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.map((user) => (
                                            <tr key={user.id}>
                                                <td className="text-center" style={{ backgroundColor: "#FFFFFF", border: "none" }}>
                                                    <img src={URLBASE + "images/users/" + user.rol_entidad.entidad.foto} alt="Avatar" style={{ width: '30px', height: '30px' }} />
                                                </td>
                                                <td className="text-center">{user.rol_entidad.entidad.nombres}</td>
                                                <td className="text-center">{user.rol_entidad.entidad.apellidos}</td>
                                                <td className="text-center">{user.rol_entidad.rol.nombre}</td>
                                                <td className="text-center">{user.horasDiarias}</td>
                                                <td className="text-center">
                                                    <Button
                                                        className="btn-icon" style={{ backgroundColor: '#608BC1' }}
                                                        onClick={() => handleShowModalEditHours(user)}
                                                    >
                                                        <FontAwesomeIcon icon={faEdit} />
                                                    </Button>
                                                </td>
                                                <td className="text-center">
                                                    <Button
                                                        className="btn btn-danger"
                                                        disabled={rolLider && rolLider[0] && rolLider[0].nombre === user.rol_entidad.rol.nombre}
                                                        onClick={() => handleShowModal(user.id)}
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

            <Modal show={showModalEditHours} onHide={handleCloseModalEditHours}>
                <Modal.Header closeButton>
                    <Modal.Title>Modificar Horas Diarias</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <label htmlFor="newHours" className="form-label">Horas diarias:</label>
                    <input
                        type="number"
                        id="newHours"
                        className="form-control"
                        value={newHours}
                        onChange={(e) => setNewHours(Number(e.target.value))}
                        min="1"
                        max="24"
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModalEditHours}>
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={handleUpdateHours}>
                        Guardar
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default UsuarioProyecto;
