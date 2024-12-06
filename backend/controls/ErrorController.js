'use strict';
const { validationResult } = require('express-validator');
var models = require('../models/');
const error = models.error;

class ErrorController {

    async listar(req, res) {
        try {
            const errores = await error.findAll({
                attributes: [
                    'external_id', 'funcionalidad', 'titulo', 'pasos_reproducir',
                    'persona_asignada', 'severidad', 'estado', 'prioridad',
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

    async listarPorCasoPrueba(req, res) {
        const { external_caso_prueba } = req.query;

        const casoPrueba = await models.caso_prueba.findOne({
            where: { external_id: external_caso_prueba }
        });
        // Si no se encuentra el caso de prueba, retornar un error
        if (!casoPrueba) {
            return res.status(404).json({
                msg: 'Caso de prueba no encontrado',
                code: 404
            });
        }

        const id_caso = casoPrueba.id;


        try {
            const errores = await error.findAll({
                where: { id_caso_prueba: id_caso },
                attributes: [
                    'id', 'external_id', 'funcionalidad', 'titulo', 'pasos_reproducir',
                    'persona_asignada', 'severidad', 'estado','prioridad',
                    'razon', 'fecha_reporte', 'fecha_resolucion'
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

    async editar(req, res) {
        const { external_id } = req.query;
        if (!external_id) {
            return res.status(400).json({
                msg: 'El external_id es requerido',
                code: 400
            });
        }

        const {
            funcionalidad, titulo, pasos_reproducir, persona_asignada, prioridad,
            severidad, estado, razon, fecha_resolucion
        } = req.body;

        try {
            // Buscar el error por external_id
            const errorEncontrado = await error.findOne({
                where: { external_id: external_id },
                attributes: [
                    'external_id', 'funcionalidad', 'titulo', 'pasos_reproducir',
                    'persona_asignada', 'severidad', 'estado', 'prioridad',
                    'razon', 'fecha_reporte', 'fecha_resolucion'
                ]
            });

            if (!errorEncontrado) {
                return res.status(404).json({
                    msg: 'Error no encontrado',
                    code: 404
                });
            }

            // Actualizar el error encontrado
            const [updated] = await error.update({
                funcionalidad: funcionalidad || errorEncontrado.funcionalidad,
                titulo: titulo || errorEncontrado.titulo,
                pasos_reproducir: pasos_reproducir || errorEncontrado.pasos_reproducir,
                persona_asignada: persona_asignada || errorEncontrado.persona_asignada,
                severidad: severidad || errorEncontrado.severidad,
                prioridad: prioridad || errorEncontrado.prioridad,
                estado: estado || errorEncontrado.estado,
                razon: razon || errorEncontrado.razon,
                fecha_resolucion: fecha_resolucion || errorEncontrado.fecha_resolucion
            }, {
                where: { external_id: external_id }
            });

            // Verificar si se actualizó el error
            if (!updated) {
                return res.status(404).json({
                    msg: 'No se pudo actualizar el error',
                    code: 404
                });
            }

            // Enviar respuesta exitosa
            return res.json({
                msg: 'Error actualizado correctamente',
                code: 200,
                info: { external_id, funcionalidad, titulo, pasos_reproducir, persona_asignada, severidad, prioridad, estado, razon, fecha_resolucion }
            });

        } catch (err) {
            console.error("Error al actualizar el error:", err);
            if (!res.headersSent) {
                return res.status(500).json({
                    msg: 'Ocurrió un error al intentar actualizar el error',
                    code: 500,
                    error: err.message
                });
            }
        }
    }

    async obtener(req, res) {
        const { external_id } = req.query;
        if (!external_id) {
            return res.status(400).json({
                msg: 'El external_id es requerido',
                code: 400
            });
        }

        try {
            const errorEncontrado = await error.findOne({
                where: { external_id: external_id },
                attributes: [
                    'external_id', 'funcionalidad', 'titulo', 'pasos_reproducir',
                    'persona_asignada', 'severidad', 'estado', 'prioridad',
                    'razon', 'fecha_reporte', 'fecha_resolucion'
                ]
            });

            if (!errorEncontrado) {
                return res.status(404).json({
                    msg: 'Error no encontrado',
                    code: 404
                });
            }

            res.json({
                msg: 'Error encontrado correctamente',
                code: 200,
                info: errorEncontrado
            });
        } catch (err) {
            console.error("Error al buscar el error por external_id:", err);
            res.status(500).json({
                msg: 'Ocurrió un error al intentar buscar el error',
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
        console.log(req.body);
        

        const {
            funcionalidad, titulo, pasos_reproducir, persona_asignada,
            severidad, razon, prioridad,
            fecha_reporte, fecha_resolucion, external_caso_prueba
        } = req.body;
        try {
            // Buscar solo cuando su  estadoAsignacion no sea  'NO ASIGNADO' y el estado este en 
            const casoPrueba = await models.caso_prueba.findOne({
                where: { external_id: external_caso_prueba }
            });

            // Si no se encuentra el caso de prueba, retornar un error
            if (!casoPrueba) {
                return res.status(404).json({
                    msg: 'Caso de prueba no encontrado',
                    code: 404
                });
            }
            casoPrueba.estado = 'FALLIDO';
            await casoPrueba.save();
            // Crear el nuevo error con el id del caso de prueba encontrado
            const nuevoError = await error.create({
                funcionalidad: funcionalidad || "SIN_DATOS",
                titulo: titulo || "SIN_DATOS",
                pasos_reproducir: pasos_reproducir || null,
                persona_asignada: persona_asignada || "SIN_DATOS",
                severidad: severidad || "BAJA",
                prioridad: prioridad || "BAJA",
                razon: razon || "SIN_DATOS",
                fecha_reporte: fecha_reporte || new Date(),
                fecha_resolucion: fecha_resolucion || null,
                id_caso_prueba: casoPrueba.id  
            });

            res.status(201).json({
                msg: 'Error registrado exitosamente',
                code: 200,
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