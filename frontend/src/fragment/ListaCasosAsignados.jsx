import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { peticionGet } from '../utilities/hooks/Conexion';
import { useParams } from 'react-router-dom';
import '../css/style.css';
import mensajes from '../utilities/Mensajes';
import { borrarSesion, getToken } from '../utilities/Sessionutil';
import { useNavigate } from 'react-router-dom';

const ListaCasosAsignados = () => {
    const [casosPrueba, setCasosPrueba] = useState([]);
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        peticionGet(getToken(), '/contrato/asignados').then((info) => {
            if (info.code !== 200 && info.msg === 'Acceso denegado. Token a expirado') {
                borrarSesion();
                mensajes(info.mensajes);
                navigate("/login");
            } else {
                setCasosPrueba(info.info);
            }
        });

    }, [navigate, id]);

    console.log("DATITA", casosPrueba);


    const formatDate = (dateString) => {
        return new Date(dateString).toISOString().slice(0, 10); // Formato AAAA-MM-DD
    }

    return (
        <div>
            <div className='container-fluid'>

                <div className='contenedor-centro'>
                    <div className="contenedor-carta">
                        <p className="titulo-primario">Lista de Casos de Prueba Asignados</p>
                        <div className="table-responsive">
                            <table className="table table-striped">
                                <thead>
                                    <tr>
                                        <th className="text-center">Nombre</th>
                                        <th className="text-center">Descripción</th>
                                        <th className="text-center">Clasificación</th>
                                        <th className="text-center">Asignador</th>
                                        <th className="text-center">Encargado</th>
                                        <th className="text-center">Fecha Inicio</th>
                                        <th className="text-center">Fecha Fin</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {casosPrueba.length === 0 ? (
                                        <tr>
                                            <td colSpan="12" className="text-center">No hay asignaciones para casos de prueba</td>
                                        </tr>
                                    ) : (
                                        casosPrueba.map((caso) => (
                                            <tr key={caso.external_id}>
                                                <td>{caso.nombre_caso_prueba}</td>
                                                <td>{caso.descripcion}</td>
                                                <td>{caso.clasificacion}</td>
                                                <td>{caso.persona_que_asigno}</td>
                                                <td>{caso.persona_asignada}</td>
                                                <td>{formatDate(caso.fecha_inicio)}</td>
                                                <td>{formatDate(caso.fecha_fin)}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default ListaCasosAsignados;