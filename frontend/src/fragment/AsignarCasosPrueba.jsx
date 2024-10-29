import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Modal, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCheck, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { peticionGet, peticionPost } from '../utilities/hooks/Conexion';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { borrarSesion, getToken, getUser } from '../utilities/Sessionutil';
import mensajes from '../utilities/Mensajes';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import swal from 'sweetalert';

const AsignarCasosPrueba = () => {
    const { external_id } = useParams();
    const [showNewProjectModal, setShowNewProjectModal] = useState(false);
    const [casosPrueba, setCasosPrueba] = useState([]);
    const [tester, setTester] = useState([]);
    const [selectedTester, setSelectedTester] = useState(null);
    const [selectedCases, setSelectedCases] = useState([]);
    const [fechaFinPrueba, setFechaFinPrueba] = useState(null);
    const [fechaInicioPrueba, setFechaInicioPrueba] = useState(null);
    const [rolId, setRolId] = useState(null);
    const navigate = useNavigate();
    const usuario = getUser();
    const location = useLocation();
    const selectedRoleId = location.state?.selectedRoleId || null;

    useEffect(() => {
        const fetchDataOut = async () => {
            try {
                const info = await peticionGet(getToken(), `caso/obtener/proyecto/${external_id}`);
                if (info.code !== 200) {
                    mensajes(info.msg, 'error');
                    if (info.msg === 'Acceso denegado. Token ha expirado') {
                        borrarSesion();
                        navigate("/login");
                    }
                } else {
                    setCasosPrueba(info.info);
                }
            } catch (error) {
                console.error('Error en la solicitud:', error);
                mensajes("Error al cargar los datos: " + error.message, 'error');
            }
        };

        fetchDataOut();
    }, [external_id, navigate]);


    useEffect(() => {
        const fetchTesters = async () => {
            try {
                const info = await peticionGet(getToken(), `proyecto/listar/tester/${external_id}`);
                if (info.code === 200) {
                    setTester(info.info);
                    setRolId(info.id_rol);
                } else {
                    mensajes(info.msg, 'error');
                }
            } catch (error) {
                console.error('Error al cargar los testers:', error);
            }
        };

        fetchTesters();
    }, [external_id]);

    const handleShowNewProjectModal = () => {
        setShowNewProjectModal(true);
    };

    const handleCloseNewProjectModal = () => {
        setShowNewProjectModal(false);
        setSelectedTester(null);
    };

    const handleCheckboxChange = (id) => {
        setSelectedCases((prevSelected) => {
            if (prevSelected.includes(id)) {
                return prevSelected.filter(selectedId => selectedId !== id);
            } else {
                return [...prevSelected, id];
            }
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

    console.log("usuario.user.id,", usuario.user.id);


    const handleAsignarTesters = async () => {
        const body = {
            id_proyecto: external_id,
            tester: { id_entidad: selectedTester.id },
            entidad_asigno: usuario.user.id,
            casosPrueba: selectedCases.map(c => ({ external_id: c })),
            fecha_inicio: fechaInicioPrueba,
            fecha_fin: fechaFinPrueba,
            role_asignado: selectedRoleId,
            tester_rol: rolId
        };

        try {
            const response = await peticionPost(getToken(), '/contrato/caso/prueba', body);
            if (response.code === 200) {
                setTimeout(() => {
                    window.location.reload();
                }, 1200);
                mensajes(response.msg);
                handleCloseNewProjectModal();
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
                navigate('/asignar/tester/' + external_id);
            }
        });
    };

    const isAcceptButtonDisabled = !selectedTester || selectedCases.length === 0 || !fechaInicioPrueba || !fechaFinPrueba;

    return (
        <div>
            <div className='contenedor-fluid'>
                <div className='contenedor-centro'>
                    <div className="contenedor-carta">
                        <div className='contenedor-filo'>
                            <Button
                                className="btn-login"
                                onClick={handleShowNewProjectModal}
                                disabled={selectedCases.length === 0}
                            >
                                <FontAwesomeIcon icon={faPlus} /> Asignar tester
                            </Button>
                        </div>
                        <p className="titulo-primario">Casos de Prueba</p>
                        {casosPrueba.length === 0 ? (
                            <div className="text-center">
                                <p className="text-muted">No hay casos de prueba registrados</p>
                            </div>
                        ) : (
                            <div className="row g-1">
                                {casosPrueba.map((casoPrueba) => {
                                    const isSelected = selectedCases.includes(casoPrueba.external_id);
                                    return (
                                        <div className="col-md-4" key={casoPrueba.id}>
                                            <div className={`card border-light ${isSelected ? 'card-selected' : ''}`} style={{ margin: '15px' }}>
                                                <div className="card-header d-flex justify-content-between align-items-center">
                                                    <span style={{ fontWeight: 'bold' }}>Seleccionar</span>
                                                    <input
                                                        type="checkbox"
                                                        className="custom-checkbox"
                                                        checked={isSelected}
                                                        onChange={() => handleCheckboxChange(casoPrueba.external_id)}
                                                    />
                                                </div>
                                                <div className="card-body">
                                                    <h5 className="card-title"><strong>{casoPrueba.nombre}</strong></h5>
                                                    <div style={{ textAlign: 'left', marginLeft: '15px' }}>
                                                        <li className="card-text"><strong>Descripción:</strong> {casoPrueba.descripcion}</li>
                                                        <li className="card-text"><strong>Clasificación:</strong> {casoPrueba.clasificacion}</li>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Modal show={showNewProjectModal} onHide={handleCloseNewProjectModal}>
                <Modal.Header closeButton>
                    <Modal.Title className='titulo-primario'>Asignar Tester</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group controlId="formTesters">
                        <Form.Label>Seleccionar Tester</Form.Label>
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
                    </Form.Group>

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
                                <Form.Label>Fecha Inicio</Form.Label>
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
                                <Form.Label>Fecha Fin</Form.Label>
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
        </div>
    );
};

export default AsignarCasosPrueba;
