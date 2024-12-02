'use strict';
const { body, validationResult } = require('express-validator');
var models = require('../models/');
const { where, Op } = require('sequelize');
const caso_prueba = models.caso_prueba;
const proyecto = models.proyecto;

class CasoPruebaController {

    async lista_general(req, res) {
        try {
            const listar = await caso_prueba.findAll({
                attributes: [
                    'nombre', 'estado', 'external_id', 'descripcion','estadoAsignacion',
                    'pasos', 'resultado_esperado', 'resultado_obtenido',
                    'clasificacion', 'tipo_prueba', 'precondiciones',
                    'fecha_disenio', 'fecha_ejecucion_prueba', 'datos_entrada'
                ]
            });
            res.json({ msg: 'OK!', code: 200, info: listar });
        } catch (error) {
            res.status(500).json({ msg: 'Error al listar casos de prueba', code: 500, error: error.message });
        }
    }
    async listar(req, res) {
        try {
            const id_proyecto = req.query.id_proyecto;
            const id_entidad = req.params.id_entidad;
    
            if (!id_proyecto || !id_entidad) {
                return res.status(400).json({ msg: "Faltan datos", code: 400 });
            }
    
            // Obtener los roles de la entidad dentro del proyecto
            const rolesEntidad = await models.rol_proyecto.findAll({
                where: { id_proyecto },
                include: {
                    model: models.rol_entidad,
                    as: 'rol_entidad', // Especifica el alias aquí
                    where: { id_entidad },
                    include: {
                        model: models.rol,
                        attributes: ['nombre'], // Obtener el nombre del rol
                    }
                }
            });
    
            // Extraer los nombres de los roles
            const nombresRoles = rolesEntidad.map(item => item.rol_entidad.rol.nombre);
    console.log('nombresRoles:', nombresRoles);
            // Verificar si tiene roles de calidad
            const rolesCalidad = ['LIDER DE CALIDAD', 'ANALISTA DE PRUEBAS'];
            const tieneRolCalidad = nombresRoles.some(rol => rolesCalidad.includes(rol));
            if (tieneRolCalidad) {
                // Retornar todos los casos de prueba
                const listar = await caso_prueba.findAll({
                    where: { id_proyecto },
                    attributes: [
                        'nombre', 'estado', 'external_id', 'descripcion', 'estadoAsignacion',
                        'pasos', 'resultado_esperado', 'resultado_obtenido',
                        'clasificacion', 'tipo_prueba', 'precondiciones',
                        'fecha_disenio', 'fecha_ejecucion_prueba', 'datos_entrada'
                    ]
                });
    
                return res.json({ msg: 'OK!', code: 200, info: listar });
            } else {
                // Retornar casos de prueba específicos según el contrato
                const listar = await caso_prueba.findAll({
                    where: { id_proyecto },
                    include: {
                        model: models.contrato,
                        as: 'contrato',
                        required: true,
                        where: {
                            [Op.or]: [
                                { id_rol_proyecto_asignado: rolesEntidad.map(rp => rp.id) },
                                { id_rol_proyecto_responsable: rolesEntidad.map(rp => rp.id) }
                            ]
                        }
                    },
                    attributes: [
                        'nombre', 'estado', 'external_id', 'descripcion', 'estadoAsignacion',
                        'pasos', 'resultado_esperado', 'resultado_obtenido',
                        'clasificacion', 'tipo_prueba', 'precondiciones',
                        'fecha_disenio', 'fecha_ejecucion_prueba', 'datos_entrada'
                    ]
                });
    
                return res.json({ msg: 'OK!', code: 200, info: listar });
            }
    
        } catch (error) {
            return res.status(500).json({ msg: 'Error al listar casos de prueba', code: 500, error: error.message });
        }
    }
    

    async obtener(req, res) {
        const external_id = req.query.external_id;
        if (!external_id) {
            return res.status(400).json({ msg: "Falta el 'external_id'", code: 400 });
        }
        try {
            const caso = await caso_prueba.findOne({
                where: { external_id: external_id },
                attributes: [
                    'nombre', 'estado', 'external_id', 'descripcion','estadoAsignacion',
                    'pasos', 'resultado_esperado', 'resultado_obtenido',
                    'clasificacion', 'tipo_prueba', 'precondiciones',
                    'fecha_disenio', 'fecha_ejecucion_prueba','id_proyecto', 'datos_entrada'
                ]
            });
    
            if (!caso) {
                return res.status(404).json({ msg: 'Caso de prueba no encontrado', code: 404 });
            }
            res.json({ msg: 'OK!', code: 200, info: caso });
        } catch (error) {
            console.error('Database error:', error);
            res.status(500).json({ msg: 'Error al obtener caso de prueba', code: 500, error: error.message });
        }
    }    

