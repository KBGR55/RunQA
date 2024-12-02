'use strict';
const { validationResult } = require('express-validator');
var models = require('../models/');
const error = models.error;

class ErrorController {
    // Listar todos los errores
    async listar(req, res) {
        try {
            const errores = await error.findAll({
                attributes: [
                    'external_id', 'funcionalidad', 'titulo', 'pasos_reproducir',
                    'persona_asignada', 'severidad', 'prioridad', 'estado',
                    'razon', 'fecha_reporte', 'fecha_resolucion'
                ]
            });
            res.json({
                msg: 'Errores listados correctamente', code: 200,
                info: errores
            });
        } catch (err) {
            console.error("Error al listar todos los errores:", err);
            res.status(500).json({
                msg: 'Ocurrió un error al intentar listar los errores',
                code: 500,
                error: err.message
            });
        }
    }

    // Listar errores por caso de prueba
    async listarPorCasoPrueba(req, res) {
        const { id_caso_prueba } = req.query;

        if (!id_caso_prueba) {
            return res.status(400).json({
                msg: "El parámetro 'id_caso_prueba' es obligatorio",
                code: 400
            });
        }

        try {
            const errores = await error.findAll({
                where: { id_caso_prueba },
                attributes: [
                    'external_id', 'funcionalidad', 'titulo', 'pasos_reproducir',
                    ' persona_asignada', 'severidad', 'prioridad', 'estado',
                    'ciclo_error', 'razon', 'fecha_reporte', 'fecha_resolucion'
                ]
            });

            if (errores.length === 0) {
                return res.status(404).json({
                    msg: "No se encontraron errores asociados al caso de prueba proporcionado",
                    code: 404
                });
            }

            res.json({
                msg: 'Errores encontrados para el caso de prueba',
                code: 200,
                info: errores
            });
        } catch (err) {
            console.error("Error al listar errores por caso de prueba:", err);
            res.status(500).json({
                msg: 'Ocurrió un error al intentar listar los errores por caso de prueba',
                code: 500,
                error: err.message
            });
        }
    }

    async guardar(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                msg: 'Error de validación', 
                code: 400, 
                errors: errors.array() 
            });
        }
    
        const {
            funcionalidad, titulo, pasos_reproducir,  persona_asignada,
            severidad, prioridad, estado, razon,
            fecha_reporte, fecha_resolucion, id_caso_prueba
        } = req.body;
    
        try {
            const nuevoError = await error.create({
                funcionalidad: funcionalidad || "SIN_DATOS",
                titulo: titulo || "SIN_DATOS",
                pasos_reproducir: pasos_reproducir || null,
                persona_asignada:  persona_asignada || "SIN_DATOS",
                severidad: severidad || "BAJA",
                prioridad: prioridad || 0,
                estado: estado || "PENDIENTE",
                razon: razon || "SIN_DATOS",
                fecha_reporte: fecha_reporte || new Date(),
                fecha_resolucion: fecha_resolucion || null,
                id_caso_prueba: id_caso_prueba
            });
    
            res.status(201).json({
                msg: 'Error registrado exitosamente',
                code: 201,
                info: nuevoError
            });
        } catch (err) {
            console.error("Error al guardar un nuevo error:", err);
            res.status(500).json({
                msg: 'Ocurrió un error al guardar el error',
                code: 500,
                error: err.message
            });
        }
    }
    
}

module.exports = ErrorController;