'use strict';

var models = require('../models/');
var rol_proyecto = models.rol_proyecto;
const rolLider = 'LIDER DE CALIDAD';
const rolAdministrador = 'ADMINISTRADOR SYS';
const uuid = require('uuid');
const horasDefault=2;

class RolEntidadController {

    async listar(req, res) {
        try {
            const id_entidad = req.query.id_entidad;

            if (!id_entidad) {
                return res.status(400).json({ msg: "ID de entidad no proporcionado", code: 400 });
            }

            const listar = await models.rol_entidad.findAll({
                where: { id_entidad: id_entidad },
                include: [
                    {
                        model: models.rol,
                        where: { estado: true },
                        attributes: ['external_id', 'nombre', 'estado'],
                    }
                ]
            });

            if (listar.length === 0) {
                return res.status(404).json({ msg: "No se encontraron roles para la entidad proporcionada", code: 404 });
            }

            res.json({ msg: 'Roles encontrados', code: 200, info: listar });
        } catch (error) {
            console.error("Error al listar roles:", error);
            res.status(500).json({ msg: 'Error al listar roles', code: 500, info: error.message });
        }
    }
    async obtenerLider(req, res) {
        try {
            const id_entidad = req.query.id_entidad;

            if (!id_entidad) {
                return res.status(400).json({ msg: "ID de entidad no proporcionado", code: 400 });
            }

            const listar = await models.rol_entidad.findAll({
                where: { id_entidad: id_entidad },
                include: [
                    {
                        model: models.rol,
                        where: { estado: true, nombre: rolLider },
                        attributes: ['external_id', 'nombre', 'estado']
                    }
                ]
            });

            if (listar.length === 0) {
                return res.status(404).json({ msg: "No es lider de calidad", code: 404 });
            }

            res.json({ msg: 'Es lider de calidad', code: 200, info: listar });
        } catch (error) {
            console.error("Error al listar roles:", error);
            res.status(500).json({ msg: 'Error al listar', code: 500, info: error.message });
        }
    }

    async obtenerAdministrador(req, res) {
        try {
            const id_entidad = req.query.id_entidad;

            if (!id_entidad) {
                return res.status(400).json({ msg: "ID de entidad no proporcionado", code: 400 });
            }

            const listar = await models.rol_entidad.findAll({
                where: { id_entidad: id_entidad },
                include: [
                    {
                        model: models.rol,
                        where: { estado: true, nombre: rolAdministrador },
                        attributes: ['external_id', 'nombre', 'estado']
                    }
                ]
            });

            if (listar.length === 0) {
                return res.status(404).json({ msg: "No es administrador del sistema", code: 404 });
            }

            res.json({ msg: 'Es administrador del sistema', code: 200, info: listar });
        } catch (error) {
            console.error("Error al listar roles:", error);
            res.status(500).json({ msg: 'Error al listar', code: 500, info: error.message });
        }
    }

    async asignarLideres(req, res) {
        let transaction;
        try {
            transaction = await models.sequelize.transaction();

            const { lideres } = req.body;

            if (!lideres) {
                return res.status(400).json({ msg: "Faltan datos requeridos", code: 400 });
            }
            if (!Array.isArray(lideres) || lideres.length === 0) {
                return res.status(400).json({ msg: "No se pueden asignar lideres vacíos", code: 400 });
            }

            let asignaciones = [];
            for (const lider of lideres) {
                const entidad = await models.entidad.findOne({
                    where: { id: lider.id_entidad, estado: 1 },attributes: ['id', 'nombres','horasDisponibles']
                });
                const nameRole = await models.rol.findOne({ where: { nombre: rolLider }, attributes: ['id'] });
                if (!entidad) {
                    return res.status(404).json({ msg: `Entidad con ID ${lider.id_entidad} no encontrada o inactiva`, code: 404 });
                }

                const rolExistente = await models.rol_entidad.findOne({
                    where: { id_entidad: lider.id_entidad, id_rol: nameRole.id }
                });
                if (rolExistente) {
                    return res.status(409).json({ msg: `${entidad.nombres} Ya tiene asignado el rol de LÍDER DE CALIDAD`, code: 409 });
                }
                if (entidad.horasDisponibles >= horasDefault) {
                    await entidad.save({ transaction });
                    const nuevaAsignacion = await models.rol_entidad.create({
                        id_entidad: lider.id_entidad,
                        id_rol: nameRole.id,
                        external_id: uuid.v4()
                    }, { transaction });
                    asignaciones.push(nuevaAsignacion);
                } else {
                    return res.status(409).json({ msg: `${entidad.nombres} no tiene un maximo de 2 horas disponibles`, code: 409 });                   
                }
               
            }

            await transaction.commit();

            res.json({
                msg: asignaciones.length > 1 ? "Líderes asignados correctamente" : "Líder asignado correctamente",
                code: 200,
                info: asignaciones
            });
        } catch (error) {
            if (transaction) {
                await transaction.rollback();
            }
            console.error("Error al asignar lideres:", error);
            res.status(500).json({ msg: error.message || "Error interno del servicio", code: 500 });
        }
    }


    async asignarAdministrador(req, res) {
        try {
            const { external_id } = req.body;

            if (!external_id) {
                return res.status(400).json({ msg: "Datos no proporcionados", code: 400 });
            }

            const entidad = await models.entidad.findOne({
                where: { external_id: external_id }
            });

            if (!entidad) {
                return res.status(404).json({ msg: "Entidad no encontrada", code: 404 });
            }

            const id_entidad = entidad.id;

            const rol = await models.rol.findOne({
                where: { nombre: rolAdministrador }
            });

            if (!rol) {
                return res.status(404).json({ msg: "Rol no encontrado", code: 404 });
            }

            const id_rol = rol.id;

            const nuevoAdmin = await models.rol_entidad.create({
                id_entidad: id_entidad,
                id_rol: id_rol
            });

            const proyecto = await models.proyecto.findOne({
                where: {
                    nombre: 'ADMINISTRADOR SYS'
                }
            });
    
            if (!proyecto) {
                return res.status(404).json({ msg: "Proyecto ADMINISTRADOR SYS no encontrado", code: 404 });
            }

            await models.rol_proyecto.create({
                external_id: uuid.v4(),
                id_proyecto: proyecto.id,
                id_rol_entidad: nuevoAdmin.id
            });

            res.json({ msg: 'Nuevo administrador asignado', code: 200, info: { nuevoAdmin } });
        } catch (error) {
            console.error("Error al asignar administrador:", error);
            res.status(500).json({ msg: 'Error al asignar administrador', code: 500, info: error.message });
        }
    }


}

module.exports = RolEntidadController;