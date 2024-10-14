'use strict';
const { validationResult } = require('express-validator');
var models = require('../models/');
const proyecto = models.proyecto; 
class ProyectoController {

    async listar(req, res) {
        try {
            const listar = await proyecto.findAll({
                attributes: [
                    'id', 'external_id', 'estado', 'nombre', 
                    'fecha_inicio', 'fecha_fin', 'descripcion', 
                    'createdAt', 'updatedAt'
                ]
            });
            res.json({ msg: 'OK!', code: 200, info: listar });
        } catch (error) {
            res.status(500).json({ msg: 'Error al listar proyectos', code: 500, error: error.message });
        }
    }

}

module.exports = ProyectoController;
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
                res.json({ msg: error.errors[0].message, code: 500 });
            } else {
                res.json({ msg: error.message, code: 500 });
            }
        }
    }

    async assignEntity(req, res) {
        let transaction;
        try {
            transaction = await models.sequelize.transaction();
            const proyect = await models.proyecto.findOne({ where: { id: req.body.id_proyect } });
            const owner = await models.entidad.findOne({ where: { id: req.body.owner } });
            const role = await models.rol.findOne({ where: { external_id: req.body.id_rol }, attributes: ['id'] });

            if (!proyect || !role || !owner) {
                return res.status(400).json({ msg: "Datos inválidos", code: 400 });
            }
            const users = req.body.users;
            for (const user of users) {
                const entidad = await models.entidad.findOne({ where: { id: user.id_entidad } });

                if (entidad && owner.id !== entidad.id) {
                    const existingRolProyecto = await models.rol_proyecto.findOne({
                        where: { id_entidad: entidad.id, id_proyecto: proyect.id }
                    });
                    if (existingRolProyecto) {
                        existingRolProyecto.id_rol = role.id;
                        await existingRolProyecto.save({ transaction });
                    } else {
                        await models.rol_proyecto.create({
                            id_rol: role.id,
                            id_entidad: entidad.id,
                            id_proyecto: proyect.id,
                            external_id: uuid.v4(),
                        }, { transaction });
                    }
                }
            }
            await transaction.commit();
            if (users.length > 1) {
                res.json({ msg: "Roles asignados correctamente", code: 200 });
            } else {
                res.json({ msg: "Rol asignado correctamente", code: 200 });
            }

        } catch (error) {
            if (transaction) await transaction.rollback();
            if (error.errors && error.errors[0].message) {
                res.json({ msg: error.errors[0].message, code: 500 });
            } else {
                res.json({ msg: error.message, code: 500 });
            }
        }
    }

    async getEntityProyect(req, res) {
        try {
            const proyect = await models.proyecto.findOne({ where: { external_id: req.params.id_proyect } });
            if (proyect) {
                const rolProyect = await models.rol_proyecto.findAll({
                    where: { id_proyecto: proyect.id },
                    include: [
                        {
                            model: models.entidad,
                            attributes: ['nombres', 'apellidos', 'id'], 
                        },
                        {
                            model: models.rol,
                            attributes: ['nombre'] 
                        }
                    ],
                    attributes: ['id']
                });
                res.status(200).json({ msg: "OK!", code: 200, info: rolProyect });
            } else {
                res.status(200).json({ msg: "No se encontró el proyecto", code: 200 });
            }
        } catch (error) {
            if (error.errors && error.errors[0].message) {
                res.json({ msg: error.errors[0].message, code: 500 });
            } else {
                res.json({ msg: error.message, code: 500 });
            }
        }
    }


    async deleteEntity(req, res) {
        try {
            const proyect = await models.proyecto.findOne({ where: { external_id: req.params.id_proyect } });
    
            if (proyect) {
                const rolProyect = await models.rol_proyecto.findOne({
                    where: { 
                        id_proyecto: proyect.id, 
                        id_entidad: req.params.id_entidad 
                    } 
                })
                if (rolProyect) {
                    await rolProyect.destroy();
                    res.status(200).json({ msg: "Usuario eliminado del proyecto exitosamente", code: 200 });
                } else {
                    res.status(404).json({ msg: "No se encontró la relación entre el usuario y el proyecto", code: 404 });
                }
            } else {
                res.status(404).json({ msg: "No se encontró el proyecto", code: 404 });
            }
        } catch (error) {
            if (error.errors && error.errors[0].message) {
                res.status(500).json({ msg: error.errors[0].message, code: 500 });
            } else {
                res.status(500).json({ msg: error.message, code: 500 });
            }
        }
    }
}

module.exports = ProyectoController;
