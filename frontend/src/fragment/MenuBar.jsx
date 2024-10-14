import React, { useState } from 'react';
import { Navbar, Nav, Offcanvas } from 'react-bootstrap';
import { borrarSesion, getRol, getToken } from '../utilities/Sessionutil';
import { useNavigate } from 'react-router';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/style.css';


const MenuBar = () => {
    const [showOffcanvas, setShowOffcanvas] = useState(false);

    return (
        <Navbar expand="lg" className={' fondo-principal navbar navbar-expand-lg'}>
            <div className='container-fluid'>
                <Navbar.Brand className='fondo-principal' href="/">RunQA</Navbar.Brand>
                <Navbar.Toggle className={'navbar-toggler'} aria-controls="offcanvasNavbar" onClick={() => setShowOffcanvas(!showOffcanvas)} />
                <div className={'collapse navbar-collapse contenedor-filo titulo-terciario'}>
                    <NavLink classNameNav="navbar-nav ms-auto mb-2 mb-lg-0" />
                </div>
                <Offcanvas className='fondo-principal' show={showOffcanvas} onHide={() => setShowOffcanvas(false)} placement="end" target="#offcanvasNavbar">
                    <Offcanvas.Header closeButton>
                        <Offcanvas.Title>OPCIONES</Offcanvas.Title>
                    </Offcanvas.Header>
                    <Offcanvas.Body className="offcanvas-body">
                        <NavLink classNameNav="navbar-nav justify-content-end flex-grow-1 pe-3" />
                    </Offcanvas.Body>
                </Offcanvas>
            </div>
        </Navbar>
    );
};

const navLinkStyle = {
    marginRight: '10px',
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
        <Nav className=''>
            <Nav.Link href="/" ><i className="fas fa-home"></i> Inicio</Nav.Link>

            <Nav.Link href="/create/book"  style={navLinkStyle}><i className="fas fa-book"></i>Opcion 1</Nav.Link>

            <Nav.Link href="/usuarios"  style={navLinkStyle}><i className="fas fa-book"></i>Gestionar Usuarios</Nav.Link>

            <Nav.Link href="/caso/prueba"  style={navLinkStyle}>Caso Prueba</Nav.Link>
            <Nav.Link href='/proyectos' style={navLinkStyle}>Proyectos</Nav.Link>
            {token && (<Nav.Link href="/perfil"  style={navLinkStyle}><i className="fas fa-user"></i> Perfil</Nav.Link>)}

            {getRol() === 'USUARIO' && <Nav.Link href="/api"  style={navLinkStyle}><i className="fas fa-code"></i> Opcion 2</Nav.Link>}
            {getRol() === 'ADMINISTRADOR' && <Nav.Link href="/comentarios"  style={navLinkStyle}><i className="fas fa-comments"></i> Opcion 3</Nav.Link>}
            {getRol() === 'ADMINISTRADOR' && <Nav.Link href="/peticion-api"  style={navLinkStyle}><i className="fas fa-users"></i>Opcion 4</Nav.Link>}
            {!token && (
                <li className="nav-item dropdown" onClick={toggleDropdown}>
                    <span className={`nav-link `} style={navLinkStyle}><i className="fas fa-user-circle"></i> Mi cuenta</span>
                    <ul className={` dropdown-menu ${showDropdown ? 'show' : ''}`}>
                        <Nav.Link href="/registro" className={`dropdown-item `} style={navLinkStyle}><i className="fas fa-user-plus"></i> Registrarse</Nav.Link>
                        <Nav.Link href="/iniciar-sesion" className={`dropdown-item `} style={navLinkStyle}><i className="fas fa-sign-in-alt"></i> Iniciar sesión</Nav.Link>
                    </ul>
                </li>
            )}
            {token && <Nav.Link href="/" onClick={handleCerrarSesion}  style={navLinkStyle}><i className="fas fa-sign-out-alt"></i> Cerrar sesión</Nav.Link>}
        </Nav>
    );
};

export default MenuBar;

