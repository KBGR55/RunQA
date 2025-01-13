'use strict';

const { where } = require('sequelize');
var models = require('../models/');
var rol_proyecto = models.rol_proyecto;
const rolAdministrador = 'ADMINISTRADOR SYS';
const { Op } = require('sequelize');

class RolProyectoController {

    async listar(req, res) {
        try {
            const id_entidad = req.query.id_entidad;
            const entidadAux = await models.rol_entidad.findOne({
                where: { id_entidad },
                include: [
                    {
                        model: models.entidad,
                        as: 'entidad',
                        where: { estado: true },
                        attributes: ['id', 'external_id', 'nombres', 'apellidos', 'fecha_nacimiento', 'telefono', 'estado', 'horasDisponibles']
                    }
                ]
            });
    
            if (!entidadAux) {
                console.error("No se encontró la entidad activa");
                return res.status(404).json({ msg: "No se encontró la entidad activa", code: 404 });
            }
    
            const adminRol = await models.rol.findOne({
                where: { nombre: rolAdministrador}, 
                attributes: ['id']
            });
            if (!adminRol) {
                console.error("No se encontró el rol de administrador");
                return res.status(404).json({ msg: "No se encontró el rol de administrador", code: 404 });
            }                 
            const listar = await models.rol_proyecto.findAll({
                include: [
                    {
                        model: models.proyecto,
                        as: 'proyecto_rol',
                        where: { estado: true },
                        attributes: ['id', 'fecha_inicio', 'external_id', 'nombre', 'estado', 'descripcion']
                    },
                    {
                        model: models.rol_entidad,
                        as: 'rol_entidad',
                        where: { id_rol: { [Op.ne]: adminRol.id }, id_entidad: id_entidad },
                        attributes: []
                    }
                ],
                logging: console.log 
            });    
                       
    
            if (!listar || listar.length === 0) {
                console.warn("No se encontraron roles-proyectos relacionados");
                return res.json({ msg: "No se encontraron roles-proyectos relacionados", code: 204 });
            }
    
            // Filtrar proyectos únicos
            const proyectosUnicos = listar
                .map(item => item.proyecto_rol) 
                .filter((proyecto, index, self) => proyecto && self.findIndex(p => p.id === proyecto.id) === index);
            
            res.json({ msg: 'OK!', code: 200, info: proyectosUnicos });    } catch (error) {
            console.error("Error en listar roles:", error);
            res.status(500).json({ msg: 'Se produjo un error en listar roles', code: 500, info: error.message });
        }
    }
    
    
    async listar_roles_entidad(req, res) {
        try {
            const { id_entidad, external_id_proyecto } = req.query;
    
            if (!id_entidad || !external_id_proyecto) {
                return res.status(404).json({ msg: "No se encontró la entidad o el proyecto", code: 404 });
            }
    
            const entidadAux = await models.rol_entidad.findAll({
                where: { id_entidad: id_entidad },
                attributes: ['id']
            });
    
            if (!entidadAux || entidadAux.length === 0) {
                return res.status(404).json({ msg: "No se encontró la entidad activa", code: 404 });
            }
    
            const ids_entidad = entidadAux.map(item => item.id);
    
            const listar = await models.rol_proyecto.findAll({
                where: { id_rol_entidad: ids_entidad },
                include: [
                    {
                        model: models.proyecto,
                        as: 'proyecto_rol',
                        where: { external_id: external_id_proyecto, estado: true },
                        attributes: ['id', 'fecha_inicio', 'external_id', 'nombre', 'estado', 'descripcion']
                    },
                    {
                        model: models.rol_entidad,
                        as: 'rol_entidad',
                        include: [
                            {
                                model: models.rol,
                                attributes: ['id', 'nombre']
                            }
                        ]
                    }
                ]
            });

    
            // Check if `listar` has results and the `proyecto` is properly loaded
            if (listar.length === 0 || !listar[0].proyecto_rol) {
                return res.status(404).json({ msg: "No se encontraron roles para la entidad y el proyecto", code: 404 });
            }
    
            const proyecto = listar[0].proyecto_rol;  // Use the alias 'proyecto_rol' as specified
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
            res.status(500).json({ msg: 'Se produjo un error en listar roles', code: 500, info: error.message });
        }
    }
    

}

module.exports = RolProyectoController;