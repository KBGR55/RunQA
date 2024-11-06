import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Modal, FormControl, InputGroup } from 'react-bootstrap';
import '../css/style.css';
import '../css/Usuarios_Style.css';
import { peticionGet, URLBASE } from '../utilities/hooks/Conexion';
import { useNavigate } from 'react-router-dom';
import { getToken, borrarSesion } from '../utilities/Sessionutil';
import mensajes from '../utilities/Mensajes';
import EditarPersona from './EditarPersona';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTimes, faCheck, faSearch } from '@fortawesome/free-solid-svg-icons';
import Registrar from '../fragment/Registrar';
import AsignarLideres from './AsignarLideres';
import AsignarAdmin from './AsignarAdmin';
import TablePagination from '@mui/material/TablePagination';

const ListaUsuarios = () => {
    const [data, setData] = useState([]);
    const navigate = useNavigate();
    const [personaObtenida, setpersonaObtenida] = useState([]);
    const [showEdit, setShowEdit] = useState(false);
    const handleCloseEdit = () => setShowEdit(false);
    const handleShowEdit = () => setShowEdit(true);
    const [showNewProjectModal, setShowNewProjectModal] = useState(false);
    const [showAsignarModal, setShowAsignarModal] = useState(false);
    const [showAsignarAdminModal, setShowAsignarAdminModal] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        peticionGet(getToken(), 'listar/entidad').then((info) => {
            if (info.code !== 200 && info.msg === 'Acceso denegado. Token a expirado') {
                borrarSesion();
                mensajes(info.mensajes);
                navigate("main");
            } else {
                setData(info.info);
            }
        });
    }, [navigate]);

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

    const obtenerId = (externalId) => {
        peticionGet(getToken(), `obtener/entidad/${externalId}`).then((info) => {
            if (info.code !== 200 ) {
                mensajes(info.msg, "error", "error");
            } else {
                setpersonaObtenida(info.info);
            }
        });
    };

    const handleShowNewProjectModal = () => {
        setShowNewProjectModal(true);
    };

    const handleCloseNewProjectModal = () => {
        setShowNewProjectModal(false);
    };

    // Abrir modal de asignación de líderes
    const handleShowAsignarModal = () => {
        setShowAsignarModal(true);
    };

    // Cerrar modal de asignación de líderes
    const handleCloseAsignarModal = () => {
        setShowAsignarModal(false);
    };

    // Abrir modal de asignación de líderes
    const handleShowAsignarAdminModal = () => {
        setShowAsignarAdminModal(true);
    };

    // Cerrar modal de asignación de líderes
    const handleCloseAsignarAdminModal = () => {
        setShowAsignarAdminModal(false);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0); // Reiniciar la página a 0 cuando se cambia el número de filas por página
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredData = data.filter((user) => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        return (
            (user.nombres && user.nombres.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (user.apellidos && user.apellidos.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (user.telefono && user.telefono.toLowerCase().includes(lowerCaseSearchTerm))
        );
    });

    return (
        <div>
            <div className="contenedor-centro">
                <div className='contenedor-carta '>
                    <div className='contenedor-filo'>
                        <Button
                            className="btn-normal mb-3"
                            onClick={handleShowAsignarModal}
                        >  <FontAwesomeIcon icon={faPlus} /> Crear Lideres de Calidad
                        </Button>
                    </div>
                    <main className="table">
                        <section className='table_header'>
                            <h1 className="titulo-primario">Lista de Usuarios</h1>

                            <InputGroup className="mb-3">
                                <InputGroup.Text>
                                    <FontAwesomeIcon icon={faSearch} />
                                </InputGroup.Text>
                                <FormControl
                                    placeholder="Buscar por: Nombres, Apellidos, Telefono"
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                />
                            </InputGroup>
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
                                            <th className="text-center">Fecha de nacimiento</th>
                                            <th className="text-center">Telefono</th>
                                            <th className="text-center">Horas disponibles</th>
                                            <th className="text-center">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredData.length === 0 ? (
                                            <tr>
                                                <td colSpan="7" className="text-center">
                                                    No existen usuarios registrados.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((data) => (
                                                <tr key={data.id}>
                                                    <td className="text-center" style={{ backgroundColor: "#FFFFFF", border: "none" }}>
                                                        <img src={URLBASE + "images/users/" + data.foto} alt="Avatar" style={{ width: '50px', height: '50px' }} />
                                                    </td>
                                                    <td className="text-center">{data.nombres}</td>
                                                    <td className="text-center">{data.apellidos}</td>
                                                    <td className="text-center">{data.estado ? 'Activo' : 'Desactivo'}</td>
                                                    <td className="text-center">{obtenerFechaFormateada(data.fecha_nacimiento)}</td>
                                                    <td className="text-center">{data.telefono}</td>
                                                    <td className="text-center">{data.horasDisponibles}</td>
                                                    <td className="text-center">
                                                        <Button style={{ margin: '5px' }}
                                                            variant="btn btn-outline-info btn-rounded"
                                                            disabled={data.rol_entidad.some(rol => rol.id_rol === 1)}
                                                            onClick={() => {
                                                                handleShowEdit();
                                                                obtenerId(data.external_id);
                                                            }}
                                                            className={data.rol_entidad.some(rol => rol.id_rol === 1) ? 'btn-secondary' : 'btn-outline-info'}
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil-square" viewBox="0 0 16 16">
                                                                <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                                                                <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z" />
                                                            </svg>
                                                        </Button>

                                                        <Button
                                                            variant="btn btn-outline-primary btn-rounded"
                                                            disabled={data.rol_entidad.some(rol => rol.id_rol === 1)}
                                                            onClick={() => {
                                                                handleShowAsignarAdminModal();
                                                                obtenerId(data.external_id);
                                                            }}
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-person-gear" viewBox="0 0 16 16">
                                                                <path d="M11 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0M8 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4m.256 7a4.5 4.5 0 0 1-.229-1.004H3c.001-.246.154-.986.832-1.664C4.484 10.68 5.711 10 8 10q.39 0 .74.025c.226-.341.496-.65.804-.918Q8.844 9.002 8 9c-5 0-6 3-6 4s1 1 1 1zm3.63-4.54c.18-.613 1.048-.613 1.229 0l.043.148a.64.64 0 0 0 .921.382l.136-.074c.561-.306 1.175.308.87.869l-.075.136a.64.64 0 0 0 .382.92l.149.045c.612.18.612 1.048 0 1.229l-.15.043a.64.64 0 0 0-.38.921l.074.136c.305.561-.309 1.175-.87.87l-.136-.075a.64.64 0 0 0-.92.382l-.045.149c-.18.612-1.048.612-1.229 0l-.043-.15a.64.64 0 0 0-.921-.38l-.136.074c-.561.305-1.175-.309-.87-.87l.075-.136a.64.64 0 0 0-.382-.92l-.148-.045c-.613-.18-.613-1.048 0-1.229l.148-.043a.64.64 0 0 0 .382-.921l-.074-.136c-.306-.561.308-1.175.869-.87l.136.075a.64.64 0 0 0 .92-.382zM14 12.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0" />
                                                            </svg>
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                        <TablePagination
                            rowsPerPageOptions={[10, 25, 100]}
                            component="div"
                            count={filteredData.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                        />
                    </main>
                </div>
                {/* < VENTANA MODAL EDITAR> */}
                <Modal
                    show={showEdit}
                    onHide={handleCloseEdit}
                    backdrop="static"
                    keyboard={false}
                >
                    <Modal.Header closeButton>
                        <Modal.Title className='titulo-primario'>Editar persona</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <EditarPersona personaObtenida={personaObtenida} handleChange={handleChange} />

                    </Modal.Body>
                </Modal>               

                {/* Modal para asignar líderes */}
                <Modal show={showAsignarModal} onHide={handleCloseAsignarModal} backdrop="static" keyboard={false}>
                    <Modal.Header closeButton>
                        <Modal.Title className="titulo-primario">Asignar Líderes de Calidad</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <AsignarLideres />
                    </Modal.Body>
                </Modal>

                {/* Modal para asignar admins */}
                <Modal show={showAsignarAdminModal} onHide={handleCloseAsignarAdminModal} backdrop="static" keyboard={false}>
                    <Modal.Header closeButton>
                        <Modal.Title className="titulo-primario">Asignar administrador del sistema</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <AsignarAdmin personaObtenida={personaObtenida} />
                    </Modal.Body>
                </Modal>
            </div>
        </div>
    );
};

export default ListaUsuarios;
