import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Modal, FormControl, InputGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faPlus } from '@fortawesome/free-solid-svg-icons';
import CasoPrueba from './CasoPrueba';
import { peticionGet } from '../utilities/hooks/Conexion';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import '../css/style.css';
import mensajes from '../utilities/Mensajes';
import { getToken, getUser } from '../utilities/Sessionutil';
import TablePagination from '@mui/material/TablePagination';

const ListaCasoPrueba = () => {
    const [casosPrueba, setCasosPrueba] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showNewProjectModal, setShowNewProjectModal] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const proyecto = location.state?.proyecto;
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const { external_id_proyecto } = useParams();
    const [infoProyecto,setProyecto] = useState([]);
    const [rol, SetRol] = useState('false');
    

    useEffect(() => {        
        const fetchCasosPrueba = async () => {
            if (proyecto.id) {
                if (external_id_proyecto) {
                    peticionGet(getToken(), `proyecto/obtener/${external_id_proyecto}`).then((info) => {
                        if (info.code === 200) {
                            setProyecto(info.info);
                        } else {
                            mensajes(info.msg, "error", "Error");
                        }
                    }).catch((error) => {
                        mensajes("Error al cargar el proyecto", "error", "Error");
                        console.error(error);
                    });
                } 
                const response = await peticionGet(getToken(), `caso/prueba/listar/${getUser().user.id}?id_proyecto=${proyecto.id}`);
                if (response.code === 200) {
                    setCasosPrueba(response.info);
                    SetRol(response.rol);
                } else {
                    console.error('Error al obtener casos de prueba:', response.msg);
                }
            } else {
                console.error('Proyecto no definido.');
            }
        };

        fetchCasosPrueba();
    }, [proyecto]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredCasosPrueba = casosPrueba.filter((caso) => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();

        return (
            (caso.nombre && caso.nombre.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (caso.estado && caso.estado.toLowerCase().includes(lowerCaseSearchTerm))
        );
    });

    const handleNavigateToDetail = (external_id) => {
        navigate(`/caso-prueba/${external_id_proyecto}/${external_id}/${rol}`);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    return (
        <div className='container-fluid'>
            <div className='contenedor-centro'>
                <div className="contenedor-carta">
                <p className="titulo-proyecto">  Proyecto "{infoProyecto.nombre}"</p>
                    <div className='contenedor-filo'>
                        <Button
                            className="btn-normal mb-3"
                            onClick={() => navigate(`/registrar/caso/prueba/${external_id_proyecto}`)}
                        >
                            <FontAwesomeIcon icon={faPlus} /> Crear
                        </Button>
                    </div>
                    <p className="titulo-primario">Lista de Casos de Prueba</p>

                    <InputGroup className="mb-3">
                        <InputGroup.Text>
                            <FontAwesomeIcon icon={faSearch} />
                        </InputGroup.Text>
                        <FormControl
                            placeholder="Buscar por: Nombre, Estado"
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                    </InputGroup>
                    <div className="table-responsive">
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th className="text-center">Nombre</th>
                                    <th className="text-center">Estado</th>
                                    <th className="text-center"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCasosPrueba.length === 0 ? (
                                    <tr>
                                        <td colSpan="12" className="text-center">No hay casos de prueba disponibles.</td>
                                    </tr>
                                ) : (
                                    filteredCasosPrueba.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((caso) => (
                                        <tr key={caso.external_id}>
                                            <td>{caso.nombre}</td>
                                            <td className="text-center">{caso.estado}</td>
                                            <td className="text-center">
                                                <Button
                                                    variant="btn btn-outline-info btn-rounded"
                                                    onClick={() => handleNavigateToDetail(caso.external_id,rol)}
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
    );
};

export default ListaCasoPrueba;