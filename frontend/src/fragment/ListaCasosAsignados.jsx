import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { peticionGet } from '../utilities/hooks/Conexion';
import { useParams, useNavigate } from 'react-router-dom';
import '../css/style.css';
import mensajes from '../utilities/Mensajes';
import { borrarSesion, getToken } from '../utilities/Sessionutil';
import { Button, FormControl, InputGroup } from 'react-bootstrap';
import TablePagination from '@mui/material/TablePagination';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

const ListaCasosAsignados = () => {
    const [casosPrueba, setCasosPrueba] = useState([]);
    const { external_id_proyecto, external_id_casoprueba } = useParams();
    const navigate = useNavigate();
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        peticionGet(getToken(), 'contrato/asignados').then((info) => {
            if (info.code !== 200 && info.msg === 'Acceso denegado. Token a expirado') {
                borrarSesion();
                mensajes(info.mensajes);
                navigate("/login");
            } else {
                setCasosPrueba(info.info);
            }
        });

    }, [navigate, external_id_proyecto, external_id_casoprueba]);
    
    const formatDate = (dateString) => {
        return new Date(dateString).toISOString().slice(0, 10); 
    }

    const handleNavigateToDetail = (external_id_proyecto, external_id_casoprueba) => {
        navigate(`/casos/prueba-asignado/${external_id_proyecto}/${external_id_casoprueba}`);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredCasosPrueba = casosPrueba.filter((caso) => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        return (
            (caso.nombre_caso_prueba && caso.nombre_caso_prueba.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (caso.clasificacion && caso.clasificacion.toLowerCase().includes(lowerCaseSearchTerm))
        );
    });

    return (
        <div>
            <div className='container-fluid'>
                <div className='contenedor-centro'>
                    <div className="contenedor-carta">
                        <p className="titulo-primario">Lista de Casos de Prueba Asignados</p>

                        <InputGroup className="mb-3">
                            <InputGroup.Text>
                                <FontAwesomeIcon icon={faSearch} />
                            </InputGroup.Text>
                            <FormControl
                                placeholder="Buscar por: Nombre, Clasificación"
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                        </InputGroup>

                        <div className="table-responsive">
                            <table className="table table-striped">
                                <thead>
                                    <tr>
                                        <th className="text-center">Nombre</th>
                                        <th className="text-center">Clasificación</th>
                                        <th className="text-center">Fecha Fin</th>
                                        <th className="text-center">Ver detalle</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCasosPrueba.length === 0 ? (
                                        <tr>
                                            <td colSpan="12" className="text-center">No hay asignaciones para casos de prueba</td>
                                        </tr>
                                    ) : (
                                        filteredCasosPrueba.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((caso) => (
                                            <tr key={caso.external_id}>
                                                <td>{caso.nombre_caso_prueba}</td>
                                                <td>{caso.clasificacion}</td>
                                                <td>{formatDate(caso.fecha_fin)}</td>
                                                <td className="text-center">
                                                    <Button
                                                        variant="btn btn-outline-info btn-rounded"
                                                        onClick={() => handleNavigateToDetail(external_id_proyecto, caso.external_id)}
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
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <TablePagination
                            rowsPerPageOptions={[10, 25, 100]}
                            component="div"
                            count={filteredCasosPrueba.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                        />
                    </div>
                </div>
            </div>
        </div>

    );
};

export default ListaCasosAsignados;