import React, { useState } from 'react';
import { Button, Modal, Form, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { peticionPost } from '../utilities/hooks/Conexion';
import { getToken } from '../utilities/Sessionutil';
import mensajes from '../utilities/Mensajes';
import '../css/style.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import swal from 'sweetalert';
import { useNavigate } from 'react-router-dom';

const RegistrarCorreccion = ({ showModalRegistrar, setShowModalRegistrar, external_id_error }) => {
    const [resultadoEjecucion, setResultadoEjecucion] = useState('');
    const navigate = useNavigate();

    const handleClose = () => {
        swal({
            title: "¿Está seguro de cancelar la operación?",
            text: "Los cambios no guardados se perderán.",
            icon: "warning",
            buttons: ["No", "Sí, cancelar"],
            dangerMode: true,
        }).then((confirm) => {
            if (confirm) {
                setShowModalRegistrar(false); 
            }
        });
    };

    const registrarCorreccion = async () => {
        if (!resultadoEjecucion.trim()) {
            mensajes('El resultado de ejecución no puede estar vacío', 'error');
            return;
        }

        const body = {
            resultado_ejecucion: resultadoEjecucion,
        };

        try {
            const response = await peticionPost(
                getToken(),
                `error/registrar-correccion/${external_id_error}`,
                body
            );

            if (response.code === 200) {
                mensajes(response.msg, 'success');
                setShowModalRegistrar(false);
                navigate(`/errores/asignados/${external_id_error}`);
            } else {
                mensajes(response.msg, 'error');
            }
        } catch (error) {
            console.error("Error al registrar la corrección:", error);
            mensajes("Error interno al procesar la solicitud", "error");
        }
    };

    return (
        <Modal show={showModalRegistrar} onHide={handleClose} backdrop="static" keyboard={false}>
            <Modal.Header closeButton>
                <Modal.Title className="titulo-primario">Registrar Corrección</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group>
                    <Form.Label>
                        <strong style={{ color: 'red' }}>* </strong>
                        Resultado de Ejecución{' '}
                        <OverlayTrigger
                            placement="top"
                            overlay={
                                <Tooltip>
                                    Aquí se especifica el detalle de la corrección realizada para este error.
                                </Tooltip>
                            }
                        >
                            <span className="text-info" style={{ cursor: 'pointer' }}>
                                <FontAwesomeIcon icon={faQuestionCircle} className="ms-2 text-info" />
                            </span>
                        </OverlayTrigger>
                    </Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={5}
                        placeholder="Describa los detalles de la corrección realizada"
                        value={resultadoEjecucion}
                        onChange={(e) => setResultadoEjecucion(e.target.value)}
                    />
                </Form.Group>
            </Modal.Body>
            <Modal.Footer>
                <Button className="btn-negativo" onClick={handleClose}>
                    Cancelar
                </Button>
                <Button className="btn-positivo" onClick={registrarCorreccion}>
                    Guardar
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default RegistrarCorreccion;
