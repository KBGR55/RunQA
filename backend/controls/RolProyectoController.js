'use strict';

var models = require('../models/');
var rol_proyecto= models.rol_proyecto;

class RolProyectoController {

    async listar(req, res) {
        try {
            const id_entidad = req.query.id_entidad;
            console.log(id_entidad);
    
            if (!id_entidad) {
                return res.status(404).json({ msg: "No se encontró la entidad", code: 404 });
            }

            const listar = await rol_proyecto.findAll({
                where: { id_entidad: id_entidad },
                include: [
                    {
                        model: models.proyecto,
                        where: { estado: true },
                        attributes: ['id', 'fecha_inicio', 'external_id', 'nombre', 'estado', 'descripcion']
                    }
                ]
            });
    
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
            const id_entidad = req.query.id_entidad;
            const external_id_proyecto = req.query.external_id_proyecto;
    
            if (!id_entidad || !external_id_proyecto) {
                return res.status(404).json({ msg: "No se encontró la entidad o el proyecto", code: 404 });
            }
    
            const listar = await rol_proyecto.findAll({
                where: { id_entidad: id_entidad },
                include: [
                    {
                        model: models.proyecto,
                        where: { external_id: external_id_proyecto, estado: true },
                        attributes: ['id', 'fecha_inicio', 'external_id', 'nombre', 'estado', 'descripcion']
                    },
                    {
                        model: models.rol, 
                        attributes: ['id','nombre'] 
                    }
                ]
            });
    
            if (listar.length === 0) {
                return res.status(404).json({ msg: "No se encontraron roles para esta entidad y proyecto", code: 404 });
            }
    
            const proyecto = listar[0].proyecto; 
            const roles = listar.map(item => item.rol); 
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
            res.status(500).json({ msg: 'Se produjo un error en listar roles', code: 500, info: error });
        }
    }
    
    
}

module.exports = RolProyectoController;