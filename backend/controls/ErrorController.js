'use strict';
const { validationResult } = require('express-validator');
var models = require('../models/');
const error = models.error;

class ErrorController {

    async listar(req, res) {
        try {
            const errores = await error.findAll({
                attributes: ['id', 'external_id', 'funcionalidad', 'titulo', 
                   'severidad', 'estado','prioridad','anexo_foto',
                    'resultado_obtenido', 'fecha_reporte', 'fecha_resolucion'
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
                attributes: ['id', 'external_id', 'funcionalidad', 'titulo', 'pasos_repetir',
                   'severidad', 'estado','prioridad','anexo_foto',
                    'resultado_obtenido', 'fecha_reporte', 'fecha_resolucion'
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

        try {
            const errorEncontrado = await error.findOne({
                where: { external_id: external_id },
                attributes: ['id', 'external_id', 'funcionalidad', 'titulo', 'pasos_repetir',
                   'severidad', 'estado','prioridad','anexo_foto',
                    'resultado_obtenido', 'fecha_reporte'
                ]
            });

            if (!errorEncontrado) {
                return res.status(404).json({
                    msg: 'Error no encontrado',
                    code: 404
                });
            }
            let imagenAnterior = errorEncontrado.foto;
    
            if (req.file) {
                if (imagenAnterior) {
                    const imagenAnteriorPath = path.join(__dirname, '../public/images/errors/', imagenAnterior);
                    fs.unlink(imagenAnteriorPath, (err) => {
                        if (err) {
                            console.log('Error al eliminar la imagen anterior:', err);
                        } else {
                            console.log("eliminada: " + imagenAnterior);
                        }
                    });
                }
                imagenAnterior = req.file.filename; 
            }else{
                imagenAnterior = errorEncontrado.foto; 
            }

            const [updated] = await error.update({
                funcionalidad: req.body.funcionalidad || errorEncontrado.funcionalidad,
                titulo: req.body.titulo || errorEncontrado.titulo,
                severidad: req.body.severidad || errorEncontrado.severidad,
                prioridad: req.body.prioridad || errorEncontrado.prioridad,
                pasos_repetir: req.body.pasos_repetir || errorEncontrado.pasos_repetir,
                estado: req.body.estado || errorEncontrado.estado,
                anexo_foto: imagenAnterior,
                resultado_obtenido: req.body.resultado_obtenido || errorEncontrado.resultado_obtenido,
            }, {
                where: { external_id: external_id }
            });

            if (!updated) {
                return res.status(404).json({
                    msg: 'No se pudo actualizar el error',
                    code: 404
                });
            }

            return res.json({
                msg: 'Error actualizado correctamente',
                code: 200,
                info: updated
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
                    'id', 'external_id', 'funcionalidad', 'titulo', 
                    'severidad', 'estado','prioridad','anexo_foto',
                    'resultado_obtenido', 'fecha_reporte', 'fecha_resolucion', 'pasos_repetir'
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
    
        if (!req.body.external_caso_prueba) {
            return res.status(400).json({
                msg: 'El campo external_caso_prueba es obligatorio',
                code: 400
            });
        }
        try {
            const casoPrueba = await models.caso_prueba.findOne({
                where: { external_id: req.body.external_caso_prueba }
            });

            if (!casoPrueba) {
                return res.status(404).json({
                    msg: 'Caso de prueba no encontrado',
                    code: 404
                });
            }
            
            const tituloExistente = await models.error.findOne({
                where: {
                    titulo: req.body.titulo,
                    id_caso_prueba: casoPrueba.id
                }
            });
    
            if (tituloExistente) {
                return res.status(400).json({
                    msg: 'Ya existe un error con el mismo título para este caso de prueba',
                    code: 400,
                });
            }

            casoPrueba.estado = 'FALLIDO';
            await casoPrueba.save();
    
            const nuevoError = await error.create({
                funcionalidad: req.body.funcionalidad || "SIN_DATOS",
                titulo: req.body.titulo || "SIN_DATOS",
                severidad: req.body.severidad ,
                prioridad: req.body.prioridad ,
                pasos_repetir: req.body.pasos_repetir,
                anexo_foto: req.file ? req.file.filename : 'SIN_ANEXO.png',
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