import React, { useState, useEffect } from 'react';
import { Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/style.css';
import { peticionGet, peticionPost, URLBASE } from '../utilities/hooks/Conexion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';
import mensajes from '../utilities/Mensajes';
import { borrarSesion, getToken } from '../utilities/Sessionutil';
import { Navigate } from 'react-router-dom';

const RoleDialog = ({ handleClose, external_id }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [selectedRole, setSelectedRole] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [horasDiarias, setHorasDiarias] = useState(2);

    const handleAssignRole = async () => {
        if (!selectedRole || users.length === 0) {
            mensajes('Faltan campos obligatorios', 'error', 'Error');
            return;
        }

        const datos = {
            id_proyect: external_id,
            users: users.map(user => ({ id_entidad: user.id })),
            horasDiarias: horasDiarias,
            id_rol: selectedRole,
        };

        try {
            const response = await peticionPost(getToken(), 'proyecto/asignar', datos);
            if (response.code !== 200) {
                mensajes(response.msg, 'error', 'Error');
            } else {
                mensajes(response.msg, 'success', 'Éxito');
                setTimeout(() => {
                    window.location.reload();
                }, 1200);
            }
        } catch (error) {
            console.error("Error al asignar roles:", error);
        }
        handleClose();
    };

    const fetchRoles = async () => {
        try {
            const info = await peticionGet(getToken(), 'rol/listar');
            if (info.code !== 200 && info.msg === 'Acceso denegado. Token a expirado') {
                borrarSesion();
                mensajes(info.mensajes);
                Navigate("/login");
            } else if (info.code === 200) {
                setRoles(info.info);
            } else {
                console.error('Error al obtener roles:', info.msg);
            }
        } catch (error) {
            console.error('Error en la solicitud:', error);
        }
    };

    const fetchUsersByName = async (name) => {
        if (!name) {
            setSearchResults([]);
            setShowDropdown(false);
            return;
        }

        try {
            const response = await peticionGet(getToken(), `cuenta/${name}`);
            if (response.info && response.info.length > 0) {
                setSearchResults(response.info);
                setShowDropdown(true);
            } else {
                setShowDropdown(false);
            }
        } catch (error) {
            console.error("Error al buscar usuarios:", error);
        }
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    useEffect(() => {
        fetchUsersByName(searchTerm);
    }, [searchTerm]);

    const handleSearchTermChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const addUser = (user) => {
        if (!users.some(u => u.id === user.id)) {
            setUsers([...users, user]);
        }
        setShowDropdown(false);
    };

    const removeUser = (id) => {
        setUsers(users.filter((user) => user.id !== id));
    };

    return (
        <div className='contenedor-carta'>
            <Form>
                <Form.Group className="mb-3" controlId="userSearch">
                    <Form.Label>Buscar Persona</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Ingrese el nombre de la persona"
                        value={searchTerm}
                        onChange={handleSearchTermChange}
                        autoComplete="off"
                    />
                    {showDropdown && (
                        <ul className="dropdown-menu show contenedor-filo">
                            {searchResults.map((user, index) => (
                                <li key={index} className="dropdown-item" onClick={() => addUser(user)}>
                                    <img src={URLBASE + "/images/users/" + user.foto} className='imagen-pequena' alt="User" />
                                    <strong>{user.nombres + ' ' + user.apellidos}</strong>
                                    <p className='margen-usuarios-pequenos'>{user.direccion}</p>
                                </li>
                            ))}
                        </ul>
                    )}
                </Form.Group>

                <div className="users-container">
                    {users.map((user, index) => (
                        <div key={index} className="box-of-users">
                            <div className="user-container">
                                <img src={URLBASE + "/images/users/" + user.foto} className="imagen-pequena" alt="Avatar" />
                                <p className="margen-usuarios-pequenos">
                                    <strong>{user.nombres + ' ' + user.apellidos}</strong>
                                </p>
                            </div>
                            <button
                                type="button"
                                className="btn btn-danger boton-eliminar-pequeno"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    removeUser(user.id);
                                }}
                            >
                                <FontAwesomeIcon icon={faTrash} />
                            </button>
                        </div>
                    ))}
                </div>

                <Form.Group className="mb-3" controlId="roleSelect">
                    <Form.Label>Seleccionar Rol</Form.Label>
                    <Form.Control as="select" onChange={(e) => setSelectedRole(e.target.value)}>
                        <option value="">Selecciona un rol</option>
                        {roles.map((role) => (
                            <option key={role.external_id} value={role.external_id}>
                                {role.nombre}
                            </option>
                        ))}
                    </Form.Control>
                </Form.Group>

                <Form.Group className="mb-3" controlId="horasDiariasInput">
                    <Form.Label>Horas Diarias</Form.Label>
                    <Form.Control
                        type="number"
                        value={horasDiarias}
                        onChange={(e) => setHorasDiarias(Number(e.target.value))}
                        min="2"
                        max="8"
                        onKeyDown={(e) => e.preventDefault()}
                    />
                </Form.Group>

                <Form.Group className="contenedor-filo">
                    <button type="button" onClick={handleClose} className="btn-negativo">
                        <FontAwesomeIcon icon={faTimes} /> Cancelar
                    </button>
                    <button
                        type="button"
                        className="btn-positivo"
                        onClick={handleAssignRole}
                    >
                        <FontAwesomeIcon icon={faCheck} /> Asignar
                    </button>
                </Form.Group>
            </Form>
        </div>
    );
};

export default RoleDialog;