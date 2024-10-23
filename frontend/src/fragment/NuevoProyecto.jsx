import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/style.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom'; 
import { peticionPost } from '../utilities/hooks/Conexion';
import mensajes from '../utilities/Mensajes';
import { getToken, getUser } from '../utilities/Sessionutil';

const NuevoProyecto = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const navigate = useNavigate(); 

    const onSubmit = (event) => {
        event.preventDefault(); 
        if (!name ) {
            mensajes('Faltan campos obligatorios', "error", "Error");
            return;
        }

        if (name.length > 20) {
            mensajes('El nombre del proyecto no puede exceder los 20 caracteres', "error", "Error");
            return;
        }

        if (description.length > 50) {
            mensajes('La descripción no puede exceder los 50 caracteres', "error", "Error");
            return;
        }

        var datos = {
            "id_entidad":getUser().user.id , 
            "name": name,
            "description": description,
     };

        peticionPost(getToken(), 'proyecto', datos).then((info) => {
            if (info.code !== 200) {
                mensajes(info.msg, "error", "Error");
            } else {
                mensajes(info.msg, "success", "Éxito");
               navigate('/proyectos');
            }
        });
    };

    return (
        <>
            <div className="contenedor-carta">
                <form onSubmit={onSubmit}>
                    <div className="mb-3">
                        <label htmlFor="nombreProyecto" className="form-label">Nombre del proyecto</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            id="nombreProyecto" 
                            placeholder="Escribe el nombre del proyecto..." 
                            value={name}
                            onChange={(e) => setName(e.target.value)}  
                            maxLength={20} 
                        />
                        <small className="text-muted">{name.length}/20 caracteres</small>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="descripcionProyecto" className="form-label">Descripción</label>
                        <textarea 
                            className="form-control" 
                            id="descripcionProyecto" 
                            rows="3" 
                            placeholder="Escribe la descripción..." 
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}  
                            maxLength={50} 
                        ></textarea>
                        <small className="text-muted">{description.length}/50 caracteres</small>
                    </div>
                    <div className="contenedor-filo">
                        <button type="button" onClick={() => window.location.reload()}  className="btn-negativo">
                            <FontAwesomeIcon icon={faTimes} /> Cancelar
                        </button>
                        <button className="btn-positivo" type="submit">
                            <FontAwesomeIcon icon={faCheck} /> Registrar
                        </button>
                    </div>
                </form>
            </div>
           
        </>
    );
};

export default NuevoProyecto;
