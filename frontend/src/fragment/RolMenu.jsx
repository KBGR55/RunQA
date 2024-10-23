import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { peticionGet } from '../utilities/hooks/Conexion';
import { getToken, getUser, borrarSesion } from '../utilities/Sessionutil';
import { Button, Collapse } from 'react-bootstrap';
import mensajes from '../utilities/Mensajes';
import 'bootstrap-icons/font/bootstrap-icons.css';

const RoleMenu = () => {
    const [roles, setRoles] = useState([]);
    const [proyecto, setProyecto] = useState({});
    const [isOpen, setIsOpen] = useState(true); 
    const [activeMenu, setActiveMenu] = useState(null); 
    const { external_id } = useParams();
    const navigate = useNavigate();
    const [selectedRoleId, setSelectedRoleId] = useState(null);
    const [selectedOption, setSelectedOption] = useState('');

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

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setIsOpen(false);
            } else {
                setIsOpen(true); 
            }
        };

        handleResize();

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const roleOptions = {
        'GERENTE DE PRUEBAS': ['Crear proyectos', 'Asignar testers', 'Generar reportes', 'Casos de prueba', 'Miembros'],
        'ANALISTA DE PRUEBAS': ['Casos de prueba', 'Asignar testers', 'Consultar estado de pruebas'],
        'TESTER': ['Ejecutar casos de prueba', 'Registrar errores'],
        'DESARROLLADOR': ['Actualizar el estado de los errores', 'Consultar errores asignados']
    };

    const roleIcons = {
        'GERENTE DE PRUEBAS': 'bi bi-briefcase-fill',
        'ANALISTA DE PRUEBAS': 'bi bi-card-checklist',
        'TESTER': 'bi bi-bug-fill',
        'DESARROLLADOR': 'bi bi-code-slash'
    };

    const toggleMenu = (menu) => {
        setActiveMenu(activeMenu === menu ? null : menu);
    };

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    const handleOptionClick = (option, roleId, event) => {
        event.preventDefault();
        setSelectedRoleId(roleId);
        setSelectedOption(option);

        if (option === 'Casos de prueba') {
            navigate(`/casos-prueba/`, { state: { proyecto } });
        } if (option === 'Crear proyectos') {
            navigate(`/proyecto/nuevo`, { state: { proyecto } });
        } if (option === 'Miembros') {
            navigate(`/proyecto/usuarios/${proyecto.external_id}`, { state: { proyecto } });
        } else if (option === 'Asignar testers') {
            navigate(`/asignar/tester/${external_id}`, { state: { selectedRoleId: roleId } });
        }
    };

    return (
        <div className="sidebar d-flex flex-column justify-content-between" style={{
            width: isOpen ? '250px' : '80px', 
            backgroundColor: 'var(--color-cuarto)', 
            transition: 'width 0.3s ease', 
            height: '100vh', 
            color: 'var(--blanco)'
        }}>
            <div style={{ overflow: 'hidden', flexGrow: 1, marginTop:'50px' }}>
                <div className="text-center mt-3 mb-4">
                    <img src="/logo192.png" alt="Logo" className="rounded-circle" style={{ width: isOpen ? '150px' : '40px' }} />
                </div>

                {/* Opciones de navegación */}
                <div className="p-2 mb-3" style={{ backgroundColor: 'var(--color-cuarto)' }}>
                    <ul className="list-unstyled mb-0">
                        <li className="p-2 mb-1" onClick={() => navigate('/main')} 
                            style={{ 
                                cursor: 'pointer', 
                                display: 'flex', 
                                alignItems: 'center', 
                                backgroundColor: selectedOption === 'Inicio' ? 'var(--color-terciario)' : 'transparent', 
                                transition: 'background-color 0.3s',
                                color: 'var(--blanco)'
                            }}>
                            <i className="bi bi-house-fill me-2"></i>
                            {isOpen && <span>Inicio</span>}
                        </li>
                        <li className="p-2 mb-1" onClick={() => navigate('/usuarios')} 
                            style={{ 
                                cursor: 'pointer', 
                                display: 'flex', 
                                alignItems: 'center', 
                                backgroundColor: selectedOption === 'Gestionar Usuarios' ? 'var(--color-terciario)' : 'transparent', 
                                transition: 'background-color 0.3s',
                                color: 'var(--blanco)'
                            }}>
                            <i className="bi bi-people-fill me-2"></i>
                            {isOpen && <span>Gestionar Usuarios</span>}
                        </li>
                        <li className="p-2 mb-1" onClick={() => navigate('/proyectos')} 
                            style={{ 
                                cursor: 'pointer', 
                                display: 'flex', 
                                alignItems: 'center', 
                                backgroundColor: selectedOption === 'Proyectos' ? 'var(--color-terciario)' : 'transparent', 
                                transition: 'background-color 0.3s',
                                color: 'var(--blanco)'
                            }}>
                            <i className="bi bi-clipboard-data-fill me-2"></i>
                            {isOpen && <span>Proyectos</span>}
                        </li>
                    </ul>
                </div>

                {/* Roles del Proyecto */}
                <div className="sidebar-heading" style={{ marginLeft: isOpen ? '10px' : '0', color: 'var(--blanco)', fontWeight: 'bold' }}>
                    {isOpen ? proyecto.nombre : ''}
                </div>

                <ul className="list-unstyled">
                    {roles.map((role) => (
                        <li className="mb-1" key={role.id}>
                            <div className="p-2" style={{ 
                                backgroundColor: activeMenu === role.nombre ? 'var(--color-terciario)' : 'var(--color-cuarto)', 
                                cursor: 'pointer', 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                transition: 'background-color 0.3s'
                            }}
                                onClick={() => toggleMenu(role.nombre)}>
                                <i className={`${roleIcons[role.nombre]} me-2`}></i>
                                {isOpen && <span>{role.nombre}</span>}
                                {isOpen && <i className={`bi ${activeMenu === role.nombre ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>}
                            </div>
                            <Collapse in={activeMenu === role.nombre}>
                                <div className="list-unstyled small" style={{ marginLeft: isOpen ? '10px' : '0' }}>
                                    {roleOptions[role.nombre].map((option, index) => (
                                        <li key={index}>
                                            <button
                                                className={`btn text-start text-decoration-none ${selectedOption === option ? 'bg-terciary text-white' : 'text-light'}`}
                                                onClick={(e) => handleOptionClick(option, role.id, e)}
                                                style={{
                                                    display: 'block',
                                                    textAlign: 'left',
                                                    width: '100%',
                                                    marginBottom: '5px',
                                                    backgroundColor: selectedOption === option ? 'var(--color-terciario)' : '',
                                                    color: selectedOption === option ? 'var(--blanco)' : 'var(--blanco)',
                                                    borderRadius: '5px',
                                                    transition: 'background-color 0.3s'
                                                }}>
                                                {isOpen ? option : <i className="bi bi-chevron-right"></i>}
                                            </button>
                                        </li>
                                    ))}
                                </div>
                            </Collapse>
                        </li>
                    ))}
                </ul>

                
            </div>

            <div className="p-2 mt-auto" style={{ textAlign: 'center', backgroundColor: 'var(--color-cuarto)' }}>
                <Button variant="link" className="text-white" onClick={toggleSidebar}>
                    {isOpen ? (
                        <>
                            <i className="bi bi-chevron-left"></i> 
                        </>
                    ) : (
                        <i className="bi bi-chevron-right"></i>
                    )}
                </Button>
            </div>
        </div>

        
    );
};

export default RoleMenu;
