import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { peticionGet } from '../utilities/hooks/Conexion';
import { useParams } from 'react-router-dom';
import '../css/style.css';
import mensajes from '../utilities/Mensajes';
import { borrarSesion, getToken } from '../utilities/Sessionutil';
import { useNavigate } from 'react-router-dom';
import { Button, Modal, FormControl, InputGroup } from 'react-bootstrap';

const ListaCasosAsignados = () => {
    const [casosPrueba, setCasosPrueba] = useState([]);
    const { external_id } = useParams();
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

    }, [navigate, external_id]);
    

    const formatDate = (dateString) => {
        return new Date(dateString).toISOString().slice(0, 10); 
    }

    const handleNavigateToDetail = (external_id) => {
        navigate(`/casos/prueba-asignado/${external_id}`);
    };

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
                                        <th className="text-center">Clasificación</th>
                                        <th className="text-center">Fecha Fin</th>
                                        <th className="text-center">Ver detalle</th>
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
                                                <td>{caso.clasificacion}</td>
                                                <td>{formatDate(caso.fecha_fin)}</td>
                                                <td className="text-center">
                                                <Button
                                                    variant="btn btn-outline-info btn-rounded"
                                                    onClick={() => handleNavigateToDetail(caso.external_id)}
                                                    className="btn-icon"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="24"
                                                        height="24"
                                                        fill="currentColor"
                                                        className="bi bi-arrow-right-circle-fill"
                                                        viewBox="0 0 16 16"
                                                    >
                                                        <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0M4.5 7.5a.5.5 0 0 0 0 1h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5z" />
                                                    </svg>
                                                </Button>

                                            </td>
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