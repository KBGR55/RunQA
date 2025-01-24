import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/style.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimesCircle, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import swal from 'sweetalert';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { Modal, Button } from 'react-bootstrap';
import { mensajes, mensajesSinRecargar } from '../utilities/Mensajes';
import { peticionPost } from '../utilities/hooks/Conexion';
import { getToken } from '../utilities/Sessionutil';

const EvaluarCorreccion = ({ showModalEvaluar, setShowModalEvaluar, external_id_error }) => {
    const [estadoCorreccion, setEstadoCorreccion] = useState('');
    const [motivoInvalido, setMotivoInvalido] = useState('');

    const handleClose = () => {
        swal({
            title: "¿Está seguro de cancelar la operación?",
            text: "Los cambios no se guardarán.",
            icon: "warning",
            buttons: ["No", "Sí"],
            dangerMode: true,
        }).then((willConfirm) => {
            if (willConfirm) {
                setShowModalEvaluar(false);
            }
        });
    };

    const handleConfirmar = () => {
        if (estadoCorreccion === 'INVALIDO' && !motivoInvalido.trim()) {
            mensajes("El motivo de invalidez es obligatorio", "warning", "Advertencia");
            return;
        }

        swal({
            title: `¿Está seguro de marcar como ${estadoCorreccion === 'VALIDADO' ? 'validado' : 'inválido'}?`,
            text: "Esta acción no se podrá deshacer.",
            icon: "warning",
            buttons: ["No", "Sí"],
            dangerMode: true,
        }).then((willConfirm) => {
            if (willConfirm) {
                const datos = {
                    estado: estadoCorreccion,
                    motivo_invalido: estadoCorreccion === 'INVALIDO' ? motivoInvalido : undefined,
                };

                peticionPost(getToken(), `error/evaluar/${external_id_error}`, datos)
                    .then((info) => {
                        if (info.code !== 200) {
                            mensajes(info.msg, "error", "Error");
                        } else {
                            mensajesSinRecargar(info.msg, "success", "Éxito");
                        }
                    })
                    .catch((error) => {
                        mensajes("Error al realizar la evaluación", "error", "Error");
                        console.error(error);
                    });
            }
        });
    };

    return (
        <Modal show={showModalEvaluar} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title className='titulo-primario'>Evaluar Corrección</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="mb-3">
                    <label htmlFor="estadoCorreccion" className="form-label"><strong style={{ color: 'red' }}>* </strong>Seleccione el estado de la corrección</label>
                    <select
                        className="form-control"
                        id="estadoCorreccion"
                        value={estadoCorreccion}
                        onChange={(e) => setEstadoCorreccion(e.target.value)}
                    >
                        <option value="">Seleccione...</option>
                        <option value="VALIDADO">VALIDADO</option>
                        <option value="INVALIDO">INVÁLIDO</option>
                    </select>
                </div>

                {estadoCorreccion === 'INVALIDO' && (
                    <>
                        <div className="mb-3">
                            <label htmlFor="motivoInvalido" className="form-label"><strong style={{ color: 'red' }}>* </strong>Motivo de invalidez</label>
                            <OverlayTrigger
                                placement="top"
                                overlay={
                                    <Tooltip className="custom-tooltip">
                                        Especifique el motivo por el cual la corrección fue marcada como inválida. Ejemplo: "Faltan pasos", "Resultado incorrecto", etc.
                                    </Tooltip>
                                }
                            >
                                <textarea
                                    className="form-control"
                                    id="motivoInvalido"
                                    rows="3"
                                    placeholder="Escriba el motivo aquí..."
                                    value={motivoInvalido}
                                    onChange={(e) => setMotivoInvalido(e.target.value)}
                                    maxLength={350}
                                ></textarea>
                            </OverlayTrigger>
                            <small className="text-muted">{motivoInvalido.length}/350 caracteres</small>
                        </div>
                    </>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button className='btn btn-negativo' onClick={handleClose}>
                    <FontAwesomeIcon icon={faTimesCircle} /> Cancelar
                </Button>
                <Button
                    className='btn btn-positivo'
                    onClick={handleConfirmar}
                    disabled={!estadoCorreccion}
                >
                    <FontAwesomeIcon icon={faCheck} /> Confirmar
                </Button>

            </Modal.Footer>
        </Modal>
    );
};

export default EvaluarCorreccion;
