import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import CasoPrueba from './CasoPrueba';
import { peticionGet } from '../utilities/hooks/Conexion';
import { useParams } from 'react-router-dom';
import '../css/style.css';
import mensajes from '../utilities/Mensajes';
import { getToken } from '../utilities/Sessionutil';
import { useForm } from 'react-hook-form';
import MenuBar from './MenuBar';
import swal from 'sweetalert';

const VerCasoPrueba = () => {
    const [showModal, setShowModal] = useState(false);
    const [editingCaso, setEditingCaso] = useState(null);
    const [casosPrueba, setCasosPrueba] = useState({});
    const { external_id } = useParams();
    const { setValue} = useForm();

    useEffect(() => {
        const fetchCasoPrueba = async () => {

            try {
                const response = await peticionGet(getToken(), `caso/prueba/obtener?external_id=${external_id}`);
                if (response.code === 200) {
                    const casoPruebaData = response.info;
                    setCasosPrueba(casoPruebaData);
                    console.log(response.info);
                } else {
                    mensajes(`Error al obtener caso de prueba: ${response.msg}`, 'error');
                }
            } catch (error) {
                mensajes('Error al procesar la solicitud', 'error');
            }

        };

        fetchCasoPrueba();
    }, [setValue]);

    const handleShowModal = (casoId) => {
        setEditingCaso(casoId);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setEditingCaso(null);
        setShowModal(false);
    };

    const handleDeleteCasoPrueba = async (external_id) => {
        swal({
            title: "¿Estás seguro de que deseas eliminar este caso de prueba?",
            text: "Una vez eliminado, no podrás revertir esta acción",
            icon: "warning",
            buttons: ["Cancelar", "Eliminar"],
            dangerMode: true,
        }).then(async (willDelete) => {
            if (willDelete) {
                const response = await peticionGet(getToken(), `caso/prueba/eliminar?external_id=${external_id}`);
                if (response.code === 200) {
                    mensajes('Caso de prueba eliminado exitosamente.', 'success');
                    setTimeout(() => {
                        window.location.reload();
                    }, 1200);
                } else {
                    mensajes(response.msg, 'error', 'Error');
                }
            } else {
                mensajes('Eliminación cancelada', 'info', 'Información');
            }
        });
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toISOString().slice(0, 10);
    }

    return (
        <div className="">
            <MenuBar />
            <div className='container-fluid'>
                <div className='contenedor-centro'>
                    <div className="contenedor-carta">
                        <p className="titulo-primario">Caso de Prueba</p>
                        <div className="form-group">
                            <div className="row">
                                <div className="col-md-6">
                                    <label className="w-100 text-start titulo-secundario">Título</label>
                                    <p className="w-100 text-start texto-normal">{casosPrueba?.nombre}</p>

                                    <label className="w-100 text-start titulo-secundario">Clasificación</label>
                                    <p className="w-100 text-start texto-normal">
                                        <span className={`badge ${casosPrueba?.clasificacion === 'ALTA' ? 'bg-danger' : casosPrueba?.clasificacion === 'MEDIA' ? 'bg-warning' : 'bg-success'}`}>
                                            {casosPrueba?.clasificacion}
                                        </span>
                                    </p>


                                    <label className="w-100 text-start titulo-secundario">Tipo de prueba</label>
                                    <p className="w-100 text-start texto-normal">{casosPrueba?.tipo_prueba}</p>
                                </div>
                                <div className="col-md-6">
                                    <label className="w-100 text-start titulo-secundario">Estado</label>
                                    <p className="w-100 text-start texto-normal">
                                        <span className={`badge ${casosPrueba?.estado === 'APROBADO' ? 'bg-success' : casosPrueba?.estado === 'RECHAZADO' ? 'bg-danger' : 'bg-warning'}`}>
                                            {casosPrueba?.estado}
                                        </span>
                                    </p>


                                    <label className="w-100 text-start titulo-secundario">Fecha de diseño</label>
                                    <p className="w-100 text-start texto-normal">
                                        {casosPrueba?.fecha_disenio ? formatDate(casosPrueba.fecha_disenio) : 'No disponible'}
                                    </p>

                                    <label className="w-100 text-start titulo-secundario">Fecha de ejecución de prueba</label>
                                    <p className="w-100 text-start texto-normal">
                                        {casosPrueba?.fecha_ejecucion_prueba ? formatDate(casosPrueba.fecha_ejecucion_prueba) : 'No disponible'}
                                    </p>
                                </div>

                                <div className="col-md-12">
                                    <div className="col-md-12">
                                        <label className="w-100 text-start titulo-secundario">Descripción</label>
                                        <div className="w-100 text-start texto-normal" dangerouslySetInnerHTML={{ __html: casosPrueba?.descripcion ? casosPrueba.descripcion.replace(/\n/g, '<br />') : '' }} />
                                    </div>

                                    <label className="w-100 text-start titulo-secundario">Precondiciones</label>
                                    <div className="w-100 text-start texto-normal" dangerouslySetInnerHTML={{ __html: casosPrueba?.precondiciones ? casosPrueba?.precondiciones.replace(/\n/g, '<br />') : '' }} />

                                    <label className="w-100 text-start titulo-secundario">Pasos</label>
                                    <div className="w-100 text-start texto-normal" dangerouslySetInnerHTML={{ __html: casosPrueba?.pasos ? casosPrueba?.pasos.replace(/\n/g, '<br />') : '' }} />

                                    <label className="w-100 text-start titulo-secundario">Resultado esperado</label>
                                    <div className="w-100 text-start texto-normal" dangerouslySetInnerHTML={{ __html: casosPrueba?.resultado_esperado ? casosPrueba?.resultado_esperado.replace(/\n/g, '<br />') : '' }} />

                                    <label className="w-100 text-start titulo-secundario">Resultado obtenido</label>
                                    <div className="w-100 text-start texto-normal" dangerouslySetInnerHTML={{ __html: casosPrueba?.resultado_obtenido ? casosPrueba?.resultado_obtenido.replace(/\n/g, '<br />') : '' }} />
                                </div>
                            </div>
                        </div>
                        <div className='contenedor-filo'>
                            <Button variant="btn btn-outline-info btn-rounded" onClick={() => handleShowModal(casosPrueba.external_id)} >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil-square" viewBox="0 0 16 16">
                                    <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                                    <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z" />
                                </svg>
                            </Button>
                            <Button
                                className="btn-negativo"
                                onClick={() => handleDeleteCasoPrueba(casosPrueba.external_id)}
                            >
                                <FontAwesomeIcon icon={faTrash} />
                            </Button>
                        </div>
                    </div>
                </div>

                <Modal show={showModal} onHide={handleCloseModal}>
                    <Modal.Header closeButton>
                        <Modal.Title className='titulo-primario'>
                            {editingCaso ? 'Editar Caso de Prueba' : 'Agregar Caso de Prueba'}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <CasoPrueba
                            id_editar={editingCaso}
                        />
                    </Modal.Body>
                </Modal>

            </div>

        </div>
    );
};

export default VerCasoPrueba;