'use strict';
const { validationResult } = require('express-validator');
const models = require('../models');
const uuid = require('uuid');

class FuncionalidadController {
    async listar(req, res) {
        try {
            const funcionalidades = await models.funcionalidad.findAll({
                attributes: ['external_id', 'nombre', 'estado', 'tipo'],
                include: [
                    {
                        model: models.entidad,
                        as: 'creador',
                        attributes: ['nombres', 'apellidos']
                    }
                ]
            });
            res.json({ msg: 'OK', code: 200, info: funcionalidades });
        } catch (error) {
            res.status(500).json({ msg: 'Error al listar funcionalidades: ' + error.message, code: 500 });
        }
    }

    async obtenerFuncionalidadesProyecto(req, res) {
        const { external_id } = req.params;
        
        try {
            const externalproyecto = await models.proyecto.findOne({
                where: { external_id: external_id },
            });

            if (!externalproyecto) {
                return res.status(404).json({ msg: 'Proyecto no encontrado', code: 404 });
            }

            const funcionalidades = await models.funcionalidad.findAll({
                where: { id_proyecto: externalproyecto.id },
                attributes: ['external_id', 'nombre', 'estado', 'tipo', 'id', 'descripcion'],
                include: [
                    {
                        model: models.entidad,
                        attributes: ['nombres', 'apellidos']
                    }
                ]
            });

            if (!funcionalidades) {
                return res.status(404).json({ msg: 'No hay funcionalidades registradas', code: 404 });
            }

            res.json({ msg: 'OK', code: 200, info: funcionalidades });
        } catch (error) {
            res.status(500).json({ msg: 'Error al obtener la funcionalidad: ' + error, code: 500 });
        }
    }

    async guardar(req, res) {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(400).json({ msg: 'Datos incompletos', code: 400, errors: errors.array() });
            }

            const { nombre, id_creador, id_proyecto, tipo, descripcion } = req.body;

            if (!nombre || !id_creador || !id_proyecto || !tipo || !descripcion) {
                return res.status(400).json({ msg: "Faltan datos requeridos", code: 400 });
            }

            const proyecto = await models.proyecto.findOne({ where: { external_id: id_proyecto } });

            if (!proyecto) {
                return res.status(404).json({ msg: 'Proyecto no encontrado', code: 404 });
            }

            const proyecto_id = proyecto.id;

            const data = {
                "nombre": nombre,
                "id_entidad": id_creador,
                "id_proyecto": proyecto_id,
                "tipo": tipo,
                "descripcion": descripcion,
            }
            let transaction = await models.sequelize.transaction();
            await models.funcionalidad.create(data, transaction);
            await transaction.commit();

            res.json({ msg: 'Funcionalidad creada con éxito', code: 200});
        } catch (error) {
            res.status(500).json({ msg: 'Error al guardar la funcionalidad: ' + error.message, code: 500 });
        }
    }

    async actualizar(req, res) {
        try {
            const { external_id } = req.body;

            const funcionalidad = await models.funcionalidad.findOne({ where: { external_id } });

            if (!funcionalidad) {
                return res.status(404).json({ msg: 'Funcionalidad no encontrada', code: 404 });
            }

            const { nombre, descripcion, tipo } = req.body;

            funcionalidad.nombre = nombre || funcionalidad.nombre;
            funcionalidad.tipo = tipo || funcionalidad.tipo;
            funcionalidad.descripcion = descripcion || funcionalidad.descripcion;
            funcionalidad.external_id = uuid.v4();

            await funcionalidad.save();

            res.json({ msg: 'Funcionalidad actualizada con éxito', code: 200 });
        } catch (error) {
            res.status(500).json({ msg: 'Error al actualizar la funcionalidad', code: 500 });
        }
    }

    async cambiarEstado(req, res) {
        try {
            const { external_id } = req.params;
    
            const funcionalidad = await models.funcionalidad.findOne({ where: { external_id } });
    
            if (!funcionalidad) {
                return res.status(404).json({ msg: 'Funcionalidad no encontrada', code: 404 });
            }
    
            const casosPruebaAsociados = await models.caso_prueba.findOne({ where: { id_funcionalidad: funcionalidad.id } });
    
            if (casosPruebaAsociados) {
                return res.status(400).json({
                    msg: 'No se puede eliminar la funcionalidad porque tiene casos de prueba asociados.',
                    code: 400
                });
            }
    
            funcionalidad.estado = !funcionalidad.estado; 
            funcionalidad.external_id = uuid.v4(); 
    
            await funcionalidad.save();
    
            res.json({ msg: 'Estado de funcionalidad actualizado con éxito', code: 200 });
        } catch (error) {
            res.status(500).json({ msg: 'Error al cambiar el estado: ' + error.message, code: 500 });
        }
    }
    
}

module.exports = FuncionalidadController;
