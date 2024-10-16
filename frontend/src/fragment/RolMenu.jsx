import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import mensajes from '../utilities/Mensajes';
import { borrarSesion, getToken, getUser } from '../utilities/Sessionutil';
import { peticionGet } from '../utilities/hooks/Conexion';
import ListaCasoPrueba from './ListaCasoPrueba'; 
import '../css/style.css'; 
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';  
import 'bootstrap-icons/font/bootstrap-icons.css';
import iconLogo from '../img/logo512.png';
import BarraMenu from './MenuBar';

const DetalleProyecto = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [roles, setRoles] = useState([]);
    const [proyecto, setProyecto] = useState({});
    const [showListaCasoPrueba, setShowListaCasoPrueba] = useState(false); // Nuevo estado para controlar la visualización de ListaCasoPrueba
    const { external_id } = location.state || {};

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
        <div>
              <BarraMenu />
            <div className="d-flex">
                {/* Sidebar */}
                <nav className="navbar-nav fondo-principal accordion" id="accordionSidebar">
                    <div className="text-center mt-3 mb-4">
                        <img src={iconLogo} alt="Logo" className="img-fluid" style={{ width: '150px' }} />
                    </div>
                    <div className="sidebar-heading">
                        Roles del Proyecto
                    </div>
                    <ul className="navbar-nav">
                        {roles.map((role) => (
                            <li className="mb-1" key={role.id}>
                                {/* Botón colapsable */}
                                <button 
                                    style={{ color: 'white' }} 
                                    className="btn collapsed d-flex align-items-center" 
                                    data-bs-toggle="collapse" 
                                    data-bs-target={`#role-${role.id}`} 
                                    aria-expanded="false">
                                    <i className={`${roleIcons[role.nombre]} me-2`}></i>
                                    {role.nombre}
                                </button>
                                {/* Contenido colapsable */}
                                <div className="collapse" id={`role-${role.id}`}>
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

                {/* Content */}
              
                {showListaCasoPrueba && <ListaCasoPrueba proyecto={proyecto}/>}
            </div>
        </div>
    );
};

export default DetalleProyecto;