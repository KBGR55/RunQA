import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Form } from 'react-bootstrap';
import { peticionGet, peticionPost } from '../utilities/hooks/Conexion';
import { useNavigate, useParams } from 'react-router-dom';
import { getToken } from '../utilities/Sessionutil';
import mensajes from '../utilities/Mensajes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCheck, faTrash } from '@fortawesome/free-solid-svg-icons';
import swal from 'sweetalert';

const AsignarLideres = () => {
    const { external_id } = useParams();
    const [entidades, setEntidades] = useState([]);
    const [selectedLideres, setSelectedLideres] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEntidades = async () => {
            try {
                const info = await peticionGet(getToken(), '/listar/entidad/activos');
                if (info.code === 200) {
                    setEntidades(info.info);
                } else {
                    mensajes(info.msg, 'error');
                }
            } catch (error) {
                console.error('Error al cargar las entidades:', error);
            }
        };

        fetchEntidades();
    }, [external_id]);


    const handleEntidadSelect = (e) => {
        const entidadId = e.target.value;
        const selectedEntidad = entidades.find(entidad => entidad.id === parseInt(entidadId));
        if (selectedEntidad && !selectedLideres.some(l => l.id === selectedEntidad.id)) {
            setSelectedLideres(prevSelected => [...prevSelected, selectedEntidad]);
            setEntidades(prevEntidades => prevEntidades.filter(ent => ent.id !== parseInt(entidadId)));
            e.target.selectedIndex = 0;
        }
    };

    const handleRemoveLider = (id) => {
        const removedLider = selectedLideres.find(l => l.id === id);
        setSelectedLideres(prevSelected => prevSelected.filter(l => l.id !== id));
        setEntidades(prevEntidades => [...prevEntidades, removedLider]);
    };

    const handleAsignarLideres = async () => {
        const body = {
            lideres: selectedLideres.map(l => ({ id_entidad: l.id }))
        };

        try {
            const response = await peticionPost(getToken(), '/asignar/lideres', body);
            if (response.code === 200) {
                setTimeout(() => {
                    window.location.reload();
                }, 1200);
                mensajes(response.msg);
            } else {
                mensajes(response.msg, 'error');
            }
        } catch (error) {
            console.error('Error al asignar líderes:', error);
        }
    };

    const handleCancelClick = () => {
        swal({
            title: "¿Está seguro de cancelar la asignación de lideres?",
            text: "Una vez cancelado, no podrá revertir esta acción",
            icon: "warning",
            buttons: ["No", "Sí"],
            dangerMode: true,
        }).then((willCancel) => {
            if (willCancel) {
                mensajes("Asignación cancelada", "info", "Información");
                navigate('/usuarios');
            }
        });
    };

    return (
        <div>
            <div className='contenedor-fluid'>
                <div className="contenedor-carta">
                    <Form.Group controlId="formEntidades">
                        <Form.Control as="select" onChange={handleEntidadSelect} defaultValue="">
                            <option value="" disabled>Selecciona una persona</option>
                            {entidades.map(entidad => (
                                <option key={entidad.id} value={entidad.id}>
                                    {entidad.nombres} {entidad.apellidos}
                                </option>
                            ))}
                        </Form.Control>
                    </Form.Group>

                    {selectedLideres.length > 0 && (
                        <div className="mt-4">
                            <h6 style={{ fontWeight: 'bold', color: '#3FA2F6' }}>Líderes Seleccionados:</h6>
                            <ul className="list-group">
                                {selectedLideres.map(lider => (
                                    <li key={lider.id} className="list-group-item d-flex justify-content-between align-items-center">
                                        <div>
                                            <strong>{lider.nombres} {lider.apellidos}</strong>
                                            <br />
                                            <span>{lider.correo}</span>
                                        </div>
                                        <Button variant="danger" size="sm" onClick={() => handleRemoveLider(lider.id)}>
                                            <FontAwesomeIcon icon={faTrash} />
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <Button variant="secondary" className="btn-negativo" onClick={handleCancelClick}>
                        <FontAwesomeIcon icon={faTimes} /> Cancelar
                    </Button>
                    <Button className="btn-positivo" onClick={handleAsignarLideres}>
                        <FontAwesomeIcon icon={faCheck} /> Aceptar
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AsignarLideres;
