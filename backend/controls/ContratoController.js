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
                                model: models.entidad,
                                attributes: ['nombres', 'apellidos']
                            }
                        ]
                    },
                    {
                        model: models.rol_proyecto,
                        as: 'rol_proyecto_asignado',  
                        include: [
                            {
                                model: models.entidad,
                                attributes: ['nombres', 'apellidos']
                            }
                        ]
                    },
                    {
                        model: models.caso_prueba,  
                        as: 'caso_prueba',
                        attributes: ['nombre', 'descripcion', 'clasificacion']
                    }
                ]
            });

            const resultado = contratos.map(contrato => {
                return {
                    fecha_inicio: contrato.fecha_inicio,
                    fecha_fin: contrato.fecha_fin,
                    persona_asignada: `${contrato.rol_proyecto_responsable.entidad.nombres} ${contrato.rol_proyecto_responsable.entidad.apellidos}`,
                    persona_que_asigno: `${contrato.rol_proyecto_asignado.entidad.nombres} ${contrato.rol_proyecto_asignado.entidad.apellidos}`,
                    nombre_caso_prueba: contrato.caso_prueba.nombre,
                    descripcion: contrato.caso_prueba.descripcion,
                    clasificacion: contrato.caso_prueba.clasificacion
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

    async asignarTesters(req, res) {
        let transaction;
        try {
            transaction = await models.sequelize.transaction();

            const { id_proyecto, testers, entidad_asigno, casosPrueba, fecha_inicio, fecha_fin, role_asignado, tester_rol } = req.body;

            if (!id_proyecto || !testers || testers.length === 0 || !casosPrueba || !fecha_inicio || !fecha_fin || !role_asignado) {
                return res.status(400).json({ msg: "Faltan datos requeridos", code: 400 });
            }

            const fechaInicio = new Date(fecha_inicio);
            const fechaFin = new Date(fecha_fin);
            if (isNaN(fechaInicio) || isNaN(fechaFin) || fechaInicio >= fechaFin) {
                return res.status(400).json({ msg: "Fechas inválidas o la fecha de inicio debe ser anterior a la fecha de fin", code: 400 });
            }

            const proyecto = await models.proyecto.findOne({ where: { external_id: id_proyecto } });
            if (!proyecto) {
                return res.status(404).json({ msg: "Proyecto no encontrado", code: 404 });
            }

            if (testers.length === 0) {
                return res.status(400).json({ msg: "No se pueden asignar testers vacíos", code: 400 });
            }

            for (const tester of testers) {
                const entidad = await models.entidad.findOne({ where: { id: tester.id_entidad } });
                if (!entidad) {
                    return res.status(404).json({ msg: `Entidad con ID ${tester.id_entidad} no encontrada`, code: 404 });
                }

                for (const caso of casosPrueba) {
                    const casoPrueba = await models.caso_prueba.findOne({ where: { external_id: caso.external_id } });  // Nombre correcto de la tabla
                    if (!casoPrueba) {
                        return res.status(404).json({ msg: `Caso de prueba con external_id ${caso.external_id} no encontrado`, code: 404 });
                    }

                    const contratoExistente = await models.contrato.findOne({
                        where: {
                            id_caso_prueba: casoPrueba.id,
                            id_rol_proyecto_asignado: entidad_asigno,
                            id_rol_proyecto_responsable: tester.id_entidad
                        }
                    });

                    if (!contratoExistente) {

                        const rolProyectoAsignado = await models.rol_proyecto.findOne({
                            where: {
                                id_entidad: entidad_asigno,
                                id_rol: role_asignado,
                                id_proyecto: proyecto.id
                            }
                        });

                        if (!rolProyectoAsignado) {
                            return res.status(400).json({ msg: "Rol proyecto asignado no encontrado", code: 400 });
                        }

                        const rolProyectoResponsable = await models.rol_proyecto.findOne({
                            where: {
                                id_entidad: tester.id_entidad,
                                id_rol: tester_rol,
                                id_proyecto: proyecto.id
                            }
                        });
                        if (!rolProyectoResponsable) {
                            return res.status(400).json({ msg: "Rol proyecto responsable no encontrado", code: 400 });
                        }

                        const newContrato = await models.contrato.create({
                            external_id: uuid.v4(),
                            fecha_inicio: fechaInicio,
                            fecha_fin: fechaFin,
                            tipo_contrato: 'CASO_PRUEBA',
                            id_caso_prueba: casoPrueba.id,
                            id_rol_proyecto_asignado: rolProyectoAsignado.id,
                            id_rol_proyecto_responsable: rolProyectoResponsable.id
                        }, { transaction });

                        await casoPrueba.update({ estadoAsignacion: 'ASIGNADO' }, { transaction });

                    } else {
                        console.log(`Contrato ya existente para el tester ${entidad.nombres} en el caso de prueba ${casoPrueba.nombre}.`);
                    }
                }
            }

            await transaction.commit();
            res.status(200).json({ msg: "Testers asignados con éxito", code: 200 });

        } catch (error) {
            if (transaction) {
                await transaction.rollback();
            }
            console.error("Error al asignar testers:", error);
            res.status(500).json({ msg: error.message || "Error interno del servicio", code: 500 });
        }
    }
}

module.exports = ContratoController;
