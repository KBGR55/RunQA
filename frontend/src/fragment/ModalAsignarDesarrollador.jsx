import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Modal, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCheck, faTrash } from '@fortawesome/free-solid-svg-icons';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { peticionGet, peticionPost } from '../utilities/hooks/Conexion';
import { getToken } from '../utilities/Sessionutil';
import mensajes from '../utilities/Mensajes';
import swal from 'sweetalert';
import { useNavigate } from 'react-router-dom';

const ModalAsignarDesarrollador = ({ showModalDesarrollador, setShowModalDesarrollador, external_id_proyecto, external_error, usuario }) => {
    const [desarrollador, setDesarrollador] = useState([]);
    const [selectedDesarrollador, setSelectedDesarrollador] = useState(null);
    const [fechaFinPrueba, setFechaFinPrueba] = useState(null);
    const [fechaInicioPrueba, setFechaInicioPrueba] = useState(null);
    const [rolId, setRolId] = useState(null);
    const handleClose = () => setShowModalDesarrollador(false);
    const navigate = useNavigate();  


    useEffect(() => {
        const fetchDesarrolladores = async () => {
            try {
                const info = await peticionGet(getToken(), `/proyecto/listar/rol/DESARROLLADOR/${external_id_proyecto}`);
                if (info.code === 200) {
                    setDesarrollador(info.info);
                    setRolId(info.id_rol);
                } else if (info.code === 404) {
                    showNoTestersAlert();
                } else {
                    mensajes(info.msg, "error");
                }
            } catch (error) {
                console.error("Error al cargar los testers:", error);
            }
        };

        fetchDesarrolladores();
    }, [external_id_proyecto]);

    const showNoTestersAlert = () => {
        swal({
            title: "No hay desarrolladores registrados en el proyecto",
            text: "Si usted es lider del proyecto agregue desarrolladores en la sección de miembros, caso contrario comunicarse con el lider del proyecto",
            icon: "warning",
            dangerMode: true,
        });
    };

    const handleDesarrolladorSelect = (e) => {
        const desarrolladorId = e.target.value;
        const selectedDesarrollador = desarrollador.find(desarrollador => desarrollador.id === parseInt(desarrolladorId));
        setSelectedDesarrollador(selectedDesarrollador);
        setDesarrollador(prevDesarrollador => prevDesarrollador.filter(t => t.id !== parseInt(desarrolladorId)));
    };

    const handleRemoveDesarrollador= () => {
        if (selectedDesarrollador) {
            setDesarrollador(prevDesarrollador => [...prevDesarrollador, selectedDesarrollador]);
            setSelectedDesarrollador(null);
        }
    };

    const handleAsignarDesarrolladores = async () => {
        const body = {
            id_proyecto: external_id_proyecto,
            desarrollador: { id_entidad: selectedDesarrollador.id },
            entidad_asigno: usuario.user.id,
            errores: Array.isArray(external_error) 
                ? external_error.map(c => ({ external_id: c })) 
                : external_error ? [{ external_id: external_error }] : external_error,
            fecha_inicio: fechaInicioPrueba,
            fecha_fin: fechaFinPrueba,
            desarrollador_rol: rolId
        };
        
        try {
            const response = await peticionPost(getToken(), '/contrato/error', body);
            if (response.code === 200) {
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
                mensajes(response.msg);
                handleClose();
            } else {
                mensajes(response.msg, 'error');
            }
        } catch (error) {
            console.error('Error al asignar desarrollador:', error);
        }
    };
    
    const isAcceptButtonDisabled = !selectedDesarrollador || !fechaInicioPrueba || !fechaFinPrueba;

    return (
        <Modal show={showModalDesarrollador} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title className='titulo-primario'>Asignar Desarrollador</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {!selectedDesarrollador && (  <Form.Group controlId="formTesters">
                    <Form.Label><strong style={{ color: 'red' }}>* </strong>Seleccionar Desarrollador</Form.Label>
                    <Form.Control
                        as="select"
                        onChange={handleDesarrolladorSelect}
                        value={selectedDesarrollador ? "" : selectedDesarrollador?.id || ""}
                        disabled={!!selectedDesarrollador}
                    >
                        <option value="" disabled>Seleccione un desarrollador</option>
                        {desarrollador.map(t => (
                            <option key={t.id} value={t.id}>
                                {t.nombres} {t.apellidos}
                            </option>
                        ))}
                    </Form.Control>
                </Form.Group>)}

                {selectedDesarrollador && (
                    <div className="mt-4">
                        <h6 style={{ fontWeight: 'bold', color: '#3FA2F6' }}>Desarrollador Seleccionado:</h6>
                        <ul className="list-group">
                            <li className="list-group-item d-flex justify-content-between align-items-center">
                                <div>
                                    <strong>{selectedDesarrollador.nombres} {selectedDesarrollador.apellidos}</strong>
                                    <br />
                                    <span>{selectedDesarrollador.correo}</span>
                                </div>
                                <Button variant="danger" size="sm" onClick={handleRemoveDesarrollador}>
                                    <FontAwesomeIcon icon={faTrash} />
                                </Button>
                            </li>
                        </ul>
                    </div>
                )}

                <div className="row">
                    <div className="col-md-6">
                        <Form.Group controlId="formFechaInicioPrueba" className="mt-2">
                            <Form.Label><strong style={{ color: 'red' }}>* </strong>Fecha Inicio</Form.Label>
                            <DatePicker
                                selected={fechaInicioPrueba}
                                onChange={date => setFechaInicioPrueba(date)}
                                dateFormat="yyyy/MM/dd"
                                className="form-control"
                                placeholderText="Selecciona la fecha"
                                minDate={new Date()}
                                popperPlacement="bottom-start"
                            />
                        </Form.Group>
                    </div>
                    <div className="col-md-6">
                        <Form.Group controlId="formFechaFinPrueba" className="mt-2">
                            <Form.Label><strong style={{ color: 'red' }}>* </strong>Fecha Fin</Form.Label>
                            <DatePicker
                                selected={fechaFinPrueba}
                                onChange={date => setFechaFinPrueba(date)}
                                dateFormat="yyyy/MM/dd"
                                className="form-control"
                                placeholderText="Selecciona la fecha"
                                minDate={new Date()}
                                popperPlacement="bottom-start"
                            />
                        </Form.Group>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button className="btn-positivo" onClick={handleAsignarDesarrolladores} disabled={isAcceptButtonDisabled}>
                    <FontAwesomeIcon icon={faCheck} /> Aceptar
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ModalAsignarDesarrollador;
