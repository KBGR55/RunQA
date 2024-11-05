import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { peticionGet } from '../utilities/hooks/Conexion';
import '../css/Presentacion_Style.css';
import { getToken } from '../utilities/Sessionutil';

const PresentacionProyecto = () => {
    const { external_id } = useParams();
    const [proyecto, setProyecto] = useState(null);

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const info = await peticionGet(getToken(), `/proyecto/${external_id}`);
                if (info.code === 200) {
                    setProyecto(info.info);
                } else {
                    console.error('Error al obtener proyecto:', info.msg);
                }
            } catch (error) {
                console.error('Error en la solicitud:', error);
            }
        };

        fetchProject();
    }, [external_id]);  


    if (!proyecto) return <p>Cargando...</p>;

    return (
        <div className="project-page">
            <div className="header-section">
                <img src="/img/fondo1.jpeg" alt="Project Background" className="background-image" />
                <div className="header-overlay">
                    <h1 className="project-title">{proyecto[0].proyecto.nombre}</h1>
                    <p>{proyecto[0].proyecto.descripcion || 'Descripción del proyecto.'}</p>
                </div>
            </div>

            {/* Sección de contenido */}
            <div className="content-section">

                {/* Equipo del proyecto */}
                <div className="project-team">
                    <h2><strong>Equipo del proyecto</strong></h2>
                    <ul>
                        {proyecto && proyecto.length > 0 ? (
                            proyecto.map((miembro, index) => (
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
