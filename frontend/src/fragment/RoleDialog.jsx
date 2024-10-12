import React, { useState, useEffect } from 'react';
import { Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/style.css';
import { peticionGet, peticionPost } from '../utilities/hooks/Conexion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';
import mensajes from '../utilities/Mensajes';

const RoleDialog = ({ handleClose }) => {
    const [selectedDate, setSelectedDate] = useState('');
    const [email, setEmail] = useState('');
    const [users, setUsers] = useState([]);  
    const [roles, setRoles] = useState([]);
    const [selectedRole, setSelectedRole] = useState('');

    const handleAssignRole = async () => {
        if (!selectedRole || users.length === 0) {
            mensajes('Faltan campos obligatorios', 'error', 'Error');
            return;
        }
    
        const datos = {
            id_proyect: 4,
            users: users.map(user => ({ id_entidad: user.id })),
            id_rol: selectedRole,
            owner: 1
        };
    
        try {
            const response = await peticionPost('key', 'proyect/assign', datos);
            if (response.code !== 200) {
                mensajes(response.msg, 'error', 'Error');
            } else {
                
                mensajes(response.msg, 'success', 'Éxito');
            }
        } catch (error) {
            console.error("Error al asignar roles:", error);
        }
        handleClose();
    };

    const fetchRoles = async () => {
        try {
            const response = await peticionGet('key', 'rol');
            console.log(response);
            setRoles(response.info);
        } catch (error) {
            console.error("Error al obtener los roles:", error);
        }
    };

    const fetchUserByEmail = async (email) => {
        // Verificar si el usuario ya está agregado
        const emailExists = users.some(user => user.correo === email);
        if (emailExists) {
            setEmail('');  // Limpiar el campo de correo
            return;
        }

        try {
            const response = await peticionGet('key', `cuenta/${email}`);
            if (response.info) {
                setUsers((prevUsers) => [...prevUsers, response.info]); // Agrega el usuario encontrado
                setEmail('');  
            } 
        } catch (error) {
            console.error("Error al buscar el usuario:", error);
        }
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    useEffect(() => {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailPattern.test(email)) {
            fetchUserByEmail(email);
        }
    }, [email]);

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    };

    const removeUser = (emailToRemove) => {
        setUsers(users.filter((user) => user.correo !== emailToRemove));
    };

    return (
        <div className='contenedor-carta'>
            <Form>
                <Form.Group className="mb-3" controlId="userEmail">
                    <Form.Label>Correo Electrónico</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Ingrese el correo electrónico"
                        value={email}
                        onChange={handleEmailChange}
                    />
                </Form.Group>

                <div className="users-container">
                    {users.map((user, index) => (
                        <div key={index} className="box-of-users">
                            <div>
                                <p style={{ margin: 0 }}><strong>{user.nombres + ' ' + user.apellidos}</strong></p>
                                <p style={{ margin: 0 }}>{user.correo}</p>
                            </div>
                            <button 
                                className="btn btn-danger" 
                                style={{ padding: '2px 5px', fontSize: '0.8rem' }}  
                                onClick={() => removeUser(user.correo)}
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
                
                <Form.Group className="contenedor-filo">
                    <button type="button" onClick={handleClose} className="btn-negativo">
                        <FontAwesomeIcon icon={faTimes} /> Cancelar
                    </button>
                    <button 
                        type="button" 
                        className="btn-positivo" 
                        onClick={handleAssignRole}
                        disabled={!selectedRole || users.length === 0}  // Deshabilitar el botón si no hay usuarios o rol
                    >
                        <FontAwesomeIcon icon={faCheck} /> Asignar
                    </button>
                </Form.Group>
            </Form>
        </div>
    );
};

export default RoleDialog;
