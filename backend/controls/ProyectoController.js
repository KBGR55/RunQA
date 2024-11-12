'use strict';
const { validationResult } = require('express-validator');
var models = require('../models/');
const uuid = require('uuid');
const proyecto = models.proyecto; 
const cuenta = models.cuenta; 
const rolLider = 'LIDER DE CALIDAD';
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
               where: {external_id: req.params.external_id}
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
            const nameRole = await models.rol.findOne({ where: { nombre: rolLider }, attributes: ['id'] });
            if (entidad) {
                const rolEntidad = await models.rol_entidad.findOne({ where: { id_entidad: entidad.id,id_rol:nameRole.id},attributes: ['id']});
                const resultado = await models.rol_proyecto.findOne({
                    where: { id_rol_entidad: rolEntidad.id },
                    include: {
                        model: models.proyecto, where: { nombre: req.body.name },
                        attributes: ['id', 'nombre']
                    }, attributes: ['id_rol_entidad']
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
                   await models.rol_proyecto.create({id_rol_entidad: rolEntidad.id, id_proyecto: newProyect.id, external_id: uuid.v4() }, { transaction });
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
                const nameRole = await models.rol.findOne({ where: { nombre: rolLider }, attributes: ['id'] });
                const resultado = await models.rol_proyecto.findOne({
                    where: { id_rol: nameRole.id, id_entidad: rolProyect.id_entidad },
                    include: {
                        model: models.proyecto,
                        where: { nombre: req.body.name },
                        attributes: ['id', 'nombre']
                    },
                    attributes: ['id_entidad']
                });
                if (resultado && (oldProyect.descripcion ==req.body.description)) {
                    res.status(200).json({ msg: "El proyecto ya existe", code: 409 });
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

    async asignarProyecto(req, res) {
        let transaction;
        const errorMessages = [];
    
        try {
            transaction = await models.sequelize.transaction();
    
            const proyecto = await models.proyecto.findOne({ 
                where: { external_id: req.body.id_proyect },  
                attributes: ['id', 'nombre'] 
            });
            if (!proyecto) {
                return res.status(400).json({ msg: "Proyecto no encontrado", code: 400 });
            }
    
            const rol = await models.rol.findOne({ 
                where: { external_id: req.body.id_rol }, 
                attributes: ['id'] 
            });
            if (!rol) {
                return res.status(400).json({ msg: "Rol no encontrado", code: 400 });
            }
    
            const users = req.body.users;
            let hasErrors = false;
    
            for (const user of users) {
                const entidad = await models.entidad.findOne({ 
                    where: { id: user.id_entidad }, 
                    attributes: ['id', 'nombres', 'horasDisponibles'] 
                });
                if (!entidad) {
                    errorMessages.push(`Entidad con ID ${user.id_entidad} no encontrada.`);
                    hasErrors = true;
                    continue;
                }
    
                if (entidad.horasDisponibles < req.body.horasDiarias) {
                    errorMessages.push(`${entidad.nombres} no tiene suficientes horas disponibles.`);
                    hasErrors = true;
                    continue;
                }
    
                let rolEntidad = await models.rol_entidad.findOne({
                    where: { id_entidad: entidad.id, id_rol: rol.id }
                });
    
                if (!rolEntidad) {
                    rolEntidad = await models.rol_entidad.create({
                        id_entidad: entidad.id,
                        id_rol: rol.id,
                        external_id: uuid.v4(),
                    }, { transaction });
                }
    
                let rolProyecto = await models.rol_proyecto.findOne({
                    where: { id_rol_entidad: rolEntidad.id, id_proyecto: proyecto.id }
                });
    
                if (rolProyecto) {
                    rolProyecto.horasDiarias += req.body.horasDiarias;
                    await rolProyecto.save({ transaction });
                } else {
                    await models.rol_proyecto.create({
                        id_rol_entidad: rolEntidad.id,
                        id_proyecto: proyecto.id,
                        horasDiarias: req.body.horasDiarias,
                        external_id: uuid.v4(),
                    }, { transaction });
                }
    
                entidad.horasDisponibles -= req.body.horasDiarias;
                await entidad.save({ transaction });
            }
    
            if (hasErrors) {
                await transaction.rollback();
                const errorMsg = errorMessages.join(", ");
                return res.status(500).json({ msg: errorMsg, code: 500 });
            } else {
                await transaction.commit();
                res.json({ msg: users.length > 1 ? "Roles asignados correctamente" : "Rol asignado correctamente", code: 200 });
            }
    
        } catch (error) {
            if (transaction) await transaction.rollback();
            console.error("Error:", error);
            res.status(500).json({
                msg: error.message || "Error interno del servidor",
                code: 500
            });
        }
    }
    
    async getEntidadProyecto(req, res) {
        try {
            const proyecto = await models.proyecto.findOne({ where: { external_id: req.params.id_proyect } });
            if (!proyecto) {
                return res.status(400).json({ msg: "No se encontró el proyecto", code: 400 });
            }
    
            const rolProyectos = await models.rol_proyecto.findAll({
                where: { id_proyecto: proyecto.id },
                attributes: ['id'],
                include: [
                    {
                        model: models.rol_entidad,
                        as: 'rol_entidad',
                        include: [
                            {
                                model: models.entidad,
                                as: 'entidad',
                                attributes: ['nombres', 'apellidos', 'foto', 'id','horasDisponibles'],
                            },
                            {
                                model: models.rol,
                                as: 'rol',
                                attributes: ['nombre'],
                            }
                        ]
                    },
                    {
                        model: models.proyecto,
                        as: 'proyecto',
                        attributes: ['nombre', 'descripcion']
                    }
                ],
                attributes: ['id','horasDiarias']
            });
    
            res.status(200).json({ msg: "OK!", code: 200, info: rolProyectos });
    
        } catch (error) {
            console.error("Error:", error);
            res.status(500).json({ msg: "Estamos teniendo problemas", code: 500 });
        }
    }    

    async removerEntidad(req, res) {
        try {
            const proyecto = await models.proyecto.findOne({ where: { external_id: req.params.id_proyect } });
            if (!proyecto) {
                return res.status(404).json({ msg: "No se encontró el proyecto", code: 404 });
            }
    
            const rolEntidad = await models.rol_entidad.findOne({
                where: { id_entidad: req.params.id_entidad }
            });
    
            if (!rolEntidad) {
                return res.status(404).json({ msg: "No se encontró la relación entre la entidad y el rol", code: 404 });
            }
    
            const entidad = await models.entidad.findOne({ 
                where: { id: req.params.id_entidad },
                attributes: ['id', 'horasDisponibles']  
            });
    
            if (!entidad) {
                return res.status(404).json({ msg: "Entidad no encontrada", code: 404 });
            }
    
            const rolProyecto = await models.rol_proyecto.findOne({
                where: {
                    id_proyecto: proyecto.id,
                    id_rol_entidad: rolEntidad.id
                },
                attributes: ['id', 'horasDiarias']  // Asegúrate de incluir 'id'
            });
    
            if (!rolProyecto || !rolProyecto.id) {
                return res.status(404).json({ msg: "No se encontró la relación entre la entidad y el proyecto", code: 404 });
            }
    
            // Incrementar las horas disponibles de la entidad
            entidad.horasDisponibles += rolProyecto.horasDiarias;
    
            // Guardar la entidad
            await entidad.save();
    
            // Eliminar la relación rol_proyecto
            await rolProyecto.destroy();  // Asegúrate de que rolProyecto tiene un id
    
            res.status(200).json({ msg: "Entidad eliminada del proyecto exitosamente", code: 200 });
    
        } catch (error) {
            console.error("Error en removerEntidad:", error);
            res.status(500).json({ msg: "Estamos teniendo problemas para eliminar", code: 500 });
        }
    }
    
    /** SEGUNDO SPRINT */
    async obtenerTestersPorProyecto(req, res) {
        try {
            const proyecto = await models.proyecto.findOne({ where: { external_id: req.params.external_id } });
            if (!proyecto) {
                return res.status(400).json({ msg: "Proyecto no encontrado", code: 400 });
            }
    
            const rolTester = await models.rol.findOne({ where: { nombre: 'TESTER' }, attributes: ['id'] });
            if (!rolTester) {
                return res.status(400).json({ msg: "Rol de tester no encontrado", code: 400 });
            }
    
            const testers = await models.rol_proyecto.findAll({
                where: {
                    id_proyecto: proyecto.id,
                },
                include: [
                    {
                        model: models.rol_entidad,
                        as: 'rol_entidad',
                        where: { id_rol: rolTester.id },
                        include: [
                            {
                                model: models.entidad,
                                as: 'entidad',
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
                    id: t.rol_entidad.entidad.id,
                    nombres: t.rol_entidad.entidad.nombres,
                    apellidos: t.rol_entidad.entidad.apellidos,
                    correo: t.rol_entidad.entidad.cuenta.correo
                })),
                id_rol: rolTester.id
            });
    
        } catch (error) {
            console.error("Error:", error);
            res.status(500).json({ msg: error.message || "Error interno del servidor", code: 500 });
        }
    }      
    
}

module.exports = ProyectoController;
