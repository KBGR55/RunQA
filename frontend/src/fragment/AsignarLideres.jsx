import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Form } from 'react-bootstrap';
import { peticionGet, peticionPost, URLBASE } from '../utilities/hooks/Conexion';
import { useNavigate, useParams } from 'react-router-dom';
import { getToken } from '../utilities/Sessionutil';
import mensajes from '../utilities/Mensajes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCheck, faTrash } from '@fortawesome/free-solid-svg-icons';
import swal from 'sweetalert';

const AsignarLideres = () => {
    const { external_id } = useParams();
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const navigate = useNavigate();
    
    const handleSearchTermChange = (e) => {
        setSearchTerm(e.target.value);
    };

    useEffect(() => {
        fetchUsersByName(searchTerm);
    }, [searchTerm]);

    const addUser = (user) => {
        if (!users.some(u => u.id === user.id)) {
            setUsers([...users, user]);
        }
        setShowDropdown(false);
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

    const handleAsignarLideres = async () => {
        const body = {
            lideres: users.map(l => ({ id_entidad: l.id }))
        };

        try {
            const response = await peticionPost(getToken(), 'asignar/lideres', body);
            if (response.code === 200) {
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
                mensajes(response.msg);
            } else {
                mensajes(response.msg, 'error');
            }
        } catch (error) {
            console.error('Error al asignar líderes:', error);
        }
    };

    const handleCancelClick = () => {
        swal({
            title: "¿Está seguro de cancelar la asignación de lideres?",
            text: "Una vez cancelado, no podrá revertir esta acción",
            icon: "warning",
            buttons: ["No", "Sí"],
            dangerMode: true,
        }).then((willCancel) => {
            if (willCancel) {
                mensajes("Asignación cancelada", "info", "Información");
                navigate('/usuarios');
            }
        });
    };
    const removeUser = (id) => {
        setUsers(users.filter((user) => user.id !== id));
    };

    return (
        <div>
            <div className='contenedor-fluid'>
                <div className="contenedor-carta">
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
                        <ul className="dropdown-menu show contenedor-filo"  >
                            {searchResults.map((user, index) => (
                                <li key={index} className="dropdown-item" onClick={() => addUser(user)}>
                                    <img src={URLBASE + "images/users/" + user.foto} className='imagen-pequena' />
                                    <strong> {user.nombres + ' ' + user.apellidos}</strong>
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
                            <img src={URLBASE + "images/users/" + user.foto} className="imagen-pequena" alt="Avatar" />
                                    <p className="margen-usuarios-pequenos">
                                        <strong>{user.nombres + ' ' + user.apellidos}</strong>
                                    </p>
                                   
                            </div>

                            <button
                                className="btn btn-danger boton-eliminar-pequeno"
                                onClick={() => removeUser(user.id)}
                            >
                                <FontAwesomeIcon icon={faTrash} />
                            </button>
                        </div>
                    ))}
                </div>

                    <div className='contenedor-filo'>
                        <Button variant="secondary" className="btn-negativo" onClick={handleCancelClick}>
                            <FontAwesomeIcon icon={faTimes} /> Cancelar
                        </Button>
                        <Button className="btn-positivo" onClick={handleAsignarLideres}>
                            <FontAwesomeIcon icon={faCheck} /> Aceptar
                        </Button>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default AsignarLideres;
