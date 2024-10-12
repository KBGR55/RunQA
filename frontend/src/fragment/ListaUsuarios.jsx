import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons'; // Importar el ícono
import MenuBar from './MenuBar';
import RegistrarCasoPrueba from './CasoPrueba';
import '../css/style.css';
import '../css/Usuarios_Style.css';
import { peticionGet, URLBASE } from '../utilities/hooks/Conexion';
import { useNavigate } from 'react-router-dom';
import { getToken, borrarSesion } from '../utilities/Sessionutil';
import mensajes from '../utilities/Mensajes';
import EditarPersona from './EditarPersona';

const ListaUsuarios = () => {
    const [showModal, setShowModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [llUsuarios, setUsuarios] = useState(false);
    const [data, setData] = useState([]);
    const navigate = useNavigate();
    const [personaObtenida, setpersonaObtenida] = useState([]);
    const [tablaListarPersonas, setTablaListarPersonas] = useState([]);

    //SHOW EDITAR
    const [showEdit, setShowEdit] = useState(false);
    const handleCloseEdit = () => setShowEdit(false);
    const handleShowEdit = () => setShowEdit(true);

    useEffect(() => {
        if (!llUsuarios) {
            peticionGet(getToken(), '/listar/entidad').then((info) => {
                if (info.code !== 200 && info.msg === 'Acceso denegado. Token a expirado') {
                    borrarSesion();
                    mensajes(info.mensajes);
                    navigate("/principal");
                } else {
                    setData(info.info);
                    setUsuarios(true);
                }
            });
        }
    }, [llUsuarios, navigate]);

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedProject(null);
    };

    //CAMBIAR FORMATO FECHA
    const obtenerFechaFormateada = (fechaString) => {
        const fecha = new Date(fechaString);
        fecha.setDate(fecha.getDate() + 1); // Ajustar la fecha sumando 1 día
        const year = fecha.getFullYear();
        const month = ('0' + (fecha.getMonth() + 1)).slice(-2);
        const day = ('0' + fecha.getDate()).slice(-2);
        return `${year}-${month}-${day}`;
    };

    //ACCION HABILITAR EDICION CAMPOS
    const handleChange = e => {
        const { name, value } = e.target;
        setpersonaObtenida((prevState) => ({
            ...prevState,
            [name]: value
        }));
    }

    const handleSearch = e => {
        filtrar(e.target.value);
    }

    const filtrar = (terminoBusqueda) => {
        const estadoActivo = "ACTIVO";
        const estadoDadoDeBaja = "DADO DE BAJA";

        var resultadosBusqueda = tablaListarPersonas.filter((elemento) => {
            const cedulaIncluida = elemento.identificacion && elemento.identificacion.toString().toLowerCase().includes(terminoBusqueda.toLowerCase());
            const rolIncluido = elemento.persona_rol && elemento.persona_rol.some((rol) => rol.rol.tipo.toLowerCase().includes(terminoBusqueda.toLowerCase()));
            const estadoIncluido =
                (terminoBusqueda.toLowerCase() === estadoActivo.toLowerCase() && elemento.estado) ||
                (terminoBusqueda.toLowerCase() === estadoDadoDeBaja.toLowerCase() && !elemento.estado);
            return cedulaIncluida || rolIncluido || estadoIncluido;
        });
        setData(resultadosBusqueda);
    };

    const obtenerId = (externalId) => {
        peticionGet(getToken(), `/obtener/entidad/${externalId}`).then((info) => {
            var datos = info.info;
            if (info.code !== 200 || info.msg === "TOKEN NO VALIDO O EXPIRADO") {
                mensajes(info.msg, "error", "error");
            } else {
                setpersonaObtenida(datos);
            }
        });
    };


    return (
        <div>
            <MenuBar />
            <div className="contenedor-centro">
                <div className='contenedor-carta '>
                    <main className="table">
                        <section className='table_header'>
                            <h1 className="titulo-primario">Lista de Usuarios</h1>
                        </section>
                        <section className='table_body'>
                            <div className="table-responsive">
                                <table className="table table-striped">
                                    <thead>
                                        <tr>
                                            <th className="text-center">Avatar</th>
                                            <th className="text-center">Nombres</th>
                                            <th className="text-center">Apellidos</th>
                                            <th className="text-center">Estado</th>
                                            <th className="text-center">Fecha de Nacimiento</th>
                                            <th className="text-center">Telefono</th>
                                            <th className="text-center">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.map((data) => (
                                            <tr key={data.id}>
                                                <td className="text-center" style={{ backgroundColor: "#FFFFFF", border: "none" }}>
                                                    <img src={URLBASE + "/images/users/" + data.foto} alt="Avatar" style={{ width: '50px', height: '50px' }} />
                                                </td>
                                                <td className="text-center">{data.nombres}</td>
                                                <td className="text-center">{data.apellidos}</td>
                                                <td className="text-center">{data.estado ? 'Activo' : 'Desactivo'}</td>
                                                <td className="text-center">{obtenerFechaFormateada(data.fecha_nacimiento)}</td>
                                                <td className="text-center">{data.telefono}</td>
                                                <td className="text-center">

                                                    <Button variant="btn btn-outline-info btn-rounded" onClick={() => {
                                                        handleShowEdit();
                                                        obtenerId(data.external_id);
                                                    }}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
                                                            <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                                                            <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z" />
                                                        </svg>
                                                    </Button>

                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </main>

                </div>
                {/* < VENTANA MODAL EDITAR> */}
                <Modal
                    show={showEdit}
                    onHide={handleCloseEdit}
                    backdrop="static"
                    keyboard={false}
                >
                    <Modal.Header>
                        <Modal.Title className='titulo-primario'>Editar persona</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <EditarPersona personaObtenida={personaObtenida} handleChange={handleChange} />

                    </Modal.Body>
                </Modal>

            </div>

        </div>
    );
};

export default ListaUsuarios;