import React, { useState, useEffect } from 'react';
import { Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/style.css';
import { peticionGet, peticionPost } from '../utilities/hooks/Conexion'; // Asegúrate de importar peticionPost
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import mensajes from '../utilities/Mensajes';

const RoleDialog = ({  handleClose }) => {
    const [selectedDate, setSelectedDate] = useState('');
    const [email, setEmail] = useState('');
    const [userInfo, setUserInfo] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [roles, setRoles] = useState([]);
    const [selectedRole, setSelectedRole] = useState(''); // Para almacenar el rol seleccionado

    const getTodayDate = () => {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    const handleAssignRole = async () => {
        if (!selectedRole || !userInfo) {
            return; 
        }

        const datos = {
            "id_proyect": 4, // Cambia esto al id del proyecto correspondiente
            "id_entidad": userInfo.id_entidad, // O el id correspondiente que necesites
            "id_rol": selectedRole,
            "owner": 1 // Cambia esto según corresponda
        };

        try {
            const response = await peticionPost("key", 'proyect/assign', datos);
            if (response.code !== 200) {
                mensajes(response.msg, "error", "Error");
            } else {
                mensajes(response.msg, "success", "Éxito");
                handleClose(); 
            }
        } catch (error) {
            console.error("Error al asignar rol:", error);
        }
    };

    const fetchRoles = async () => {
        try {
            const response = await peticionGet('key', 'rol');
            setRoles(response.info);
        } catch (error) {
            console.error("Error al obtener los roles:", error);
        }
    };

    const fetchUserByEmail = async (email) => {
        try {
            setIsSearching(true);
            // Simula la búsqueda de un usuario, aquí deberías hacer una petición a tu API.
            var datos = {
                "id_entidad": 2,
                "name": 'Juan Pérez',
                "email": 'juan.perez@example.com' // Esto debería ser el email real que buscas
            };
            setUserInfo(datos);
        } catch (error) {
            console.error("Error al buscar el usuario:", error);
            setUserInfo(null);
        } finally {
            setIsSearching(false);
        }
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    useEffect(() => {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailPattern.test(email)) {
            fetchUserByEmail(email);
        } else {
            setUserInfo(null);
        }
    }, [email]);

    return (
        <div className='contenedor-carta'>
            <Form>
                <Form.Group className="mb-3" controlId="userEmail">
                    <Form.Label>Correo Electrónico</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Ingrese el correo electrónico"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </Form.Group>
                {isSearching ? (
                    <p>Buscando usuario...</p>
                ) : userInfo ? (
                    <div className="user-info">
                        <p><strong>Nombre:</strong> {userInfo.name}</p>
                        <p><strong>Correo:</strong> {userInfo.email}</p>
                    </div>
                ) : (
                    email && <p>No se encontró información del usuario</p>
                )}

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
                <Form.Group className="mb-3" controlId="expirationDate">
                    <Form.Label>Fecha de Expiración del Rol</Form.Label>
                    <Form.Control
                        type="date"
                        min={getTodayDate()}
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                    />
                </Form.Group>
                <Form.Group className="contenedor-filo">
                    <button type="button" onClick={handleClose} className="btn-negativo">
                        <FontAwesomeIcon icon={faTimes} /> Cancelar
                    </button>
                    <button type="button" className="btn-positivo" onClick={handleAssignRole}>
                        <FontAwesomeIcon icon={faCheck} /> Asignar
                    </button>
                </Form.Group>
            </Form>
        </div>
    );
};

export default RoleDialog;