    async guardar(req, res) {
        let errors = validationResult(req);
        if (errors.isEmpty()) {
            try {
                console.log('8888', req.body);
                
                const external_proyecto = req.body.external_proyecto;
                if (!external_proyecto) {
                    return res.status(400).json({ msg: "Falta proyecto", code: 400 });
                }
                const proyecto = await models.proyecto.findOne({ where: { external_id: external_proyecto } });
                if (!proyecto) {
                    return res.status(404).json({ msg: "No existe el proyecto con el ID proporcionado", code: 404 });
                }
    
                const nuevoCaso = await caso_prueba.create({
                    nombre: req.body.nombre,
                    descripcion: req.body.descripcion,
                    pasos: req.body.pasos,
                    resultado_esperado: req.body.resultado_esperado,
                    clasificacion: req.body.clasificacion,
                    tipo_prueba: req.body.tipo_prueba,
                    precondiciones: req.body.precondiciones,
                    datos_entrada: req.body.datos_entrada,
                    id_proyecto: proyecto.id
                });
    
                res.json({ msg: "Caso de prueba registrado con éxito", code: 200, info: nuevoCaso.external_id });
            } catch (error) {
                console.error("Error al guardar el caso de prueba:", error);
                res.status(500).json({ msg: 'Error al guardar el caso de prueba', code: 500, error: error.message });
            }
        } else {
            console.log("Errores de validación:", errors.array());
            res.status(400).json({ msg: "Datos faltantes o inválidos", code: 400, errors: errors.array() });
        }
    }

    async actualizar(req, res) {
        let errors = validationResult(req);
        if (errors.isEmpty()) {
            try {
                const external_id = req.body.external_id;

                const caso = await caso_prueba.findOne({ where: { external_id: external_id } });
                
                if (!caso) {
                    return res.status(404).json({ msg: "Caso de prueba no encontrado", code: 404 });
                }
    
                caso.nombre = req.body.nombre|| caso.nombre;
                caso.descripcion = req.body.descripcion || caso.descripcion;
                caso.pasos = req.body.pasos || caso.pasos;
                caso.resultado_esperado = req.body.resultado_esperado || caso.resultado_esperado;
                caso.clasificacion = req.body.clasificacion || caso.clasificacion;
                caso.tipo_prueba = req.body.tipo_prueba || caso.tipo_prueba;
                caso.precondiciones = req.body.precondiciones || caso.precondiciones;
                caso.fecha_ejecucion_prueba = req.body.fecha_ejecucion_prueba || caso.fecha_ejecucion_prueba;
                caso.datos_entrada = req.body.datos_entrada || caso.datos_entrada;
    
                await caso.save();
    
                res.json({ msg: "Caso de prueba actualizado con éxito", code: 200, info: caso });
            } catch (error) {
                res.status(500).json({ msg: 'Error al actualizar el caso de prueba', code: 500, error: error.message });
            }
        } else {
            console.log("Errores de validación:", errors.array());
            res.status(400).json({ msg: "Datos faltantes o inválidos", code: 400, errors: errors.array() });
        }
    }    

    async cambiar_estado(req, res) {
        try {
            const caso = await caso_prueba.findOne({ where: { external_id: req.body.external_id } });
            if (!caso) {
                return res.status(404).json({ msg: "No existen registros del caso de prueba", code: 404 });
            }

            caso.estado = req.body.estado;
            await caso.save();
            res.json({ msg: "Estado modificado correctamente", code: 200 });
        } catch (error) {
            res.status(500).json({ msg: 'Error al cambiar el estado', code: 500, error: error.message });
        }
    }
    async cambiar_estado_obsoleto(req, res) {
        try {
            console.log(req.query.external_id);
            const external_id = req.query.external_id;
            if (!external_id) {
                return res.status(400).json({ msg: "Falta el 'external_id'", code: 400 });
            }
            const caso = await caso_prueba.findOne({ where: { external_id: external_id } });
            if (!caso) {
                return res.status(404).json({ msg: "Caso de prueba no encontrado", code: 404 });
            }
            caso.estado = 'OBSOLETO'; 
            await caso.save();
            res.json({ msg: "Caso de prueba marcado como obsoleto correctamente", code: 200 });
        } catch (error) {
            res.status(500).json({ msg: 'Error al marcar el caso de prueba como obsoleto', code: 500, error: error.message });
        }
    }

    /*SEGUNDO SPRINT*/
    async obtenerCasosProyecto(req, res) {
        
        const proyecto_idExternal = req.params.external_id;
        if (!proyecto_idExternal) {
            return res.status(400).json({ msg: "Falta datos de búsqueda", code: 400 });
        }

        let proyectoAux = await proyecto.findOne({ where: { external_id: proyecto_idExternal} });            

        try {
            const caso = await caso_prueba.findAll({
                where: { id_proyecto: proyectoAux.id, estado: "DISEÑADO" , estadoAsignacion: "NO ASIGNADO"},
                attributes: [
                    'nombre', 'estado', 'external_id', 'descripcion', 
                    'pasos', 'resultado_esperado',
                    'clasificacion', 'tipo_prueba', 'precondiciones',
                    'fecha_disenio', 'fecha_ejecucion_prueba', 'datos_entrada'
                ]
            });
    
            if (!caso) {
                return res.status(404).json({ msg: 'Caso de prueba no encontrado', code: 404 });
            }

            res.json({ msg: 'OK!', code: 200, info: caso });
        } catch (error) {
            console.error('Database error:', error);
            res.status(500).json({ msg: 'Error al obtener caso de prueba', code: 500, error: error.message });
        }
    }

    async ejecutarCasoPrueba(req, res) {

        try {
            const caso = await caso_prueba.findOne({ where: { external_id: req.params.external_id } });
            if (!caso) {
                return res.status(404).json({ msg: "Caso de prueba no encontrado", code: 404 });
            }
            caso.estado = "EXITOSO";
            await caso.save();
            res.json({ msg: "Caso de prueba ejecutado correctamente", code: 200 });
        } catch (error) {
            res.status(500).json({ msg: 'Error al ejecutar el caso de prueba', code: 500, error: error.message });
        }
    }
    
}

module.exports = CasoPruebaController;