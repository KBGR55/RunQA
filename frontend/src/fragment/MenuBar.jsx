import React, { useState, useEffect } from 'react';
import { Navbar, Dropdown } from 'react-bootstrap';
import { borrarSesion, getToken, getUser } from '../utilities/Sessionutil';
import { URLBASE } from '../utilities/hooks/Conexion';
import { useNavigate } from 'react-router';
import '../css/style.css';

const ManuBar = () => {
    const [nombreUsuario, setNombreUsuario] = useState('');
    const [fotoUsuario, setFotoUsuario] = useState('');
    const token = getToken();
    const navigate = useNavigate();

    useEffect(() => {
        const usuario = getUser();
        if (usuario) {
            setNombreUsuario(`${usuario.nombres.toUpperCase()} ${usuario.apellidos.toUpperCase()}`);
            setFotoUsuario(usuario.user.foto);
        }
    }, []);

    const handleCerrarSesion = () => {
        borrarSesion();
        navigate('/login');
    };

    return (
        <Navbar bg="dark" variant="dark" className="navbar">
            <div className='container-fluid justify-content-end'>
                {token && (
                    <Dropdown align="end">
                        <Dropdown.Toggle variant="link" id="dropdown-user" className="d-flex align-items-center p-0">
                            <img
                                src={fotoUsuario ? `${URLBASE}/images/users/${fotoUsuario}` : '/img/logo512.png'}
                                alt="FotoUsuario"
                                className="rounded-circle"
                                style={{ width: '40px', height: '40px', marginRight: '10px' }}
                            />
                            <span className="text-white">{nombreUsuario}</span>
                        </Dropdown.Toggle>

                        <Dropdown.Menu align="end" style={{ position: 'absolute', zIndex: '1000' }}>
                            <Dropdown.Item href="/perfil">Perfil</Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item onClick={handleCerrarSesion}>Cerrar sesión</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                )}
            </div>
        </Navbar>
    );
};

export default ManuBar;
