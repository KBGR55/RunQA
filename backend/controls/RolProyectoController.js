'use strict';

var models = require('../models/');
var rol_proyecto= models.rol_proyecto;

class RolProyectoController {

    async listar(req, res) {
        try {
            const id_entidad =  req.query.id_entidad; 
            console.log(id_entidad);

            if (!id_entidad) {
                res.status(404).json({ msg: "No se encontró la entidad", code: 404 });
            }

            const listar = await rol_proyecto.findAll({
                where: { id_entidad: id_entidad },
                include: [
                    {
                        model: models.proyecto, 
                        where: { estado: true }, 
                        attributes: ['id', 'fecha_inicio','external_id', 'nombre','estado', 'descripcion' ]
                    }
                ]
            });
            
            res.json({ msg: 'OK!', code: 200, info: listar });
        } catch (error) {
            res.json({ msg: 'Se produjo un error en listar roles', code: 500, info: error });
        }
    }
}

module.exports = RolProyectoController;