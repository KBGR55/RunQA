import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Grid } from '@mui/material';
import { PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { useParams } from 'react-router-dom';
import '../css/style.css';
import { peticionGet } from '../utilities/hooks/Conexion';
import { getToken } from '../utilities/Sessionutil';

// Colores para el gráfico circular
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

function Panel() {
    const { external_id_proyecto } = useParams();
    const [casosPrueba, setCasosPrueba] = useState([]);
    const [errors, setErrors] = useState([]);
    const [prioridadErrors, setPrioridadErrors] = useState([]);
    const [severidadErrors, setSeveridadErrors] = useState([]);

    useEffect(() => {
        const fetchProyecto = async () => {
            try {
                const info = await peticionGet(getToken(), `proyecto/contar/casos/${external_id_proyecto}`);
                if (info.code === 200) {
                    setCasosPrueba(info.info.casos_de_prueba);
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

        fetchProyecto(); // Llama a la función asíncrona
    }, [external_id_proyecto]); // Asegúrate de incluir external_id_proyecto como dependencia

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
            {/* Casos de prueba */}
            <Grid container spacing={4}  className='contenedor-carta'>
                <p className="titulo-primario">{'Casos de Prueba'}</p>
                {casosPrueba.length === 0 ? (
                    <p>No se encontraron casos de prueba para el proyecto seleccionado.</p>
                ) : (
                    <Grid container spacing={4}>
                        {casosPrueba.map((estado) => (
                            <Grid item xs={12} sm={6} md={3} key={estado.estado}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6">{estado.estado}</Typography>
                                        <Typography variant="h4">{estado.cantidad}</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Grid>

            <Grid container spacing={4} alignItems="stretch" className='contenedor-carta'>
                {/* Columna izquierda: Severidad y Prioridad */}
                <Grid item xs={12} sm={6} md={4}>
                    <div>
                        <p className="titulo-primario" style={{ textAlign: 'center' }}>{'Puntos por Severidad'}</p>
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
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                    <div>
                        <p className="titulo-primario" style={{ textAlign: 'center' }}>{'Puntos por Prioridad'}</p>
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
                </Grid>

                {/* Columna derecha: Gráfico de Errores */}
                <Grid item xs={12} sm={12} md={4}>
                    <p className="titulo-primario">{'Errores reportados'}</p>
                    {errors.length === 0 ? (
                        <p>No se han reportado errores en el proyecto.</p>
                    ) : (
                        <PieChart width={400} height={400}>
                            <Pie
                                data={errorData}
                                cx="50%"
                                cy="50%"
                                outerRadius={150}
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
                    )}
                </Grid>
            </Grid>
        </div>
    );
}

export default Panel;
