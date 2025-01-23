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

const AsignarTesterModal = ({ showModal, setShowModal, external_id_proyecto, external_caso_prueba, usuario }) => {
    const [tester, setTester] = useState([]);
    const [selectedTester, setSelectedTester] = useState(null);
    const [fechaFinPrueba, setFechaFinPrueba] = useState(null);
    const [fechaInicioPrueba, setFechaInicioPrueba] = useState(null);
    const [rolId, setRolId] = useState(null);
    const handleClose = () => setShowModal(false);
    const navigate = useNavigate();


    useEffect(() => {
        const fetchTesters = async () => {
            try {
                const info = await peticionGet(getToken(), `/proyecto/listar/rol/TESTER/${external_id_proyecto}`);
                if (info.code === 200) {
                    setTester(info.info);
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

        fetchTesters();
    }, [external_id_proyecto]);

    const showNoTestersAlert = () => {
        swal({
            title: "No hay testers registrados en el proyecto",
            text: "Si usted es lider del proyecto agregue testers en la sección de miembros, caso contrario comunicarse con el lider del proyecto",
            icon: "warning",
            dangerMode: true,
        });
    };

    const handleTesterSelect = (e) => {
        const testerId = e.target.value;
        const selectedTester = tester.find(tester => tester.id === parseInt(testerId));
        setSelectedTester(selectedTester);
        setTester(prevTester => prevTester.filter(t => t.id !== parseInt(testerId)));
    };

    const handleRemoveTester = () => {
        if (selectedTester) {
            setTester(prevTester => [...prevTester, selectedTester]);
            setSelectedTester(null);
        }
    };

    const handleAsignarTesters = async () => {
        const body = {
            id_proyecto: external_id_proyecto,
            tester: { id_entidad: selectedTester.id },
            entidad_asigno: usuario.user.id,
            casosPrueba: Array.isArray(external_caso_prueba) 
                ? external_caso_prueba.map(c => ({ external_id: c })) 
                : external_caso_prueba ? [{ external_id: external_caso_prueba }] : external_caso_prueba,
            fecha_inicio: fechaInicioPrueba,
            fecha_fin: fechaFinPrueba,
            tester_rol: rolId
        };
    
        try {
            const response = await peticionPost(getToken(), 'contrato/caso/prueba', body);
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
            console.error('Error al asignar tester:', error);
        }
    };


    const handleCancelClick = () => {
        swal({
            title: "¿Está seguro de cancelar la asignación de tester?",
            text: "Una vez cancelado, no podrá revertir esta acción",
            icon: "warning",
            buttons: ["No", "Sí"],
            dangerMode: true,
        }).then((willCancel) => {
            if (willCancel) {
                mensajes("Asignación cancelada", "info", "Información");
                setTimeout(() => {
                    window.location.reload(); 
                }, 2000);  
            }
        });
    };
    
    const isAcceptButtonDisabled = !selectedTester || !fechaInicioPrueba || !fechaFinPrueba;

    return (
        <Modal show={showModal} onHide={handleClose}>
            <Modal.Header >
                <Modal.Title className='titulo-primario'>Asignar Tester</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {!selectedTester && (
                    <Form.Group controlId="formTesters">
                    <Form.Label><strong style={{ color: 'red' }}>* </strong>Seleccionar Tester</Form.Label>
                    <Form.Control
                        as="select"
                        onChange={handleTesterSelect}
                        value={selectedTester ? "" : selectedTester?.id || ""}
                        disabled={!!selectedTester}
                    >
                        <option value="" disabled>Seleccione un tester</option>
                        {tester.map(t => (
                            <option key={t.id} value={t.id}>
                                {t.nombres} {t.apellidos}
                            </option>
                        ))}
                    </Form.Control>
                </Form.Group>)}
                {selectedTester && (
                    <div className="mt-4">
                        <h6 style={{ fontWeight: 'bold', color: '#3FA2F6' }}>Tester Seleccionado:</h6>
                        <ul className="list-group">
                            <li className="list-group-item d-flex justify-content-between align-items-center">
                                <div>
                                    <strong>{selectedTester.nombres} {selectedTester.apellidos}</strong>
                                    <br />
                                    <span>{selectedTester.correo}</span>
                                </div>
                                <Button variant="danger" size="sm" onClick={handleRemoveTester}>
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
                <Button variant="secondary" className="btn-negativo" onClick={handleCancelClick}>
                    <FontAwesomeIcon icon={faTimes} /> Cancelar
                </Button>
                <Button className="btn-positivo" onClick={handleAsignarTesters} disabled={isAcceptButtonDisabled}>
                    <FontAwesomeIcon icon={faCheck} /> Aceptar
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default AsignarTesterModal;
