import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Form } from 'react-bootstrap';
import { peticionGet, peticionPost } from '../utilities/hooks/Conexion';
import { useNavigate, useParams } from 'react-router-dom';
import { getToken } from '../utilities/Sessionutil';
import mensajes from '../utilities/Mensajes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCheck } from '@fortawesome/free-solid-svg-icons';
import swal from 'sweetalert';

const AsignarAdmin = ({ external_id }) => {
    const [entidades, setEntidades] = useState([]);
    const [selectedEntidad, setSelectedEntidad] = useState(null);
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
    });

    console.log("222222", external_id);
    
    const handleEntidadSelect = (e) => {
        const entidadId = e.target.value;
        const selectedEntidad = entidades.find(entidad => entidad.id === parseInt(entidadId));
        setSelectedEntidad(selectedEntidad);
    };

    const handleAsignarAdmin = async () => {
        if (!selectedEntidad) {
            mensajes('Seleccione una entidad para asignar como administrador.', 'error');
            return;
        }

        const body = {
            external_id: external_id
        };

        try {
            const response = await peticionPost(getToken(), '/asignar/admin', body);
            if (response.code === 200) {
                setTimeout(() => {
                    window.location.reload();
                }, 1200);
                mensajes(response.msg);
            } else {
                mensajes(response.msg, 'error');
            }
        } catch (error) {
            console.error('Error al asignar administrador:', error);
        }
    };

    const handleCancelClick = () => {
        swal({
            title: "¿Está seguro de cancelar la asignación de administrador?",
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

    console.log("22222", external_id);

    return (
        <div>
            <div className='contenedor-fluid'>
                <div className="contenedor-carta">
                    <Form.Group controlId="formEntidades">
                        <Form.Check 
                            type="checkbox" 
                            label="Asignar como administrador del sistema" 
                            onChange={handleEntidadSelect} 
                        />
                    </Form.Group>

                    <Button variant="secondary" className="btn-negativo" onClick={handleCancelClick}>
                        <FontAwesomeIcon icon={faTimes} /> Cancelar
                    </Button>
                    <Button className="btn-positivo" onClick={handleAsignarAdmin}>
                        <FontAwesomeIcon icon={faCheck} /> Aceptar
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AsignarAdmin;
