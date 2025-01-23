import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faPencilAlt, faRedoAlt } from '@fortawesome/free-solid-svg-icons';
import { peticionGet } from '../utilities/hooks/Conexion';
import { useNavigate, useParams } from 'react-router-dom';
import '../css/style.css';
import  {mensajes} from '../utilities/Mensajes';
import TablePagination from '@mui/material/TablePagination';
import { getToken } from '../utilities/Sessionutil';
import AgregarFuncionalidad from './AgregarFuncionalidad';
import swal from 'sweetalert';

const ListaFuncionalidades = () => {
    const [funcionalidades, setFuncionalidades] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // Nuevo estado
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const { external_id_proyecto } = useParams();
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [funcionalidadSeleccionada, setFuncionalidadSeleccionada] = useState(null);

    useEffect(() => {
        const fetchFuncionalidades = async () => {
            setIsLoading(true); // Inicia la carga
            try {
                const response = await peticionGet(getToken(), `funcionalidad/obtener/${external_id_proyecto}`);
                if (response.code === 200) {
                    setFuncionalidades(response.info);
                } else {
                    setFuncionalidades([]);
                }
            } catch (error) {
                mensajes("Error al cargar funcionalidades", "error", "Error");
                console.error(error);
            } finally {
                setIsLoading(false); // Finaliza la carga
            }
        };

        fetchFuncionalidades();
    }, [external_id_proyecto]);

    const handleShowModal = (funcionalidad = null) => {
        setFuncionalidadSeleccionada(funcionalidad);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setFuncionalidadSeleccionada(null);
        setShowModal(false);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    const handleChangeStateFuncionalidad = async (external_id, isReactivating = false) => {
        const actionText = isReactivating ? "reactivar" : "eliminar";
        swal({
            title: `¿Está seguro de ${actionText} esta funcionalidad?`,
            text: `Una vez ${isReactivating ? "reactivada" : "eliminada"}, el estado cambiará.`,
            icon: "warning",
            buttons: ["Cancelar", isReactivating ? "Reactivar" : "Eliminar"],
            dangerMode: !isReactivating,
        }).then(async (confirm) => {
            if (confirm) {
                const response = await peticionGet(getToken(), `funcionalidad/cambiar-estado/${external_id}`);
                if (response.code === 200) {
                    mensajes(response.msg, "success");
                  
                } else {
                    mensajes(response.msg, 'error', 'Error');
                }
            } else {
                mensajes(`${isReactivating ? 'Reactivación' : 'Eliminación'} cancelada`, 'info', 'Información');
            }
        });
    };

    const funcionalidadesPorTipo = Array.isArray(funcionalidades)
        ? funcionalidades.reduce((acc, funcionalidad) => {
            const { tipo } = funcionalidad;
            if (!acc[tipo]) acc[tipo] = [];
            acc[tipo].push(funcionalidad);
            return acc;
        }, {})
        : {};

    return (
        <div className="container-fluid">
            <div className="contenedor-centro">
                <div className="contenedor-carta">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <p className="titulo-primario">Lista de funcionalidades clasificadas</p>
                        <Button className="btn-normal" onClick={() => handleShowModal()}>
                            <FontAwesomeIcon icon={faPlus} /> Agregar
                        </Button>
                    </div>

                    {isLoading ? (
                        <div className="alert alert-info" role="alert">
                            Cargando funcionalidades...
                        </div>
                    ) : (
                        Object.keys(funcionalidadesPorTipo).length > 0 ? (
                            <div className="accordion" id="accordionExample">
                                {Object.entries(funcionalidadesPorTipo).map(([tipo, funcionalidades], index) => {
                                    const tipoColorClass = {
                                        REQUISITO: { background: 'var(--color-secundario)', color: 'var(--color-cuarto)', fontWeight: 'bold' },
                                        "CASO DE USO": { background: 'var(--morado-bebe)', color: 'var(--color-cuarto)', fontWeight: 'bold' },
                                        "HISTORIA DE USUARIO": { background: 'var(--color-terciario)', color: 'var(--color-cuarto)', fontWeight: 'bold' },
                                        "REGLA DE NEGOCIO": { background: 'var(--color-primario)', color: 'var(--color-cuarto)', fontWeight: 'bold' },
                                    }[tipo] || { background: '#6c757d', color: '#fff' };

                                    return (
                                        <div className="accordion-item" key={index}>
                                            <h2 className="accordion-header" id={`heading${index}`}>
                                                <button
                                                    className="accordion-button collapsed"
                                                    type="button"
                                                    data-bs-toggle="collapse"
                                                    data-bs-target={`#collapse${index}`}
                                                    aria-expanded="false"
                                                    aria-controls={`collapse${index}`}
                                                    style={tipoColorClass}
                                                >
                                                    {tipo}
                                                </button>
                                            </h2>
                                            <div
                                                id={`collapse${index}`}
                                                className="accordion-collapse collapse"
                                                aria-labelledby={`heading${index}`}
                                                data-bs-parent="#accordionExample"
                                            >
                                                <div className="accordion-body">
                                                    <div className="table-responsive">
                                                        <table className="table table-striped">
                                                            <thead>
                                                                <tr>
                                                                    <th className="text-center">Nombre</th>
                                                                    <th className="text-center">Descripción</th>
                                                                    <th className="text-center">Registrada por</th>
                                                                    <th className="text-center">Estado</th>
                                                                    <th className="text-center">Acciones</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {funcionalidades.map((funcionalidad, idx) => (
                                                                    <tr key={idx}>
                                                                        <td>{funcionalidad.nombre || "No disponible"}</td>
                                                                        <td>{funcionalidad.descripcion || "No disponible"}</td>
                                                                        <td>
                                                                            {(funcionalidad.entidad && funcionalidad.entidad.nombres && funcionalidad.entidad.apellidos)
                                                                                ? `${funcionalidad.entidad.nombres} ${funcionalidad.entidad.apellidos}`
                                                                                : "No disponible"}
                                                                        </td>
                                                                        <td className="text-center">
                                                                            <span
                                                                                style={{
                                                                                    display: 'inline-block',
                                                                                    padding: '0.25em 0.5em',
                                                                                    borderRadius: '5px',
                                                                                    color: '#fff',
                                                                                    fontWeight: 'bold',
                                                                                    backgroundColor: funcionalidad.estado ? '#21BF73' : '#FD5E53',
                                                                                }}
                                                                            >
                                                                                {funcionalidad.estado ? "Activo" : "Inactivo"}
                                                                            </span>
                                                                        </td>
                                                                        <td className="text-center">
                                                                        {funcionalidad.estado && (
                                                                            <Button
                                                                                variant="btn btn-outline-info btn-rounded"
                                                                                onClick={() => handleShowModal(funcionalidad)}
                                                                            >
                                                                                <svg
                                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                                    width="16"
                                                                                    height="16"
                                                                                    fill="currentColor"
                                                                                    className="bi bi-pencil-square"
                                                                                    viewBox="0 0 16 16"
                                                                                >
                                                                                    <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                                                                                    <path
                                                                                        fillRule="evenodd"
                                                                                        d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"
                                                                                    />
                                                                                </svg>
                                                                            </Button>
                                                                        )}

                                                                        <Button
                                                                            className={funcionalidad.estado ? "btn-negativo" : "btn-positivo"}
                                                                            onClick={() => handleChangeStateFuncionalidad(funcionalidad.external_id, !funcionalidad.estado)}
                                                                        >
                                                                            <FontAwesomeIcon icon={funcionalidad.estado ? faTrash : faRedoAlt} />
                                                                        </Button>
                                                                    </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                    <TablePagination
                                                        rowsPerPageOptions={[10, 25, 100]}
                                                        component="div"
                                                        count={funcionalidades.length}
                                                        rowsPerPage={rowsPerPage}
                                                        page={page}
                                                        onPageChange={handleChangePage}
                                                        onRowsPerPageChange={handleChangeRowsPerPage}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="alert alert-success" role="alert">
                                No hay funcionalidades generadas.
                            </div>
                        )
                    )}
                </div>
                {/* Modal para agregar o editar funcionalidades */}
                <Modal show={showModal} onHide={handleCloseModal} backdrop="static" keyboard={false}>
                    <Modal.Header closeButton>
                        <Modal.Title className="titulo-primario">
                            {funcionalidadSeleccionada ? "Editar Funcionalidad" : "Agregar Funcionalidad"}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <AgregarFuncionalidad
                            funcionalidad={funcionalidadSeleccionada}
                            external_id_proyecto={external_id_proyecto}
                            onClose={handleCloseModal}
                        />
                    </Modal.Body>
                </Modal>
            </div>
        </div>
    );
};

export default ListaFuncionalidades;

