'use strict';

const { where } = require('sequelize');
var models = require('../models/');
var rol_proyecto= models.rol_proyecto;
const rolAdministrador ='ADMINISTRADOR SYS';
const { Op } = require('sequelize'); // Ensure Sequelize operators are available

class RolProyectoController {

async listar(req, res) {
    try {
        const id_entidad = req.query.id_entidad;

        // Fetch the entity and ensure it’s active
        const entidadAux = await models.rol_entidad.findOne({
            where: { id_entidad: id_entidad },
            include: [
                {
                    model: models.entidad,
                    where: { estado: true },
                    attributes: ['id', 'external_id', 'nombres', 'apellidos', 'fecha_nacimiento', 'telefono', 'estado','horasDisponibles']
                }
            ]
        });

        const adminRol = await models.rol.findOne({ where: { nombre: rolAdministrador }, attributes: ['id'] });

        if (!entidadAux) {
            return res.status(404).json({ msg: "No se encontró la entidad activa", code: 404 });
        }

        // Retrieve projects, excluding only those with the admin role for this entity
        const listar = await models.rol_proyecto.findAll({
            where: {
                id_rol_entidad: entidadAux.id
            },
            include: [
                {
                    model: models.proyecto,
                    where: { estado: true },
                    attributes: ['id', 'fecha_inicio', 'external_id', 'nombre', 'estado', 'descripcion']
                },
                {
                    model: models.rol_entidad,
                    where: {
                        id_rol: { [Op.ne]: adminRol.id }  // Exclude only roles with the admin role ID
                    },
                    attributes: []  // Optional: Omit role attributes if not needed in the response
                }
            ]
        });

        // Filter out duplicate projects by unique ID
        const proyectosUnicos = listar.filter(
            (value, index, self) => index === self.findIndex((t) => t.proyecto.id === value.proyecto.id)
        );

        res.json({ msg: 'OK!', code: 200, info: proyectosUnicos });
    } catch (error) {
        res.json({ msg: 'Se produjo un error en listar roles', code: 500, info: error });
    }
}

    async listar_roles_entidad(req, res) {
        try {
            const { id_entidad, external_id_proyecto } = req.query;
    
            if (!id_entidad || !external_id_proyecto) {
                return res.status(404).json({ msg: "No se encontró la entidad o el proyecto", code: 404 });
            }
    
            const entidadAux = await models.rol_entidad.findOne({
                where: { id_entidad: id_entidad },
                include: [
                    {
                        model: models.entidad,
                        where: { estado: true },
                        attributes: ['id', 'external_id', 'nombres', 'apellidos', 'fecha_nacimiento', 'telefono', 'estado','horasDisponibles']
                    }
                ]
            });
    
            if (!entidadAux) {
                return res.status(404).json({ msg: "No se encontró la entidad activa", code: 404 });
            }
    
            const listar = await models.rol_proyecto.findAll({
                where: { id_rol_entidad: entidadAux.id },
                include: [
                    {
                        model: models.proyecto,
                        where: { external_id: external_id_proyecto, estado: true },
                        attributes: ['id', 'fecha_inicio', 'external_id', 'nombre', 'estado', 'descripcion']
                    },
                    {
                        model: models.rol_entidad,
                        include: [
                            {
                                model: models.rol,
                                attributes: ['id', 'nombre']
                            }
                        ]
                    }
                ]
            });
    
            if (listar.length === 0) {
                return res.status(404).json({ msg: "No se encontraron roles para esta entidad y proyecto", code: 404 });
            }

            const proyecto = listar[0].proyecto;
            const roles = listar.map(item => item.rol_entidad.rol);
    
            const response = {
                proyecto: {
                    id: proyecto.id,
                    external_id: proyecto.external_id,
                    nombre: proyecto.nombre,
                    fecha_inicio: proyecto.fecha_inicio,
                    descripcion: proyecto.descripcion,
                    estado: proyecto.estado,
                },
                roles: roles
            };
    
            res.json({ msg: 'OK!', code: 200, info: response });
        } catch (error) {
            console.error(error);
            console.log(error);
            res.status(500).json({ msg: 'Se produjo un error en listar roles', code: 500, info: error.message });
        }
    }
    
}

module.exports = RolProyectoController;