'use strict';
const { validationResult } = require('express-validator');
var models = require('../models/');
const uuid = require('uuid');
const proyecto = models.proyecto; 
const cuenta = models.cuenta; 
const rolAdmin = 'GERENTE DE PRUEBAS';
class ProyectoController {

    async listar(req, res) {
        try {
            const listar = await proyecto.findAll({
                attributes: [
                    'id', 'external_id', 'estado', 'nombre', 
                    'fecha_inicio', 'descripcion', 
                    'createdAt', 'updatedAt'
                ]
            });
            res.json({ msg: 'OK!', code: 200, info: listar });
        } catch (error) {
            res.status(500).json({ msg: 'Error al listar proyectos', code: 500, error: error.message });
        }
    }

    async getProyecto(req, res) {
        try {
            const listar = await proyecto.findOne({
               where: {external_id: req.body.external_id}
            });
            res.json({ msg: 'OK!', code: 200, info: listar });
        } catch (error) {
            res.status(500).json({ msg: 'Error al obtener proyecto', code: 500, error: error.message });
        }
    }

    async crearProtecto(req, res) {
        let transaction;
        try {
            transaction = await models.sequelize.transaction();
            const entidad = await models.entidad.findOne({ where: { id: req.body.id_entidad }, attributes: ['id'] });
            const nameRole = await models.rol.findOne({ where: { nombre: rolAdmin }, attributes: ['id'] });
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
                        external_id: uuid.v4(),
                    };

                    const newProyect = await models.proyecto.create(data, { transaction });
                    await models.rol_proyecto.create({ id_rol: nameRole.id, id_entidad: entidad.id, id_proyecto: newProyect.id, external_id: uuid.v4() }, { transaction });
                    await transaction.commit();
                    res.json({ msg: "SE HA REGISTRADO CORRECTAMENTE", code: 200, info: newProyect.external_id });
                }
            } else {
                res.status(204).json({ msg: "El usuario ya existe", code: 204 });
            }
        } catch (error) {
            if (transaction) await transaction.rollback();
            if (error.errors && error.errors[0].message) {
                res.json({ msg: "Hubo un problema al crear el proyecto", code: 500 });
            } else { res.json({ msg: error.message, code: 500 }); }
        }
    }

    async actualizarProyecto(req, res) {
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
                res.status(400).json({ msg: "No se encontró el proyecto", code: 400 });
            }
        } catch (error) {
            if (transaction) await transaction.rollback();
            if (error.errors && error.errors[0].message) {
                res.json({ msg: "Hubo un problema al actualizar el proyecto", code: 500 });
            } else {
                res.json({ msg: "Hubo un problema al actualizar el proyecto", code: 500 });
            }
        }
    }

    async asiganarProyecto(req, res) {
        let transaction;
        try {
            transaction = await models.sequelize.transaction();            
            // Buscar el proyecto por external_id
            const proyect = await models.proyecto.findOne({ where: { external_id: req.body.id_proyect } });
            if (!proyect) {
                return res.status(400).json({ msg: "Proyecto no encontrado", code: 400 });
            }
    
            // Buscar el rol por external_id
            const role = await models.rol.findOne({ where: { external_id: req.body.id_rol }, attributes: ['id'] });
            if (!role) {
                return res.status(400).json({ msg: "Rol no encontrado", code: 400 });
            }
    
            // Procesar los usuarios
            const users = req.body.users;
            
            for (const user of users) {
                
                // Buscar la entidad del usuario
                const entidad = await models.entidad.findOne({ where: { id: user.id_entidad } });
    
                if (!entidad) {
                    console.error(`Entidad con id ${user.id_entidad} no encontrada.`);
                    continue;  // Saltar al siguiente usuario si no se encuentra la entidad
                }
    
                // Verificar si la entidad ya tiene el mismo rol en el proyecto
                const existingRolProyecto = await models.rol_proyecto.findOne({
                    where: {
                        id_entidad: entidad.id,
                        id_proyecto: proyect.id,
                        id_rol: role.id  // Verifica si ya existe este rol para esta entidad en el proyecto
                    }
                });
    
                if (existingRolProyecto) {
                    // Si ya existe el mismo rol para esta entidad en el proyecto, no hacer nada
                    console.log(`La entidad ${entidad.id} ya tiene el rol ${role.id} en el proyecto ${proyect.id}. No se asignará nuevamente.`);
                    continue;
                } else {
                    // Si no tiene el mismo rol, asignarlo
                    await models.rol_proyecto.create({
                        id_rol: role.id,
                        id_entidad: entidad.id,
                        id_proyecto: proyect.id,
                        external_id: uuid.v4(),
                    }, { transaction });
                }
            }
    
            // Confirmar transacción
            await transaction.commit();
            
            // Responder con éxito
            res.json({
                msg: users.length > 1 ? "Roles asignados correctamente" : "Rol asignado correctamente",
                code: 200
            });
    
        } catch (error) {
            // Rollback de la transacción en caso de error
            if (transaction) await transaction.rollback();
    
            console.error("Error:", error);
            res.status(500).json({ msg: error.message || "Error interno del servidor", code: 500 });
        }
    }
    
    async getEntidadProyecto(req, res) {
        try {
            const proyect = await models.proyecto.findOne({ where: { external_id: req.params.id_proyect } });
            if (proyect) {
                const rolProyect = await models.rol_proyecto.findAll({
                    where: { id_proyecto: proyect.id },
                    include: [
                        {
                            model: models.entidad,
                            attributes: ['nombres', 'apellidos','foto', 'id'], 
                        },
                        {
                            model: models.rol,
                            attributes: ['nombre'], 
                        }
                    ],
                    attributes: ['id']
                });
                res.status(200).json({ msg: "OK!", code: 200, info: rolProyect });
            } else {
                res.status(400).json({ msg: "No se encontró el proyecto", code: 400 });
            }
        } catch (error) {
            if (error.errors && error.errors[0].message) {
                res.json({ msg: "Estamos teniendo problemas", code: 500 });
            } else {
                res.json({ msg: "Estamos teniendo problemas", code: 500 });
            }
        }
    }


    async removerEntidad(req, res) {
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
                res.status(500).json({ msg:"Estamos teniendo problemas para eliminar", code: 500 });
            } else {
                res.status(500).json({ msg: "Estamos teniendo problemas para eliminar", code: 500 });
            }
        }
    }

    /** SEGUNDO SPRINT */
    async obtenerTestersPorProyecto(req, res) {
        try {
            const proyect = await models.proyecto.findOne({ where: { external_id: req.params.external_id } });
            if (!proyect) {
                return res.status(400).json({ msg: "Proyecto no encontrado", code: 400 });
            }
    
            const role = await models.rol.findOne({ where: { nombre: 'TESTER' }, attributes: ['id'] });
            if (!role) {
                return res.status(400).json({ msg: "Rol de tester no encontrado", code: 400 });
            }
    
            const testers = await models.rol_proyecto.findAll({
                where: {
                    id_proyecto: proyect.id,
                    id_rol: role.id  
                },
                include: [
                    {
                        model: models.entidad, 
                        attributes: ['id', 'nombres', 'apellidos'],
                        include: [
                            {
                                model: models.cuenta,  
                                as: 'cuenta',  
                                attributes: ['correo']  
                            }
                        ]
                    }
                ]
            });
    
            if (testers.length === 0) {
                return res.status(404).json({ msg: "No se encontraron testers asignados a este proyecto", code: 404 });
            }
    
            res.json({
                msg: "Testers encontrados correctamente",
                code: 200,
                info: testers.map(t => ({
                    id: t.entidad.id,
                    nombres: t.entidad.nombres,
                    apellidos: t.entidad.apellidos,
                    correo: t.entidad.cuenta.correo  
                })),
                id_rol:role.id
            });
    
        } catch (error) {
            console.error("Error:", error);
            res.status(500).json({ msg: error.message || "Error interno del servidor", code: 500 });
        }
    }
    
}

module.exports = ProyectoController;
