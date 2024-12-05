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
import '../css/style.css';

const AsignarAdmin = ({ personaObtenida }) => {
    const navigate = useNavigate();
    const external_id = personaObtenida.external_id;

    const handleAsignarAdmin = async () => {
        if (!external_id) {
            mensajes('Seleccione una entidad para asignar como administrador.', 'error');
            return;
        }

        const body = {
            external_id: external_id
        };

        try {
            const response = await peticionPost(getToken(), 'asignar/admin', body);
            if (response.code === 200) {
                setTimeout(() => {
                    window.location.reload();
                }, 5000);
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

    return (
        <div>
            <div className='contenedor-fluid'>
                <div className="contenedor-carta ">
                    <Form.Group controlId="formEntidades">
                        <Form.Check
                            type="checkbox"
                            label="Asignar como administrador del sistema"
                        />
                    </Form.Group>
                    <div className='contenedor-filo'>
                        <Button variant="secondary" className="btn-negativo" onClick={handleCancelClick}>
                            <FontAwesomeIcon icon={faTimes} /> Cancelar
                        </Button>
                        <Button className="btn-positivo " onClick={handleAsignarAdmin}>
                            <FontAwesomeIcon icon={faCheck} /> Aceptar
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AsignarAdmin;
