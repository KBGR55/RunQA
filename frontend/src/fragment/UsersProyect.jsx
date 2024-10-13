import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import MenuBar from './MenuBar';
import { peticionGet, peticionDelete } from '../utilities/hooks/Conexion'; 
import { useNavigate } from 'react-router-dom';
import { getToken } from '../utilities/Sessionutil';
import mensajes from '../utilities/Mensajes';
import RoleDialog from './RoleDialog';

const UsersProyect = () => {
    const [data, setData] = useState([]);
    const [showModalAddMembers, setshowModalAddMembers] = useState(false);
    const [llUsuarios, setUsuarios] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [userIdToDelete, setUserIdToDelete] = useState(null); 
    const [externalId] = useState('bfcbc971-c893-4994-86a8-abd69d4a5903'); // ID del proyecto modificar yovin cuando tengas
    const navigate = useNavigate();

    useEffect(() => {
        if (!llUsuarios) {
            peticionGet(getToken(), `proyect/${externalId}`).then((info) => {
                if (info.code !== 200) {
                    mensajes(info.mensajes);
                    navigate("/principal");
                } else {
                    setData(info.info);
                }
            });
        }
    }, [llUsuarios, navigate, externalId]);

    const handleShowModal = (id) => {
        setUserIdToDelete(id); 
        setShowModal(true); 
    };

    const handleCloseModal = () => {
        setShowModal(false); 
        setUserIdToDelete(null); 
    };
    const handleShowModalAddMembers = () => {
        setshowModalAddMembers(true);
    };

    const handleCloseModalAddMembers = () => {
        setshowModalAddMembers(false);
    };

    const handleDeleteUser = async () => {
        try {
            const response = await peticionDelete(getToken(), `proyect/${externalId}/${userIdToDelete}`); 
            if (response.code === 200) {
                mensajes('Usuario eliminado exitosamente', 'success', 'Éxito');
                setData(data.filter(user => user.entidad.id !== userIdToDelete)); 
            } else {
                mensajes(response.mensajes, 'error', 'Error');
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
            <MenuBar />
            <div className="contenedor-centro">
                <div className='contenedor-carta'>
                    <div className="contenedor-filo">
                    <td className="text-center">
                        <Button className="btn-normal" onClick={handleShowModalAddMembers}>
                            <FontAwesomeIcon icon={faPlus} />
                           Asignar Miem bro
                        </Button>
                    </td>
                    <Modal show={showModalAddMembers} onHide={handleCloseModalAddMembers}>
                        <Modal.Header closeButton>
                            <Modal.Title className='titulo-primario'>Agregar miembros</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            {showModalAddMembers && <RoleDialog handleClose={handleCloseModalAddMembers} />}
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
                                                    <img src={"/images/users/" + user.foto} alt="Avatar" style={{ width: '50px', height: '50px' }} />
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

export default UsersProyect;
