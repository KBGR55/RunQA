import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { peticionGet } from '../utilities/hooks/Conexion';
import { useParams, useNavigate } from 'react-router-dom';
import '../css/style.css';
import mensajes from '../utilities/Mensajes';
import { getToken } from '../utilities/Sessionutil';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const CasoPruebaAsignado = () => {
    const [casosPrueba, setCasosPrueba] = useState({});
    const { external_id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCasoPrueba = async () => {
            try {
                const response = await peticionGet(getToken(), `contrato/asignado/${external_id}`);
                if (response.code === 200) {
                    setCasosPrueba(response.info);
                } else {
                    mensajes(`Error al obtener caso de prueba: ${response.msg}`, 'error');
                }
            } catch (error) {
                mensajes('Error al procesar la solicitud', 'error');
            }
        };

        fetchCasoPrueba();
    }, []);

    const formatDate = (dateString) => new Date(dateString).toISOString().slice(0, 10);

    return (
        <div className="container-fluid contenedor-centro" style={{ margin: '20px' }}>
            <div className="contenedor-carta">
                <div className="d-flex align-items-center mb-3">
                    <FontAwesomeIcon
                        icon={faArrowLeft}
                        onClick={() => navigate(-1)}
                        style={{ cursor: 'pointer', fontSize: '20px', marginRight: '10px', color: 'var(--color-cuarto)' }}
                    />
                    <h4 className="titulo-primario">Caso de Prueba: {casosPrueba?.nombre_caso_prueba || 'No disponible'}</h4>
                </div>

                <div className="row mt-4">
                    <div className="col-12 mb-4">
                        <div className="card p-3 shadow-sm card-custom-bord">
                            <h5 className="titulo-secundario" style={{ textAlign: 'left' }}>Descripción</h5>
                            <p className="texto-normal" style={{ textAlign: 'justify' }} dangerouslySetInnerHTML={{ __html: casosPrueba?.descripcion?.replace(/\n/g, '<br />') || 'No disponible' }} />
                        </div>
                    </div>

                    <div className="col-md-6 mb-4">
                        <div className="card p-3 shadow-sm card-custom-bord ">
                            <h5 className="titulo-secundario mb-3" style={{ textAlign: 'initial' }}>Detalles del Caso</h5>
                            <div className="d-flex justify-content-around align-items-center flex-wrap gap-2">
                                <div className="d-flex flex-column align-items-center">
                                    <strong>Clasificación</strong>
                                    <span className={`badge ${casosPrueba?.clasificacion === 'ALTA' ? 'bg-danger' : casosPrueba?.clasificacion === 'MEDIA' ? 'bg-warning' : 'bg-success'}`}>
                                        {casosPrueba?.clasificacion || 'No disponible'}
                                    </span>
                                </div>
                                <div className="d-flex flex-column align-items-center">
                                    <strong>Estado Actual</strong>
                                    <span className={`badge ${casosPrueba?.estadoActual === 'APROBADO' ? 'bg-success' : casosPrueba?.estadoActual === 'RECHAZADO' ? 'bg-danger' : 'bg-warning'}`}>
                                        {casosPrueba?.estadoActual || 'No disponible'}
                                    </span>
                                </div>
                                <div className="d-flex flex-column align-items-center">
                                    <strong>Estado Asignación</strong>
                                    <span className={`badge ${casosPrueba?.estadoAsignacion === 'ASIGNADO' ? 'bg-success' : 'bg-warning'}`}>
                                        {casosPrueba?.estadoAsignacion || 'No disponible'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-6 mb-4">
                        <div className="card p-3 shadow-sm card-custom-bord ">
                            <h5 className="titulo-secundario" style={{ textAlign: 'initial' }}>Fechas de Asignación</h5>
                            <div className="mb-2">
                                <strong>Fecha de inicio: </strong>
                                {casosPrueba?.fecha_inicio ? formatDate(casosPrueba.fecha_inicio) : 'No disponible'}
                            </div>
                            <div className="mb-2">
                                <strong>Fecha de fin: </strong>
                                {casosPrueba?.fecha_fin ? formatDate(casosPrueba.fecha_fin) : 'No disponible'}
                            </div>
                        </div>
                    </div>

                    <div className="col-12 mb-4">
                        <div className="card p-3 shadow-sm card-custom-bord ">
                            <h5 className="titulo-secundario" style={{ textAlign: 'initial' }}>Personas Involucradas</h5>
                            <div className="mb-2">
                                <strong>Asignado por: </strong>
                                {casosPrueba?.persona_que_asigno || 'No disponible'}
                            </div>
                            <div className="mb-2">
                                <strong>Asignado a: </strong>
                                {casosPrueba?.persona_asignada || 'No disponible'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CasoPruebaAsignado;
