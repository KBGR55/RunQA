'use strict';
var models = require('../models');
const uuid = require('uuid');
const adminRol = 'administrador';
class ProyectoController {

    async createProyect(req, res) {
        let transaction;
        try {
            transaction = await models.sequelize.transaction();
            const entidad = await models.entidad.findOne({ where: { id: req.body.id_entidad }, attributes: ['id'] });
            const nameRole = await models.rol.findOne({ where: { nombre: adminRol }, attributes: ['id'] });
            if (entidad) {
                const resultado = await models.rol_proyecto.findOne({
                    where: { id_rol: nameRole.id, id_entidad: entidad.id },
                    include: {
                        model: models.proyecto, where: { nombre: req.body.name },
                        attributes: ['id', 'nombre']
                    }, attributes: ['id_entidad']
                });
                if (resultado) {
                    res.status(200).json({ msg: "El proyecto ya existe", code: 200 });
                } else {
                    const data = {
                        nombre: req.body.name,
                        descripcion: req.body.description,
                        fecha_inicio: new Date(),
                        fecha_fin: req.body.end_date,
                        external_id: uuid.v4(),
                    };

                    const newProyect = await models.proyecto.create(data, { transaction });
                    await models.rol_proyecto.create({ id_rol: nameRole.id, id_entidad: entidad.id, id_proyecto: newProyect.id, external_id: uuid.v4() }, { transaction });
                    await transaction.commit();
                    res.json({ msg: "SE HA REGISTRADO CORRECTAMENTE", code: 200, info: newProyect.external_id });
                }
            } else {
                res.status(200).json({ msg: "El usuario ya existe", code: 200 });
            }
        } catch (error) {
            if (transaction) await transaction.rollback();
            if (error.errors && error.errors[0].message) {
                res.json({ msg: error.errors[0].message, code: 200 });
            } else { res.json({ msg: error.message, code: 200 }); }
        }
    }



    async updateProyect(req, res) {
        let transaction;
        try {
            transaction = await models.sequelize.transaction();
            const oldProyect = await models.proyecto.findOne({ where: { id: req.body.id_proyect } });
            const rolProyect = await models.rol_proyecto.findOne({ where: { id_proyecto: req.body.id_proyect } });
            if (oldProyect) {
                const nameRole = await models.rol.findOne({ where: { nombre: adminRol }, attributes: ['id'] });
                const resultado = await models.rol_proyecto.findOne({
                    where: { id_rol: nameRole.id, id_entidad: rolProyect.id_entidad },
                    include: {
                        model: models.proyecto,
                        where: { nombre: req.body.name },
                        attributes: ['id', 'nombre']
                    },
                    attributes: ['id_entidad']
                });
                if (resultado) {
                    res.status(200).json({ msg: "El proyecto ya existe", code: 200 });
                } else {
                    oldProyect.nombre = req.body.name;
                    oldProyect.descripcion = req.body.description;
                    await oldProyect.save({ transaction });
                    await transaction.commit();
                    res.json({ msg: "El proyecto se ha actualizado correctamente", code: 200, info: oldProyect.external_id });
                }
            } else {
                res.status(200).json({ msg: "No se encontró el proyecto", code: 200 });
            }
        } catch (error) {
            if (transaction) await transaction.rollback();
            if (error.errors && error.errors[0].message) {
                res.json({ msg: error.errors[0].message, code: 200 });
            } else {
                res.json({ msg: error.message, code: 200 });
            }
        }
    }

    async assignEntity(req, res) {
        let transaction;
        try {
            transaction = await models.sequelize.transaction();
            const proyect = await models.proyecto.findOne({ where: { id: req.body.id_proyect } });
            const entidad = await models.entidad.findOne({ where: { id: req.body.id_entidad } });
            const owner = await models.entidad.findOne({ where: { id: req.body.owner } });
            const role = await models.rol.findOne({ where: { external_id: req.body.id_rol }, attributes: ['id'] });
            if (entidad && proyect &&role && (owner.id !== entidad.id)) {
                const existingRolProyecto = await models.rol_proyecto.findOne({ where: { id_entidad: entidad.id, id_proyecto: proyect.id } });
                if (existingRolProyecto) {
                    existingRolProyecto.id_rol = role.id;
                    await existingRolProyecto.save({ transaction });
                    await transaction.commit();
                    res.json({ msg: "ROL ACTUALIZADO CORRECTAMENTE", code: 200 });
                } else {
                    await models.rol_proyecto.create({ id_rol: role.id, id_entidad: entidad.id, id_proyecto: proyect.id, external_id: uuid.v4() }, { transaction });
                    await transaction.commit();
                    res.json({ msg: "SE HA ASIGNADO CORRECTAMENTE", code: 200 });
                }
            } else {
                res.status(200).json({ msg: "No se pudo asignar el proyecto", code: 200 });
            }
        } catch (error) {
            if (transaction) await transaction.rollback();
            if (error.errors && error.errors[0].message) {
                res.json({ msg: error.errors[0].message, code: 200 });
            } else {
                res.json({ msg: error.message, code: 200 });
            }
        }
    }
}

module.exports = ProyectoController;
