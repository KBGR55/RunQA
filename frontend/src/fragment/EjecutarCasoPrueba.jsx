import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/style.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import swal from 'sweetalert';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { peticionPut } from '../utilities/hooks/Conexion';
import { getToken } from '../utilities/Sessionutil';
import mensajes from '../utilities/Mensajes';


const EjecutarCasoPrueba = () => {
    const [resultadoObtenido, setResultadoObtenido] = useState('');
    const [showModal, setShowModal] = useState(false);
    const { external_id_proyecto, external_id } = useParams();
    const navigate = useNavigate();

    const handleTerminarClick = () => {
        if (!resultadoObtenido.trim()) {
            mensajes("El resultado obtenido es obligatorio", "error", "Error");
            return;
        }

        swal({
            title: "¿Está seguro de marcar como terminado?",
            text: "Esta acción no se podrá deshacer.",
            icon: "warning",
            buttons: ["No", "Sí"],
            dangerMode: true,
        }).then((willConfirm) => {
            if (willConfirm) {
                const datos = { resultado_obtenido: resultadoObtenido };

                peticionPut(getToken(), `caso/prueba/ejecutar/${external_id}`, datos)
                    .then((info) => {
                        if (info.code !== 200) {
                            mensajes(info.msg, "error", "Error");
                        } else {
                            mensajes(info.msg, "success", "Éxito");
                            setTimeout(() => {
                                window.location.reload();
                            }, 1200);
                        }
                    })
                    .catch((error) => {
                        mensajes("Error al marcar el caso de prueba como terminado", "error", "Error");
                        console.error(error);
                    });
            }
        });
    };

    const handleAgregarErroresClick = () => {
        navigate(`/error/${external_id_proyecto}/${external_id}`);
    };

    return (
        <div className="contenedor-carta">
            <h2>Ejecutar Caso de Prueba</h2>
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
                <button className="btn-positivo" onClick={handleTerminarClick}>
                    <FontAwesomeIcon icon={faCheck} /> Terminar
                </button>
                <button className="btn-negativo" onClick={handleAgregarErroresClick}>
                    <FontAwesomeIcon icon={faExclamationTriangle} /> Agregar Errores
                </button>
            </div>
        </div>
    );
};

export default EjecutarCasoPrueba;