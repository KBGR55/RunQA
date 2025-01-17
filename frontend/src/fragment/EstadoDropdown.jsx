import React, { useState } from 'react';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import { borrarSesion, getToken } from '../utilities/Sessionutil';
import { peticionGet } from '../utilities/hooks/Conexion';
import mensajes from '../utilities/Mensajes';
import { useNavigate } from 'react-router-dom';

const EstadoDropdown = ({ currentEstado, onChangeEstado, id_error }) => {
    const navigate = useNavigate();
    const estados = ['NUEVO', 'CORRECCION', 'CERRADO', 'PENDIENTE_VALIDACION'];
    
    const getColorClass = (estado) => {
        switch (estado) {
            case 'NUEVO':
                return 'bg-primary';
            case 'CORRECCION':
                return 'bg-danger';
            case 'CERRADO':
                return 'bg-secondary';
            case 'PENDIENTE_VALIDACION':
                return 'bg-warning';
            default:
                return 'bg-secondary';
        }
    };

    const handleEstadoChange = (estado) => {
        peticionGet(getToken(), `error/cambiar/estado/${estado}/${id_error}`).then((info) => {
            if (info.code === 200) {
                onChangeEstado(estado);  // Actualiza el estado en VerError
            } else {
                borrarSesion();
                mensajes(info.mensajes);
                navigate("main");
            }
        });
    };
    

    return (
        <div className="d-flex align-items-center">
            <span className={`badge ${getColorClass(currentEstado)}`} style={{ marginRight: '10px' }}>
                {currentEstado || 'No disponible'}
            </span>
            <DropdownButton
                title={<span className="text-secondary">▼</span>}
                variant="outline-secondary"
                size="sm"
                id="dropdown-estado"
            >
                {estados.map((estado) => (
                    <Dropdown.Item
                        key={estado}
                        onClick={() => handleEstadoChange(estado)}
                        active={estado === currentEstado}
                    >
                        {estado}
                    </Dropdown.Item>
                ))}
            </DropdownButton>
        </div>
    );
};

export default EstadoDropdown;
