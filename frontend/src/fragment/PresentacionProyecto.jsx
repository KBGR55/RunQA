import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { peticionGet } from '../utilities/hooks/Conexion';
import '../css/Presentacion_Style.css';
import { getToken, getUser, borrarSesion } from '../utilities/Sessionutil';
import mensajes from '../utilities/Mensajes';

const PresentacionProyecto = () => {
    const { external_id_proyecto } = useParams();
    const [proyecto, setProyecto] = useState(null);
    const [proyectoEntidad, setProyectoEntidad] = useState(null);
    const [roles, setRoles] = useState([]);
    const [rolAdministrador, setRolAdministrador] = useState('');
    const [rolesEntida, setRolesEntidad] = useState([]);
    const [selectedRoleId, setSelectedRoleId] = useState(null);
    const [selectedOption, setSelectedOption] = useState('');
    const [showNewProjectModal, setShowNewProjectModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const info = await peticionGet(
                    getToken(),
                    `rol_proyecto/listar/entidad?id_entidad=${getUser().user.id}&external_id_proyecto=${external_id_proyecto}`
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
        const fetchRolAdministrador = async () => {
            try {
                const info = await peticionGet(
                    getToken(),
                    `rol/entidad/obtener/administrador?id_entidad=${getUser().user.id}`
                );
                if (info.code !== 200 && info.msg === 'Acceso denegado. Token ha expirado') {
                    borrarSesion();
                    mensajes(info.mensajes);
                    navigate("/main");
                } else if (info.code === 200) {
                    setRolAdministrador(info.code);
                } else {
                    setRolAdministrador(info.code);
                    console.error('Error al obtener roles:', info.msg);
                }
            } catch (error) {
                console.error('Error en la solicitud:', error);
            }
        };

        const fetchRolesEntidad = async () => {
            try {
                const info = await peticionGet(
                    getToken(),
                    `rol/entidad/listar?id_entidad=${getUser().user.id}`
                );
                if (info.code !== 200 && info.msg === 'Acceso denegado. Token ha expirado') {
                    borrarSesion();
                    mensajes(info.mensajes);
                    navigate("/main");
                } else if (info.code === 200) {
                    setRolesEntidad(info.info);
                } else {
                    console.error('Error al obtener roles:', info.msg);
                }
            } catch (error) {
                console.error('Error en la solicitud:', error);
            }
        };

        fetchRoles();
        fetchRolAdministrador();
        fetchRolesEntidad();
    }, [external_id_proyecto, navigate]);

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const info = await peticionGet(getToken(), `proyecto/${external_id_proyecto}`);
                if (info.code === 200) {
                    setProyectoEntidad(info.info);
                } else {
                    console.error('Error al obtener proyecto:', info.msg);
                }
            } catch (error) {
                console.error('Error en la solicitud:', error);
            }
        };

        fetchProject();
    }, [external_id_proyecto]);

    const roleOptions = {
        'LIDER DE CALIDAD': ['Asignar testers', 'Casos de prueba', 'Funcionalidades', 'Generar reportes', 'Miembros'],
        'ANALISTA DE PRUEBAS': ['Asignar testers', 'Casos de prueba', 'Funcionalidades'],
        'TESTER': ['Asignar desarrolladores', 'Casos de prueba', 'Registrar errores'],
        'DESARROLLADOR': ['Consultar errores asignados', 'Errores asigandos']
    };

    const roleIcons = {
        'LIDER DE CALIDAD': 'bi bi-briefcase-fill',
        'ANALISTA DE PRUEBAS': 'bi bi-card-checklist',
        'TESTER': 'bi bi-bug-fill',
        'DESARROLLADOR': 'bi bi-code-slash'
    };

    const handleOptionClick = (option, roleId, event) => {
        event.preventDefault();
        setSelectedRoleId(roleId);
        setSelectedOption(option);

        if (option === 'Casos de prueba') {
            navigate(`/casos/prueba/${proyecto.external_id}`, { state: { proyecto } });
        } else if (option === 'Editar proyecto') {
            setShowNewProjectModal(true);
        } else if (option === 'Miembros') {
            navigate(`/proyecto/usuarios/${proyecto.external_id}`, { state: { proyecto } });
        } else if (option === 'Asignar testers') {
            navigate(`/asignar/tester/${proyecto.external_id}`, { state: { selectedRoleId: roleId } });
        } else if (option === 'Asignar desarrolladores') {
            navigate(`/asignar/desarrollador/${proyecto.external_id}`, { state: { selectedRoleId: roleId } });
        } else if (option === 'Funcionalidades') {
            navigate(`/lista/funcionalidades/${proyecto.external_id}`, { state: { selectedRoleId: roleId } });
        } else if (option === 'Errores asigandos') {
            navigate(`/errores/asignados/${proyecto.external_id}`);
        
    };}
    const handleCloseNewProjectModal = () => {
        setShowNewProjectModal(false);
    };

    if (!proyecto) return <p>Cargando...</p>;
    
    return (
        <div className="project-page">
            <div className="header-section">
                <img src="/img/fondo1.jpeg" alt="Project Background" className="background-image" />
                <div className="header-overlay">
                    <h1 className="project-title">{proyectoEntidad[0].proyecto_rol.nombre}</h1>
                    <p>{proyectoEntidad[0].proyecto_rol.descripcion || 'Descripción del proyecto.'}</p>
                </div>
            </div>

            {/* Sección de contenido */}
            <div className='contenedor-carta'>
                <div className="row g-1">
                <p className="titulo-primario">Opciones permitidas</p>

                    {roles.map((role, index) => (
                        <div key={index} className="col-md-4">
                            <h3 className="titulo-secundario">
                                <i className={roleIcons[role.nombre] || 'bi bi-person'}></i> {role.nombre}
                            </h3>
                            <ul className="role-options-list">
                                {roleOptions[role.nombre] && roleOptions[role.nombre].map((option, optionIndex) => (
                                    <li key={optionIndex} className="role-option-item">
                                        <button
                                            onClick={(event) => handleOptionClick(option, role.id, event)}
                                            className="option-button"
                                        >
                                            {option}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
                <div className="project-team">
                    <h2><strong>Equipo del proyecto</strong></h2>
                    <ul>
                        {proyectoEntidad && proyectoEntidad.length > 0 ? (
                            proyectoEntidad.map((miembro, index) => (
                                <li key={index}>
                                    {miembro.rol_entidad.entidad.nombres} {miembro.rol_entidad.entidad.apellidos} - <strong>{miembro.rol_entidad.rol.nombre}</strong>
                                </li>
                            ))
                        ) : (
                            <li>No hay miembros del equipo registrados</li>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default PresentacionProyecto;
