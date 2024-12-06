'use strict';

var models = require('../models/');
const uuid = require('uuid');

class ContratoController {

    async obtenerDatosTabla(req, res) {
        try {
            const contratos = await models.contrato.findAll({
                attributes: ['fecha_inicio', 'fecha_fin', 'external_id'],
                include: [
                    {
                        model: models.rol_proyecto,
                        as: 'rol_proyecto_responsable',
                        include: [
                            {
                                model: models.rol_entidad,
                                as: 'rol_entidad',
                                include: [
                                    {
                                        model: models.entidad,
                                        as: 'entidad',
                                        attributes: ['nombres', 'apellidos']
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        model: models.rol_proyecto,
                        as: 'rol_proyecto_asignado',
                        include: [
                            {
                                model: models.rol_entidad,
                                as: 'rol_entidad',
                                include: [
                                    {
                                        model: models.entidad,
                                        as: 'entidad',
                                        attributes: ['nombres', 'apellidos']
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        model: models.caso_prueba,
                        as: 'caso_prueba',
                        attributes: ['nombre', 'descripcion', 'clasificacion', 'estadoAsignacion', 'estado']
                    }
                ]
            });

            const resultado = contratos.map(contrato => {
                return {
                    fecha_inicio: contrato.fecha_inicio,
                    fecha_fin: contrato.fecha_fin,
                    external_id: contrato.external_id,
                    persona_asignada: `${contrato.rol_proyecto_responsable.rol_entidad.entidad.nombres} ${contrato.rol_proyecto_responsable.rol_entidad.entidad.apellidos}`,
                    persona_que_asigno: `${contrato.rol_proyecto_asignado.rol_entidad.entidad.nombres} ${contrato.rol_proyecto_asignado.rol_entidad.entidad.apellidos}`,
                    nombre_caso_prueba: contrato.caso_prueba.nombre,
                    descripcion: contrato.caso_prueba.descripcion,
                    clasificacion: contrato.caso_prueba.clasificacion,
                    estadoAsignacion: contrato.caso_prueba.estadoAsignacion,
                    estado: contrato.caso_prueba.estado,
                };
            });

            res.json({
                msg: "OK!",
                code: 200,
                info: resultado,
            });
        } catch (error) {
            console.error("Error al obtener los datos:", error);
            return res.status(500).json({ msg: error.message || "Error interno del servidor" });
        }
    }

    async obtenerDatosCasoAsignado(req, res) {
        try {
            const contrato = await models.contrato.findOne({
                where: { external_id: req.params.external_id },
                attributes: ['fecha_inicio', 'fecha_fin', 'external_id'],
                include: [
                    {
                        model: models.rol_proyecto,
                        as: 'rol_proyecto_responsable',
                        include: [
                            {
                                model: models.rol_entidad,
                                as: 'rol_entidad',
                                include: [
                                    {
                                        model: models.entidad,
                                        as: 'entidad',
                                        attributes: ['nombres', 'apellidos']
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        model: models.rol_proyecto,
                        as: 'rol_proyecto_asignado',
                        include: [
                            {
                                model: models.rol_entidad,
                                as: 'rol_entidad',
                                include: [
                                    {
                                        model: models.entidad,
                                        as: 'entidad',
                                        attributes: ['nombres', 'apellidos']
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        model: models.caso_prueba,
                        as: 'caso_prueba',
                        attributes: ['nombre', 'descripcion', 'clasificacion', 'estadoAsignacion', 'estado']
                    }
                ]
            });

            const resultado = {
                fecha_inicio: contrato.fecha_inicio,
                fecha_fin: contrato.fecha_fin,
                external_id: contrato.external_id,
                persona_asignada: `${contrato.rol_proyecto_responsable.rol_entidad.entidad.nombres} ${contrato.rol_proyecto_responsable.rol_entidad.entidad.apellidos}`,
                persona_que_asigno: `${contrato.rol_proyecto_asignado.rol_entidad.entidad.nombres} ${contrato.rol_proyecto_asignado.rol_entidad.entidad.apellidos}`,
                nombre_caso_prueba: contrato.caso_prueba.nombre,
                descripcion: contrato.caso_prueba.descripcion,
                clasificacion: contrato.caso_prueba.clasificacion,
                estadoAsignacion: contrato.caso_prueba.estadoAsignacion,
                estado: contrato.caso_prueba.estado,
            };

            return res.json({
                msg: "OK!",
                code: 200,
                info: resultado,
            });
        } catch (error) {
            console.error("Error al obtener los datos:", error);
            return res.status(500).json({ msg: error.message || "Error interno del servidor" });
        }
    }

    async asignarTesters(req, res) {
        let transaction;
        try {
            transaction = await models.sequelize.transaction();

            const { id_proyecto, tester, entidad_asigno, casosPrueba, fecha_inicio, fecha_fin, tester_rol } = req.body;

            console.log("wwwwwww", req.body);
            

            if (!id_proyecto || !tester || tester.length === 0 || !casosPrueba || casosPrueba.length === 0|| !fecha_inicio || !fecha_fin) {
                return res.status(400).json({ msg: "Faltan datos requeridos", code: 400 });
            }

            const fechaInicio = new Date(fecha_inicio);
            const fechaFin = new Date(fecha_fin);

            if (isNaN(fechaInicio) || isNaN(fechaFin) || fechaInicio > fechaFin) {
                return res.status(400).json({ msg: "Fechas inválidas", code: 400 });
            }

            const proyecto = await models.proyecto.findOne({ where: { external_id: id_proyecto } });
            if (!proyecto) {
                return res.status(404).json({ msg: "Proyecto no encontrado", code: 404 });
            }

            const rolEntidad = await models.rol_entidad.findOne({
                where: { id_entidad: tester.id_entidad, id_rol: tester_rol }
            });
            if (!rolEntidad) {
                return res.status(404).json({ msg: 'Rol entidad del tester no encontrado', code: 404 });
            }

            for (const caso of casosPrueba) {
                const casoPrueba = await models.caso_prueba.findOne({ where: { external_id: caso.external_id } });
                if (!casoPrueba) {
                    return res.status(404).json({ msg: 'Caso de prueba no encontrado', code: 404 });
                }

                const rolProyectoAsignado = await models.rol_proyecto.findOne({
                    where: {
                        id_rol_entidad: rolEntidad.id,
                        id_proyecto: proyecto.id
                    }
                });

                if (!rolProyectoAsignado) {
                    return res.status(400).json({ msg: "Rol proyecto asignado no encontrado", code: 400 });
                }

                const contratoExistente = await models.contrato.findOne({
                    where: {
                        id_caso_prueba: casoPrueba.id,
                        id_rol_proyecto_asignado: entidad_asigno,
                        id_rol_proyecto_responsable: rolProyectoAsignado.id
                    }
                });

                if (!contratoExistente) {
                    const newContrato = await models.contrato.create({
                        external_id: uuid.v4(),
                        fecha_inicio: fechaInicio,
                        fecha_fin: fechaFin,
                        tipo_contrato: 'CASO_PRUEBA',
                        id_caso_prueba: casoPrueba.id,
                        id_rol_proyecto_asignado: entidad_asigno,
                        id_rol_proyecto_responsable: rolProyectoAsignado.id
                    }, { transaction });

                    await casoPrueba.update({ estadoAsignacion: 'ASIGNADO' }, { transaction });
                } else {
                    console.log(`Contrato ya existente para el tester ${tester.nombres} en el caso de prueba ${casoPrueba.nombre}.`);
                }
            }

            await transaction.commit();
            res.status(200).json({ msg: "Tester asignado con éxito", code: 200 });

        } catch (error) {
            if (transaction) {
                await transaction.rollback();
            }
            console.error("Error al asignar tester:", error);
            res.status(500).json({ msg: error.message || "Error interno del servicio", code: 500 });
        }
    }

}

module.exports = ContratoController;
