import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Offcanvas } from 'react-bootstrap';
import { borrarSesion, getToken, getUser } from '../utilities/Sessionutil';
import { useNavigate } from 'react-router';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';  
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../css/style.css';
import iconLogo from '../img/logo512.png';
import { URLBASE } from '../utilities/hooks/Conexion';

const MenuBar = () => {
    const [showOffcanvas, setShowOffcanvas] = useState(false);
    const [nombreUsuario, setNombreUsuario] = useState('');
    const [fotoUsuario, setFotoUsuario] = useState('');
    const token = getToken();

    useEffect(() => {
        const usuario = getUser();
        if (usuario) {
            setNombreUsuario(`${usuario.nombres.toUpperCase()} ${usuario.apellidos.toUpperCase()}`);
            setFotoUsuario(usuario.user.foto);
        }
    }, []);

    return (
        <Navbar expand="lg" className="fondo-principal navbar navbar-expand-lg text-white">
            <div className='container-fluid'>
                <Navbar.Toggle className="navbar-toggler" aria-controls="offcanvasNavbar" onClick={() => setShowOffcanvas(!showOffcanvas)} />
                <div className="collapse navbar-collapse titulo-terciario justify-content-start" id="accordionSidebar">
                    <NavLink classNameNav="navbar-nav accordion" />
                </div>
                <Offcanvas className="fondo-principal" show={showOffcanvas} onHide={() => setShowOffcanvas(false)} placement="end" target="#offcanvasNavbar">
                    <Offcanvas.Header closeButton>
                        <Offcanvas.Title>OPCIONES</Offcanvas.Title>
                    </Offcanvas.Header>
                    <Offcanvas.Body className="offcanvas-body">
                        <NavLink classNameNav="navbar-nav justify-content-end flex-grow-1 pe-3" />
                    </Offcanvas.Body>
                </Offcanvas>
                {token && (
                    <div className="d-flex align-items-center ms-auto">
                        <img
                            src={fotoUsuario ? `${URLBASE}/images/users/${fotoUsuario}` : iconLogo}
                            alt="FotoUsuario"
                            className="rounded-circle"
                            style={{ width: '40px', height: '40px', marginRight: '10px' }}
                        />
                        <span style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
                            {nombreUsuario}
                        </span>
                    </div>
                )}
            </div>
        </Navbar>
    );
};

const navLinkStyle = {
    marginRight: '10px',
    color: 'white',
    textDecoration: 'none',
};

const NavLink = () => {
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState(false);
    const token = getToken();

    const handleCerrarSesion = () => {
        borrarSesion();
        navigate('/');
    };

    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
    };

    return (
        <Nav className='text-white'>
            <Nav.Link href="/main" style={navLinkStyle}><i className="fas fa-home"></i> Inicio</Nav.Link>
            <Nav.Link href="/usuarios" style={navLinkStyle}><i className="fas fa-book"></i> Gestionar Usuarios</Nav.Link>
            <Nav.Link href='/proyectos' style={navLinkStyle}>Proyectos</Nav.Link>
            {token && (
                <Nav.Link href="/perfil" style={navLinkStyle}><i className="fas fa-user"></i> Perfil</Nav.Link>
            )}
            {!token && (
                <li className="nav-item dropdown" onClick={toggleDropdown}>
                    <span className="nav-link" style={navLinkStyle}><i className="fas fa-user-circle"></i> Mi cuenta</span>
                    <ul 
                        className={`dropdown-menu ${showDropdown ? 'show' : ''}`} 
                        style={{ backgroundColor: 'var(--color-cuarto)' }}
                    >
                        <Nav.Link 
                            href="/registro" 
                            className="dropdown-item" 
                            style={{ ...navLinkStyle, color: 'white' }} 
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-terciario)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-cuarto)'}
                        >
                            <i className="fas fa-user-plus"></i> Registrarse
                        </Nav.Link>
                        <Nav.Link 
                            href="/iniciar-sesion" 
                            className="dropdown-item" 
                            style={{ ...navLinkStyle, color: 'white' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-terciario)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-cuarto)'}
                        >
                            <i className="fas fa-sign-in-alt"></i> Iniciar sesión
                        </Nav.Link>
                    </ul>
                </li>
            )}
            {token && (
                <Nav.Link href="/" onClick={handleCerrarSesion} style={navLinkStyle}><i className="fas fa-sign-out-alt"></i> Cerrar sesión</Nav.Link>
            )}
        </Nav>
    );
};

export default MenuBar;
