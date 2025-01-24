import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/style.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import swal from 'sweetalert';
import { useNavigate, useParams } from 'react-router-dom';
import { peticionPut } from '../utilities/hooks/Conexion';
import { getToken } from '../utilities/Sessionutil';
import  {mensajes, mensajesSinRecargar} from '../utilities/Mensajes';

const EjecutarCasoPrueba = () => {
    const [resultadoObtenido, setResultadoObtenido] = useState('');
    const [estadoPrueba, setEstadoPrueba] = useState(''); // Estado inicial vacío
    const { external_id_proyecto, external_id } = useParams();
    const navigate = useNavigate();

    const handleTerminarClick = () => {
        swal({
            title: "¿Está seguro de marcar como terminado?",
            text: "Esta acción no se podrá deshacer.",
            icon: "warning",
            buttons: ["No", "Sí"],
            dangerMode: true,
        }).then((willConfirm) => {
            if (willConfirm) {
                const datos = {
                    resultado_obtenido: resultadoObtenido,
                    estado: "EXITOSO"
                };

                peticionPut(getToken(), `caso/prueba/ejecutar/${external_id}`, datos)
                    .then((info) => {
                        if (info.code !== 200) {
                            mensajes(info.msg, "error", "Error");
                        } else {
                            mensajes(info.msg, "success", "Éxito");
                        }
                    })
                    .catch((error) => {
                        mensajes("Error al marcar el caso de prueba como terminado", "error", "Error");
                        console.error(error);
                    });
            }
        });
    };


    const handleEstadoClick = (estado) => {
        if (!resultadoObtenido.trim() && estado !== "EXITOSO") {
            mensajes(`El resultado obtenido es obligatorio para ${estado}`, "error", "Error");
            return;
        }
        swal({
            title: `¿Está seguro de marcar como ${estado.toLowerCase()}?`,
            text: "Esta acción no se podrá deshacer.",
            icon: "warning",
            buttons: ["No", "Sí"],
            dangerMode: true,
        }).then((willConfirm) => {
            if (willConfirm) {
                const datos = {
                    resultado_obtenido: resultadoObtenido,
                    estado: estado,
                };

                peticionPut(getToken(), `caso/prueba/ejecutar/${external_id}`, datos)
                    .then((info) => {
                        if (info.code !== 200) {
                            mensajes(info.msg, "error", "Error");
                        } else {
                            mensajesSinRecargar(info.msg, "success", "Éxito");
                                if (estado === "FALLIDO") {
                                    navigate(`/error/${external_id_proyecto}/${external_id}`);
                                } else {
                                    window.location.reload();
                                }
                        }
                    })
                    .catch((error) => {
                        mensajes(`Error al marcar el caso de prueba como ${estado.toLowerCase()}`, "error", "Error");
                        console.error(error);
                    });
            }
        });
    };


    const handleAgregarErroresClick = () => {
        if (!resultadoObtenido.trim()) {
            mensajes("El resultado obtenido es obligatorio para fallido", "error", "Error");
            return;
        } else {
            const datos = {
                resultado_obtenido: resultadoObtenido,
                estado: "FALLIDO"
            };

            peticionPut(getToken(), `caso/prueba/ejecutar/${external_id}`, datos)
                .then((info) => {
                    if (info.code !== 200) {
                        mensajes(info.msg, "error", "Error");
                    } else {
                        mensajesSinRecargar(info.msg, "success", "Éxito");
                        navigate(`/error/${external_id_proyecto}/${external_id}`);
                    }
                })
                .catch((error) => {
                    mensajes("Error al marcar el caso de prueba como terminado", "error", "Error");
                    console.error(error);
                });
        }
    };

    return (
        <div className="contenedor-carta">
            <h2>Ejecutar Caso de Prueba</h2>
            <div className="mb-3">
                <label htmlFor="estadoPrueba" className="form-label">Seleccione el estado del caso de prueba</label>
                <select
                    className="form-control"
                    id="estadoPrueba"
                    value={estadoPrueba}
                    onChange={(e) => setEstadoPrueba(e.target.value)}
                >
                    <option value="">Seleccione...</option>
                    <option value="EXITOSO">EXITOSO</option>
                    <option value="FALLIDO">FALLIDO</option>
                    <option value="OBSOLETO">OBSOLETO</option>
                    <option value="DUPLICADO">DUPLICADO</option>
                    <option value="NO APLICABLE">NO APLICABLE</option>
                </select>
            </div>

            {estadoPrueba === "EXITOSO" && (
                <div className="contenedor-filo">
                    <button className="btn-positivo" onClick={handleTerminarClick}>
                        <FontAwesomeIcon icon={faCheck} /> Terminar
                    </button>
                </div>
            )}

            {(estadoPrueba === "OBSOLETO" || estadoPrueba === "DUPLICADO" || estadoPrueba === "NO APLICABLE") && (
                <>
                    <div className="mb-3">
                        <label htmlFor="resultadoObtenido" className="form-label">Resultado Obtenido</label>
                        <textarea
                            className="form-control"
                            id="resultadoObtenido"
                            rows="3"
                            placeholder="Escribe el resultado obtenido..."
                            value={resultadoObtenido}
                            onChange={(e) => setResultadoObtenido(e.target.value)}
                            maxLength={350}
                        ></textarea>
                        <small className="text-muted">{resultadoObtenido.length}/350 caracteres</small>
                    </div>
                    <div className="contenedor-filo">
                        <button className="btn-positivo" onClick={() => handleEstadoClick(estadoPrueba)}>
                            <FontAwesomeIcon icon={faCheck} />  Confirmar
                        </button>
                    </div>
                </>
            )}

            {estadoPrueba === "FALLIDO" && (
                <>
                    <div className="mb-3">
                        <label htmlFor="resultadoObtenido" className="form-label">Resultado Obtenido</label>
                        <textarea
                            className="form-control"
                            id="resultadoObtenido"
                            rows="3"
                            placeholder="Escribe el resultado obtenido..."
                            value={resultadoObtenido}
                            onChange={(e) => setResultadoObtenido(e.target.value)}
                            maxLength={350}
                        ></textarea>
                        <small className="text-muted">{resultadoObtenido.length}/350 caracteres</small>
                    </div>
                    <div className="contenedor-filo">
                        <button className="btn-negativo" onClick={handleAgregarErroresClick}>
                            <FontAwesomeIcon icon={faExclamationTriangle} /> Agregar Errores
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default EjecutarCasoPrueba;
