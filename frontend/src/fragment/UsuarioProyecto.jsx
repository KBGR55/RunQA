import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { peticionGet, peticionDelete, URLBASE } from '../utilities/hooks/Conexion';
import { useNavigate, useParams } from 'react-router-dom';
import { getToken } from '../utilities/Sessionutil';
import mensajes from '../utilities/Mensajes';
import RoleDialog from './RoleDialog';

const UsuarioProyecto = () => {
    const [data, setData] = useState([]);
    const [showModalAddMembers, setShowModalAddMembers] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [userIdToDelete, setUserIdToDelete] = useState(null);
    const { external_id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const info = await peticionGet(getToken(), `proyecto/${external_id}`);
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

        fetchData();
    }, [navigate, external_id]);

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
            const response = await peticionDelete(getToken(), `proyecto/${external_id}/${userIdToDelete}`);
            if (response.code === 200) {
                mensajes('Usuario eliminado exitosamente', 'success', 'Éxito');
                setTimeout(() => {
                    window.location.reload();
                }, 1200);
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
    console.log(data);

    return (
        <div>
            <div className="contenedor-centro">
                <div className='contenedor-carta'>
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
                            {showModalAddMembers && <RoleDialog handleClose={handleCloseModalAddMembers} external_id={external_id} />}
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
                                            <th className="text-center"> </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.map((user) => (
                                            <tr key={user.id}>
                                                <td className="text-center" style={{ backgroundColor: "#FFFFFF", border: "none" }}>
                                                    <img src={URLBASE + "/images/users/" + user.entidad.foto} alt="Avatar" style={{ width: '30px', height: '30px' }} />
                                                </td>
                                                <td className="text-center">{user.entidad.nombres}</td>
                                                <td className="text-center">{user.entidad.apellidos}</td>
                                                <td className="text-center">{user.rol.nombre}</td>
                                                <td className="text-center">
                                                    <Button className="btn btn-danger" onClick={() => handleShowModal(user.entidad.id)}>
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