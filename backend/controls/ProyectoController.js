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
