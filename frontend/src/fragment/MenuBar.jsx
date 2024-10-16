import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Offcanvas } from 'react-bootstrap';
import { borrarSesion, getToken, getUser } from '../utilities/Sessionutil';
import { useNavigate, useParams } from 'react-router';
import { peticionGet } from '../utilities/hooks/Conexion';
import ListaCasoPrueba from './ListaCasoPrueba'; 
import '../css/style.css'; 
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';  
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../css/style.css';
import { URLBASE } from '../utilities/hooks/Conexion';
import mensajes from '../utilities/Mensajes';

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
    const navigate = useNavigate();
    const [roles, setRoles] = useState([]);
    const [proyecto, setProyecto] = useState({});
    const [showListaCasoPrueba, setShowListaCasoPrueba] = useState(false); // Nuevo estado para controlar la visualización de ListaCasoPrueba
    const { external_id } = useParams(); 

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const info = await peticionGet(
                    getToken(), 
                    `rol_proyecto/listar/entidad?id_entidad=${getUser().user.id}&external_id_proyecto=${external_id}`
                );
                if (info.code !== 200 && info.msg === 'Acceso denegado. Token ha expirado') {
                    borrarSesion();
                    mensajes(info.mensajes);
                    navigate("/main");
                } else if (info.code === 200) {
                    setRoles(info.info.roles);
                    setProyecto(info.info.proyecto);
                } else {
                    console.error('Error al obtener roles:', info.msg);
                }
            } catch (error) {
                console.error('Error en la solicitud:', error);
            }
        };
        fetchRoles();
    }, [external_id, navigate]);

    const formatDate = (dateString) => {
        if (!dateString) {
            return 'Fecha no disponible';
        }
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return 'Fecha no válida';
        }
        return date.toISOString().slice(0, 10);
    };

    const roleOptions = {
        'GERENTE DE PRUEBAS': [
            'Crear proyectos',
            'Asignar testers, analistas y desarrolladores',
            'Generar reportes',
            'Casos de prueba',
            'Matriz de errores',
            'Gestionar usuarios'
        ],
        'ANALISTA DE PRUEBAS': [
            'Casos de prueba',
            'Asignar errores a desarrolladores',
            'Consultar estado de pruebas y errores'
        ],
        'TESTER': [
            'Ejecutar casos de prueba',
            'Registrar errores',
            'Consultar el estado de errores'
        ],
        'DESARROLLADOR': [
            'Actualizar el estado de los errores',
            'Consultar errores asignados'
        ]
    };

    const roleIcons = {
        'GERENTE DE PRUEBAS': 'bi bi-briefcase-fill',
        'ANALISTA DE PRUEBAS': 'bi bi-card-checklist', 
        'TESTER': 'bi bi-bug-fill',
        'DESARROLLADOR': 'bi bi-code-slash' 
    };

    const handleOptionClick = (option) => {
        if (option === 'Casos de prueba') {
            setShowListaCasoPrueba(true);
        }
    };

    return (
        <div className=''>
        <Navbar className="navbar-nav fondo-principal accordion" id="accordionSidebar">
            <div className='container-fluid'>
                <Navbar.Toggle className="navbar-toggler" aria-controls="offcanvasNavbar" onClick={() => setShowOffcanvas(!showOffcanvas)} />
                <div className="collapse navbar-collapse titulo-terciario justify-content-start" id="accordionSidebar">
                <div className="d-flex">
                    <NavLink className="navbar-nav fondo-principal accordion" id="accordionSidebar"> </NavLink>
                    </div>
                </div>
                {token && (
                    <div className="d-flex align-items-center ms-auto">
                        <img
                            src={fotoUsuario ? `${URLBASE}/images/users/${fotoUsuario}` : '/img/logo512.png'}
                            alt="FotoUsuario"
                            className="rounded-circle"
                            style={{ width: '40px', height: '40px', marginRight: '10px' }}
                        />
                        <span style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
                            {nombreUsuario}
                        </span>
                    </div>
                )}
                <Offcanvas className="fondo-principal " show={showOffcanvas} onHide={() => setShowOffcanvas(false)} placement="end" target="#offcanvasNavbar">
                    <Offcanvas.Header closeButton>
                        <Offcanvas.Title>OPCIONES</Offcanvas.Title>
                    </Offcanvas.Header>
                    <Offcanvas.Body className="offcanvas-body">
                        <NavLink classNameNav="navbar-nav justify-content-end flex-grow-1 pe-3" />
                    </Offcanvas.Body>
                </Offcanvas>
               
            </div>
        </Navbar>
        <div className="d-flex">
                <nav className="navbar-nav fondo-principal accordion" id="accordionSidebar">
                    <div className="text-center mt-3 mb-4">
                        <img src="/img/logo192.png" alt="Logo" className="img-fluid" style={{ width: '150px' }} />
                    </div>
                    <div className="sidebar-heading">
                        Roles del Proyecto 
                        <p>{proyecto.nombre}</p>
                    </div>
                    <ul className="navbar-nav">
                        {roles.map((role) => (
                            <li className="mb-1" key={role.id}>
                                <button 
                                    style={{ color: 'white' }} 
                                    className="btn collapsed d-flex align-items-center" 
                                    data-bs-toggle="collapse" 
                                    data-bs-target={`#role-${role.id}`} 
                                    aria-expanded="false">
                                    <i className={`${roleIcons[role.nombre]} me-2`}></i>
                                    {role.nombre}
                                </button>
                                <div className=" collapse" id={`role-${role.id}`}>
                                    <ul className="btn-toggle-nav list-unstyled fw-normal pb-1 small">
                                        {roleOptions[role.nombre] ? (
                                            roleOptions[role.nombre].map((option, index) => (
                                                <li key={index}>
                                                    <a
                                                        href="#"
                                                        className="link-dark rounded"
                                                        onClick={() => handleOptionClick(option)} // Maneja el click de la opción
                                                    >
                                                        {option}
                                                    </a>
                                                </li>
                                            ))
                                        ) : (
                                            <li>
                                                <a href="#" className="link-dark rounded">Opciones no disponibles.</a>
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            </li>
                        ))}
                    </ul>

                    <hr className="sidebar-divider" />
                </nav>
                {showListaCasoPrueba && <ListaCasoPrueba proyecto={proyecto}/>}
            </div>
        </div>
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
