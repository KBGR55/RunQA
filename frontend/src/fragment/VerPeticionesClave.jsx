import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { getToken, getUser } from '../utilities/Sessionutil';
import { peticionGet } from '../utilities/hooks/Conexion';
import mensajes from '../utilities/Mensajes';
import swal from 'sweetalert';

const VerPeticionesClave = () => {
    const [peticiones, setPeticiones] = useState([]);
    const [bucle, setBucle] = useState(false);

    useEffect(() => {
        if (!bucle) {
            peticionGet(getToken(), "peticion/CC").then((info) => {
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
        const [link, setLink] = useState('');
        const { correo, entidad } = cuentum;
        const { nombres, apellidos } = entidad;
        const fechaHora = format(new Date(createdAt), 'yyyy-MM-dd HH:mm:ss');

        const handleGenerarLink = () => {
            swal({
                title: "¿Está seguro de generar el enlace?",
                text: "El enlace permitirá al usuario cambiar su clave.",
                icon: "warning",
                buttons: ["No", "Sí"],
                dangerMode: true,
            }).then((willGenerate) => {
                if (willGenerate) {
                    peticionGet(getToken(), `aceptarechazar/peticiones/${external_id}/1/1/${getUser().user.id}`).then((info) => {
                        if (info.code !== 200) {
                            mensajes(info.msg);
                        } else {
                            const external_id_cuenta = info.info;
                            peticionGet(getToken(), `cuenta/token/${external_id_cuenta}`).then((info) => {
                                if (info.code !== 200 && (info.msg === "No existe token" || info.msg === "Token no valido")) {
                                    mensajes(info.msg);
                                } else {
                                    const token = info.info.token;
                                    setLink(`${window.location.origin}/cambio/clave/restablecer/${external_id_cuenta}/${token}`);
                                    mensajes("Enlace generado con éxito", "success", "Éxito");
                                }
                            });
                        }
                    });
                }
            });
        };
        

        const handleCopiarLink = () => {
            if (link) {
                navigator.clipboard.writeText(link).then(() => {
                    mensajes("Enlace copiado al portapapeles", "success", "Copiado");
                });
            }
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
                            <p className="peticion-mensaje">Petición: {peticion}</p>
                            {link && (
                                <div style={{ marginTop: '10px' }}>
                                    <label htmlFor={`link-${id}`}>Enlace generado:</label>
                                    <input
                                        id={`link-${id}`}
                                        type="text"
                                        value={link}
                                        readOnly
                                        style={{
                                            width: '100%',
                                            padding: '5px',
                                            backgroundColor: '#f1f1f1',
                                            border: '1px solid #ccc',
                                            borderRadius: '5px',
                                            marginTop: '5px',
                                        }}
                                    />
                                    <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>

                                        <button
                                            onClick={handleCopiarLink}
                                            className="btn-positivo"
                                        >
                                            Copiar enlace
                                        </button>
                                    </div>
                                </div>
                            )}
                            <div className="contenedor-filo">
                                <button
                                    type="button"
                                    onClick={handleGenerarLink}
                                    className="btn-positivo"
                                >
                                    Generar Link
                                </button>
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
                <h1 className="titulo-primario">Listado de Peticiones de Cambio de Clave</h1>
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

export default VerPeticionesClave;
