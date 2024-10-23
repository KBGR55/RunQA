import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Modal, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCheck, faPlus } from '@fortawesome/free-solid-svg-icons';
import { peticionGet, peticionPost } from '../utilities/hooks/Conexion';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { borrarSesion, getExternalProyecto, getToken, getUser } from '../utilities/Sessionutil';
import mensajes from '../utilities/Mensajes';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import swal from 'sweetalert';
import NavbarComplet from './NavbarComplet';

const AsignarCasosPrueba = () => {
    const external_id = useParams();
    const [showNewProjectModal, setShowNewProjectModal] = useState(false);
    const [casosPrueba, setCasosPrueba] = useState([]);
    const [testers, setTesters] = useState([]);
    const [selectedTesters, setSelectedTesters] = useState([]);
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

    console.log("exxx", external_id);
    

    useEffect(() => {
        const fetchTesters = async () => {
            try {
                const info = await peticionGet(getToken(), `proyecto/listar/tester/${external_id}`);
                if (info.code === 200) {
                    setTesters(info.info);
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
        setSelectedTesters([]);
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
        const selectedTester = testers.find(tester => tester.id === parseInt(testerId));
        if (selectedTester && !selectedTesters.some(t => t.id === selectedTester.id)) {
            setSelectedTesters(prevSelected => [...prevSelected, selectedTester]);
            setTesters(prevTesters => prevTesters.filter(t => t.id !== parseInt(testerId)));
            e.target.selectedIndex = 0;
        }
    };

    const handleRemoveTester = (id) => {
        const removedTester = selectedTesters.find(t => t.id === id);
        setSelectedTesters(prevSelected => prevSelected.filter(t => t.id !== id));
        setTesters(prevTesters => [...prevTesters, removedTester]);
    };

    const handleAsignarTesters = async () => {
        const body = {
            id_proyecto: external_id,
            testers: selectedTesters.map(t => ({ id_entidad: t.id })),
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
            console.error('Error al asignar testers:', error);
        }
    };

    const handleCancelClick = () => {
        swal({
            title: "¿Está seguro de cancelar la asignación de testers?",
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
                                                    <div style={{ textAlign: 'left', marginLeft:'15px' }}>
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
                    <Modal.Title className='titulo-primario'>Asignar Testers</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {/* Combobox para seleccionar testers */}
                    <Form.Group controlId="formTesters">
                        <Form.Label>Seleccionar Tester</Form.Label>
                        <Form.Control as="select" onChange={handleTesterSelect} defaultValue="">
                            <option value="" disabled>Selecciona un tester</option>
                            {testers.map(tester => (
                                <option key={tester.id} value={tester.id}>
                                    {tester.nombres} {tester.apellidos}
                                </option>
                            ))}
                        </Form.Control>
                    </Form.Group>

                    {/* Testers seleccionados */}
                    {selectedTesters.length > 0 && (
                        <div className="mt-4">
                            <h6 style={{ fontWeight: 'bold', color: '#3FA2F6' }}>Testers Seleccionados:</h6>
                            <ul className="list-group">
                                {selectedTesters.map(tester => (
                                    <li key={tester.id} className="list-group-item d-flex justify-content-between align-items-center">
                                        <div>
                                            <strong>{tester.nombres} {tester.apellidos}</strong>
                                            <br />
                                            <span>{tester.correo}</span>
                                        </div>
                                        <Button variant="danger" size="sm" onClick={() => handleRemoveTester(tester.id)}>
                                            Quitar
                                        </Button>
                                    </li>

                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Contenedor para los dos calendarios */}
                    <div className="row">
                        {/* Calendario para seleccionar la fecha de inicio de prueba */}
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

                        {/* Calendario para seleccionar la fecha de fin de prueba */}
                        <div className="col-md-6">
                            <Form.Group controlId="formFechaFinPrueba" className="mt-2">
                                <Form.Label>Fecha Fin</Form.Label>
                                <DatePicker
                                    selected={fechaFinPrueba}
                                    onChange={date => setFechaFinPrueba(date)}
                                    dateFormat="yyyy/MM/dd"
                                    className="form-control"
                                    placeholderText="Selecciona la fecha"
                                    minDate={fechaInicioPrueba || new Date()}
                                    popperPlacement="bottom-start"
                                />
                            </Form.Group>
                        </div>
                    </div>


                </Modal.Body>
                <Modal.Footer>
                    <div className="contenedor-filo">
                        <Button variant="secondary" className="btn-negativo" onClick={handleCancelClick}>
                            <FontAwesomeIcon icon={faTimes} /> Cancelar
                        </Button>
                        <Button className="btn-positivo" onClick={handleAsignarTesters} type="submit" disabled={selectedTesters.length === 0 || !fechaInicioPrueba || !fechaFinPrueba}>
                            <FontAwesomeIcon icon={faCheck} /> Aceptar
                        </Button>
                    </div>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default AsignarCasosPrueba;
