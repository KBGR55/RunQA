import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { getToken } from '../utilities/Sessionutil';
import { peticionGet } from '../utilities/hooks/Conexion';
import mensajes from '../utilities/Mensajes';

const VerPeticion = () => {
    const [peticiones, setPeticiones] = useState([]);
    const [bucle, setBucle] = useState(false);

    useEffect(() => {
        if (!bucle) {
            peticionGet(getToken(), "peticion").then((info) => {
                if (info.code !== 200 && (info.msg === "No existe token" || info.msg === "Token no valido")) {
                    mensajes(info.msg);
                } else {
                    setBucle(true);
                    setPeticiones(info.info);
                }
            })
        }
    }, [bucle]);

    const PeticionCard = ({ id, peticion, external_id, createdAt, cuentum }) => {
        const [abierto, setAbierto] = useState(false);
        const { correo, entidad } = cuentum;
        const { nombres, apellidos } = entidad;
        var fechaHora = format(new Date(createdAt), 'yyyy-MM-dd HH:mm:ss');

        const handleAceptar = () => {
            acepReac(1);
        };

        const handleRechazar = () => {
            acepReac(0);
            setPeticiones((prevPeticiones) =>
                prevPeticiones.filter((p) => p.external_id !== external_id)
            );
        };

        const acepReac = (datac) => {
            peticionGet(getToken(), `aceptarechazar/peticiones/${external_id}/${datac}`).then((info) => {
                if (info.code !== 200) {
                    mensajes(info.msg);
                } else {
                    mensajes(info.msg, "success", "Éxito");
                    setTimeout(() => {
                        window.location.reload();
                    }, 1200);
                }
            });
        };

        return (
            <div className="peticion-card-container">
                <div
                    className={`peticion-card ${abierto ? 'abierto' : ''}`}
                    onClick={() => setAbierto(!abierto)}
                >
                    <div className="peticion-card-header">
                        <h3 className="peticion-titulo">{nombres + " " + apellidos}</h3>
                        <p className="peticion-correo">{correo}</p>
                        <p className="peticion-fecha">Fecha y Hora: {fechaHora}</p>
                    </div>
                    {abierto && (
                        <div className="peticion-details">
                            <p className="peticion-mensaje">Petición: {peticion} </p>
                            <div className="contenedor-filo">
                                <button type="button" onClick={handleRechazar} className="btn-negativo">Rechazar</button>
                                <button type="submit" onClick={handleAceptar} className="btn-positivo">Aceptar</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="contenedor-carta">
            <div className="header">
                <h1 className="titulo-primario">Listado de Peticiones</h1>
            </div>
            <div className="peticiones-container">
                {peticiones.length === 0 ? (
                   <div className="text-center">
                   <p className="text-muted">No hay peticiones pendientes</p>
               </div>
                ) : (
                    peticiones.map((peticion) => (
                        <PeticionCard key={peticion.id} {...peticion} />
                    ))
                )}
            </div>
        </div>
    );
};

export default VerPeticion;
