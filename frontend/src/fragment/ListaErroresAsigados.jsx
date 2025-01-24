import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, FormControl, InputGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { peticionGet } from '../utilities/hooks/Conexion';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import '../css/style.css';
import  {mensajes} from '../utilities/Mensajes';
import { borrarSesion, getToken, getUser } from '../utilities/Sessionutil';
import TablePagination from '@mui/material/TablePagination';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';

const ListaErroresAsigados = () => {
    const [errores, setErrores] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [infoProyecto, setProyecto] = useState(null);
    const location = useLocation();
    const proyecto = location.state?.proyecto;
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const { external_id_proyecto } = useParams();
    const navigate = useNavigate();
    const user = getUser();
    const [condition, setCondition] = useState(true);
    if (condition) {
        peticionGet(getToken(), `proyecto/obtener/${external_id_proyecto}`).then((info) => {
              if (info.code === 200) {
                setProyecto(info.info);
            } else {
                borrarSesion();
                mensajes(info.mensajes);
                navigate('/login');
            }
        });

        peticionGet(getToken(), `error/obtener/asignado/proyecto/${user.user.id}/${external_id_proyecto}`).then((info) => {
            if (info.code === 200) {
                setErrores(info.info);
            } 
        });

        setCondition(false);
    }

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredErrores = errores.filter((error) => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        return (
            (error.titulo && error.titulo.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (error.estado && error.estado.toLowerCase().includes(lowerCaseSearchTerm))
        );
    });

    const handleNavigateToDetail = (external_id_error, external_id_caso_prueba) => {
        navigate(`/error/visualizar/${external_id_proyecto}/${external_id_caso_prueba}/${external_id_error}`);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    return (
        <div className="container-fluid">
            <div className="contenedor-centro">
                <div className="contenedor-carta">
                    <p className="titulo-proyecto">{infoProyecto?.nombre || "Cargando..."}</p>
                    <p className="titulo-primario">Lista de Errores</p>

                    <InputGroup className="mb-3">
                        <InputGroup.Text>
                            <FontAwesomeIcon icon={faSearch} />
                        </InputGroup.Text>
                        <FormControl
                            placeholder="Buscar por: Título, Estado"
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                    </InputGroup>
                    {filteredErrores.length > 0 ? (
                        <div className="table-responsive">
                            <table className="table table-striped">
                                <thead>
                                    <tr>
                                        <th className="text-center">Título</th>
                                        <th className="text-center">Severidad</th>
                                        <th className="text-center">Prioridad</th>
                                        <th className="text-center">
                                            Estado
                                            <OverlayTrigger
                                                placement="top"
                                                overlay={
                                                    <Tooltip className="custom-tooltip">
                                                        Indica el estado del error reportado
                                                        <table className="table table-bordered text-start m-0">
                                                            <thead>
                                                                <tr>
                                                                    <th>Valor</th>
                                                                    <th>Significado</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                <tr>
                                                                    <td>NUEVO</td>
                                                                    <td>El error se crea y aún no ha sido asignado a ningún desarrollador.</td>
                                                                </tr>
                                                                <tr>
                                                                    <td>CERRADO</td>
                                                                    <td>El tester valida que la corrección es correcta.</td>
                                                                </tr>
                                                                <tr>
                                                                    <td>PENDIENTE DE VALIDACION</td>
                                                                    <td>El error corregido pasa a validación por parte del tester.</td>
                                                                </tr>
                                                                <tr>
                                                                    <td>EN CORRECCION</td>
                                                                    <td>El error es asignado a un desarrollador para ser corregido.</td>
                                                                </tr>
                                                                <tr>
                                                                    <td>DEVUELTO</td>
                                                                    <td>El tester clasifica el error corregido por el desarrollador como incorrecto.</td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </Tooltip>
                                                }
                                            >
                                                <FontAwesomeIcon icon={faQuestionCircle} className="ms-2 text-info" />
                                            </OverlayTrigger>
                                        </th> <th className="text-center"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredErrores.map((error, index) => (
                                        <tr key={index}>
                                            <td>{error.titulo}</td>
                                            <td className="text-center">{error.severidad}</td>
                                            <td className="text-center">{error.prioridad}</td>
                                            <td className="text-center">{error.estado}</td>
                                            <td className="text-center">
                                                <Button
                                                    variant="btn btn-outline-info btn-rounded"
                                                    onClick={() => handleNavigateToDetail(error.external_id, error.caso_prueba.external_id)}
                                                    className="btn-icon"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="24"
                                                        height="24"
                                                        fill="currentColor"
                                                        className="bi bi-arrow-right-circle-fill"
                                                        viewBox="0 0 16 16"
                                                    >
                                                        <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0M4.5 7.5a.5.5 0 0 0 0 1h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5z" />
                                                    </svg>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <TablePagination
                                rowsPerPageOptions={[10, 25, 100]}
                                component="div"
                                count={filteredErrores.length}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                            />
                        </div>
                    ) : (
                        <div className="alert alert-success" role="alert">
                            No hay errores disponibles
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ListaErroresAsigados;
