import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Grid } from '@mui/material';
import { PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { useParams } from 'react-router-dom';
import '../css/style.css';
import { peticionGet } from '../utilities/hooks/Conexion';
import { getToken } from '../utilities/Sessionutil';

// Colores para el gráfico circular
const COLORS = [
    'var(--color-cuarto)', 
    'var(--color-terciario)',  
    'var(--color-primario)', 
    'var(--color-secundario)', 
    'var(--azul-oscuro)', 
    'var(--azul-intermedio)', 
    'var(--naranja-claro)', 
    'var(--rojo-claro)'
  ];

function Panel() {
    const { external_id_proyecto } = useParams();
    const [proyecto, setProyecto] = useState([]);
    const [casosPrueba, setCasosPrueba] = useState([]);
    const [casosPruebaClasificacion, setCasosPruebaClasificacion] = useState([]);
    const [errors, setErrors] = useState([]);
    const [prioridadErrors, setPrioridadErrors] = useState([]);
    const [severidadErrors, setSeveridadErrors] = useState([]);

    useEffect(() => {
        const fetchProyecto = async () => {
            try {
                const info = await peticionGet(getToken(), `proyecto/contar/casos/${external_id_proyecto}`);
                if (info.code === 200) {
                    setProyecto(info.info.proyecto);
                    setCasosPrueba(info.info.casos_de_prueba);
                    setCasosPruebaClasificacion(info.info.casos_de_prueba_clasificacion);
                    setErrors(info.info.errores);
                    setPrioridadErrors(info.info.prioridad);
                    setSeveridadErrors(info.info.severidad); 
                } else {
                    console.error('Error al obtener proyecto:', info.msg);
                }
            } catch (error) {
                console.error('Error en la solicitud:', error);
            }
        };

        fetchProyecto();
    }, [external_id_proyecto]);

    const errorData = errors.map(error => ({
        name: error.estado,
        value: error.cantidad,
    }));

    const severidadData = severidadErrors.map(severidad => ({
        name: severidad.severidad,
        value: severidad.cantidad,
    }));

    const prioridadData = prioridadErrors.map(prioridad => ({
        name: prioridad.prioridad,
        value: prioridad.cantidad,
    }));

    return (
        <div style={{ padding: '20px' }}>
            <p className="titulo-proyecto">{proyecto.nombre}</p>
            {/* Casos de prueba */}
            <div className="contenedor-carta">
                <p className="titulo-primario" style={{ textAlign: 'center' }}>{'Casos de Prueba'}</p>
                {casosPrueba.length === 0 ? (
                    <p>No se encontraron casos de prueba para el proyecto seleccionado.</p>
                ) : (
                    <div className="row">
                        {casosPrueba.map((estado) => (
                            <div className="col-12 col-sm-6 col-md-3" key={estado.estado}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6">{estado.estado}</Typography>
                                        <Typography variant="h4">{estado.cantidad}</Typography>
                                    </CardContent>
                                </Card>
                            </div>
                        ))}
                    </div>
                )}
                   <div className="contenedor-carta">
                <p className="titulo-primario">{'Clasificación'}</p>
                {casosPruebaClasificacion.length === 0 ? (
                    <p>No se encontraron clasificaciones para los casos de prueba.</p>
                ) : (
                    <section className='table_body'>
                    <div className="table-responsive">
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th className="text-center">Clasificación</th>
                                    <th className="text-center">Cantidad</th>
                                </tr>
                            </thead>
                            <tbody>
                                {casosPruebaClasificacion.map((clasificacion, index) => (
                                    <tr key={index}>
                                        <td className="text-center">{clasificacion.clasificacion}</td>
                                        <td className="text-center">{clasificacion.cantidad}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
                )}
            </div>
            </div>

            <div className="contenedor-carta">
                <div className="row">
                    {/* Columna izquierda: Severidad y Prioridad */}
                    <div className="col-12 col-sm-6 col-md-4">
                        <p className="titulo-primario" style={{ textAlign: 'center' }}>{'Errores por Severidad'}</p>
                        {severidadErrors.length === 0 ? (
                            <p>No se han reportado severidades para este proyecto.</p>
                        ) : (
                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell><strong>Severidad</strong></TableCell>
                                            <TableCell><strong>Cantidad</strong></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {severidadData.map((row, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{row.name}</TableCell>
                                                <TableCell>{row.value}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </div>

                    <div className="col-12 col-sm-6 col-md-4">
                        <p className="titulo-primario" style={{ textAlign: 'center' }}>{'Errores por Prioridad'}</p>
                        {prioridadErrors.length === 0 ? (
                            <p>No se han reportado prioridades para este proyecto.</p>
                        ) : (
                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell><strong>Prioridad</strong></TableCell>
                                            <TableCell><strong>Cantidad</strong></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {prioridadData.map((row, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{row.name}</TableCell>
                                                <TableCell>{row.value}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </div>

                    {/* Columna derecha: Gráfico de Errores */}
                    <div className="col-12 col-md-4">
                        <p className="titulo-primario" style={{ textAlign: 'center' }}>{'Errores reportados'}</p>
                        {errors.length === 0 ? (
                            <p>No se han reportado errores en el proyecto.</p>
                        ) : (
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                <PieChart width={250} height={250}>
                                    <Pie
                                        data={errorData}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label
                                    >
                                        {errorData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Panel;
