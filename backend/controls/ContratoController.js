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

            let caso_prueba = await models.caso_prueba.findOne({
                where: {
                    external_id: req.params.external_id
                },
            });
            if (!caso_prueba) {
                return res.status(404).json({ msg: "Caso de prueba no encontrado" });
            }

            const contrato = await models.contrato.findOne({
                where: { id_caso_prueba: caso_prueba.id },
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


            if (!id_proyecto || !tester || tester.length === 0 || !casosPrueba || casosPrueba.length === 0 || !fecha_inicio || !fecha_fin) {
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
                return res.status(404).json({ msg: 'Tester no encontrado', code: 404 });
            }

            const rolEntidadAsignador = await models.rol_entidad.findOne({
                where: { id_entidad: entidad_asigno, id_rol: 2 || 3 } // Rol de LIDER DE CALIDAD O ANALISTA DE PRUEBAS
            });

            if (!rolEntidadAsignador) {
                return res.status(404).json({ msg: 'Persona que asigna no encontrada', code: 404 });
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

                const rolProyectoAsignador = await models.rol_proyecto.findOne({
                    where: {
                        id_rol_entidad: rolEntidadAsignador.id,
                        id_proyecto: proyecto.id
                    }
                });
                
                if (!rolProyectoAsignado || !rolProyectoAsignador) {
                    return res.status(400).json({ msg: "Proyecto asignado no encontrado", code: 400 });
                }

                const contratoExistente = await models.contrato.findOne({
                    where: {
                        id_caso_prueba: casoPrueba.id,
                        id_rol_proyecto_asignado: rolProyectoAsignador.id,
                        id_rol_proyecto_responsable: rolProyectoAsignado.id
                    }
                });

                if (!contratoExistente) {
                    await models.contrato.create({
                        external_id: uuid.v4(),
                        fecha_inicio: fechaInicio,
                        fecha_fin: fechaFin,
                        tipo_contrato: 'CASO_PRUEBA',
                        id_caso_prueba: casoPrueba.id,
                        id_rol_proyecto_asignado: rolProyectoAsignador.id,
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

    async asignarDesarrolladores(req, res) {
        let transaction;
        try {
            transaction = await models.sequelize.transaction();

            const { id_proyecto, desarrollador, entidad_asigno, errores, fecha_inicio, fecha_fin, desarrollador_rol } = req.body;

            if (!id_proyecto || !desarrollador || desarrollador.length === 0 || !errores || errores.length === 0 || !fecha_inicio || !fecha_fin) {
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
                where: { id_entidad: desarrollador.id_entidad, id_rol: desarrollador_rol }
            });

            const rolEntidadAsignador = await models.rol_entidad.findOne({
                where: { id_entidad: entidad_asigno, id_rol: 4 } // Rol de TESTER
            });

            if (!rolEntidad) {
                return res.status(404).json({ msg: 'Desarrollador no encontrado', code: 404 });
            }

            if (!rolEntidadAsignador) {
                return res.status(404).json({ msg: 'Persona que asigna no encontrada', code: 404 });
            }

            for (const errorData of errores) {
                const errorInstance = await models.error.findOne({ where: { id: errorData.external_id } });
                if (!errorInstance) {
                    return res.status(404).json({ msg: 'Registro de error no encontrado', code: 404 });
                }

                const rolProyectoAsignado = await models.rol_proyecto.findOne({
                    where: {
                        id_rol_entidad: rolEntidad.id,
                        id_proyecto: proyecto.id
                    }
                });

                const rolProyectoAsignador = await models.rol_proyecto.findOne({
                    where: {
                        id_rol_entidad: rolEntidadAsignador.id,
                        id_proyecto: proyecto.id
                    }
                });

                if (!rolProyectoAsignado || !rolProyectoAsignador) {
                    return res.status(400).json({ msg: "Proyecto asignado no encontrado", code: 400 });
                }

                const contratoExistente = await models.contrato.findOne({
                    where: {
                        id_error: errorInstance.id,
                        id_rol_proyecto_asignado: rolProyectoAsignador.id,
                        id_rol_proyecto_responsable: rolProyectoAsignado.id
                    }
                });

                if (!contratoExistente) {
                    await models.contrato.create({
                        external_id: uuid.v4(),
                        fecha_inicio: fechaInicio,
                        fecha_fin: fechaFin,
                        tipo_contrato: 'ERROR',
                        id_error: errorInstance.id,
                        id_rol_proyecto_asignado: rolProyectoAsignador.id,
                        id_rol_proyecto_responsable: rolProyectoAsignado.id
                    }, { transaction });

                    await errorInstance.update({ estado: 'PENDIENTE_VALIDACION' }, { transaction });
                } else {
                    console.log(`Contrato ya existente para el desarrollador ${desarrollador.nombres} en el error ${errorInstance.nombre}.`);
                }
            }

            await transaction.commit();
            res.status(200).json({ msg: "Desarrollador asignado con éxito", code: 200 });

        } catch (err) {
            if (transaction) {
                await transaction.rollback();
            }

            console.error("Error al asignar desarrollador:", err);

            res.status(500).json({
                msg: "Ocurrió un error interno al procesar la solicitud. Por favor, intente nuevamente más tarde.",
                code: 500
            });
        }
    }

    async obtenerDatosErrorAsignado(req, res) {
        try {

            const contrato = await models.contrato.findOne({
                where: { id_error: req.params.external_id, estado: 1 },
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
                    }
                ]
            });

            const resultado = {
                fecha_inicio: contrato.fecha_inicio,
                fecha_fin: contrato.fecha_fin,
                external_id: contrato.external_id,
                persona_asignada: `${contrato.rol_proyecto_responsable.rol_entidad.entidad.nombres} ${contrato.rol_proyecto_responsable.rol_entidad.entidad.apellidos}`,
                persona_que_asigno: `${contrato.rol_proyecto_asignado.rol_entidad.entidad.nombres} ${contrato.rol_proyecto_asignado.rol_entidad.entidad.apellidos}`,
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

    async reasignarError(req, res) {
        let transaction;
        try {
            transaction = await models.sequelize.transaction();


            const { id_error, desarrollador, entidad_asigno, fecha_inicio, fecha_fin, desarrollador_rol, id_proyecto } = req.body;

            if (!id_error || !desarrollador || !entidad_asigno || !fecha_inicio || !fecha_fin || !id_proyecto || !desarrollador_rol) {
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
                where: { id_entidad: desarrollador.id_entidad, id_rol: desarrollador_rol }
            });

            const rolEntidadAsignador = await models.rol_entidad.findOne({
                where: { id_entidad: entidad_asigno, id_rol: 4 } // Rol de TESTER
            });

            if (!rolEntidad) {
                return res.status(404).json({ msg: 'Desarrollador no encontrado', code: 404 });
            }

            if (!rolEntidadAsignador) {
                return res.status(404).json({ msg: 'Persona que asigna no encontrada', code: 404 });
            }

            const rolProyectoAsignado = await models.rol_proyecto.findOne({
                where: {
                    id_rol_entidad: rolEntidad.id,
                    id_proyecto: proyecto.id
                }
            });

            const rolProyectoAsignador = await models.rol_proyecto.findOne({
                where: {
                    id_rol_entidad: rolEntidadAsignador.id,
                    id_proyecto: proyecto.id
                }
            });

            if (!rolProyectoAsignado || !rolProyectoAsignador) {
                return res.status(400).json({ msg: "Proyecto asignado no encontrado", code: 400 });
            }

            const errorInstance = await models.error.findOne({ where: { id: id_error } });
            if (!errorInstance) {
                return res.status(404).json({ msg: "Registro del error no encontrado", code: 404 });
            }

            const contratoExistente = await models.contrato.findOne({
                where: { id_error: id_error, estado: { [models.Sequelize.Op.not]: 0 } }
            });

            if (!contratoExistente) {
                return res.status(404).json({ msg: "No se encontró un registro activo asociado a este error", code: 404 });
            }

            await contratoExistente.update({ estado: 0 }, { transaction });

            const nuevoContrato = await models.contrato.create({
                external_id: uuid.v4(),
                fecha_inicio: fechaInicio,
                fecha_fin: fechaFin,
                tipo_contrato: "ERROR",
                id_error: id_error,
                id_rol_proyecto_asignado: rolProyectoAsignador.id,
                id_rol_proyecto_responsable: rolProyectoAsignado.id,
                estado: 1 
            }, { transaction });

            await errorInstance.update({ estado: "PENDIENTE_VALIDACION" }, { transaction });

            await transaction.commit();
            res.status(200).json({ msg: "Error reasignado con éxito", code: 200, contrato: nuevoContrato });

        } catch (err) {
            if (transaction) {
                await transaction.rollback();
            }

            console.error("Error al reasignar el error:", err);

            res.status(500).json({
                msg: "Ocurrió un error interno al procesar la solicitud. Por favor, intente nuevamente más tarde.",
                code: 500
            });
        }
    }


}

module.exports = ContratoController;
