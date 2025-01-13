import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { getToken, getUser } from '../utilities/Sessionutil';
import { peticionGet } from '../utilities/hooks/Conexion';
import mensajes from '../utilities/Mensajes';
import swal from 'sweetalert';

const VerPeticion = () => {
    const [peticiones, setPeticiones] = useState([]);
    const [bucle, setBucle] = useState(false);

    useEffect(() => {
        if (!bucle) {
            peticionGet(getToken(), "peticion/RI").then((info) => {
                if (info.code !== 200 && (info.msg === "No existe token" || info.msg === "Token no valido")) {
                    mensajes(info.msg);
                } else {
                    setBucle(true);
                    setPeticiones(info.info);
                }
            });
        }
    }, [bucle]);

    const PeticionCard = ({ id, peticion, external_id, createdAt, cuentum }) => {
        const [abierto, setAbierto] = useState(false);
        const { correo, entidad } = cuentum;
        const { nombres, apellidos } = entidad;
        var fechaHora = format(new Date(createdAt), 'yyyy-MM-dd HH:mm:ss');

        const handleAceptar = () => {
            swal({
                title: "¿Está seguro de aceptar la petición?",
                text: "Esta acción no se podrá deshacer.",
                icon: "warning",
                buttons: ["No", "Sí"],
                dangerMode: true,
            }).then((willAccept) => {
                if (willAccept) {
                    acepReac(1);
                }
            });
        };

        const handleRechazar = () => {
            swal({
                title: "Motivo del rechazo",
                text: "Por favor, escriba el motivo del rechazo (máximo 300 caracteres):",
                content: {
                    element: "input",
                    attributes: {
                        placeholder: "Ingrese el motivo",
                        maxLength: 300,
                    },
                },
                buttons: ["Cancelar", "Rechazar"],
            }).then((motivo) => {
                if (motivo) {
                    acepReac(0, motivo);
                    setPeticiones((prevPeticiones) =>
                        prevPeticiones.filter((p) => p.external_id !== external_id)
                    );
                }
            });
        };

        const acepReac = (datac, motivo = "") => {
            var motivoParam = encodeURIComponent(motivo); 
            if (!motivoParam) {
                motivoParam='true';
            }
            peticionGet(getToken(), `aceptarechazar/peticiones/${external_id}/${datac}/${motivoParam}/${getUser().user.id}`).then((info) => {
                if (info.code !== 200) {
                    mensajes(info.msg);
                } else {
                    mensajes(info.msg, "success", "Éxito");
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
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