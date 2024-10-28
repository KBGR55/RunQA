'use strict';

var models = require('../models/');
var rol_proyecto = models.rol_proyecto;
const uuid = require('uuid');

class RolEntidadController {

    async listar(req, res) {
        try {
            const id_entidad = req.query.id_entidad;

            if (!id_entidad) {
                return res.status(404).json({ msg: "No se encontró la entidad", code: 404 });
            }

            const listar = await models.rol_entidad.findAll({
                where: { id_entidad: id_entidad },
                include: [
                    {
                        model: models.entidad,
                        where: { estado: true },
                        attributes: ['id', 'external_id', 'nombres', 'apellidos', 'fecha_nacimiento', 'telefono', 'estado']
                    },
                    {
                        model: models.rol,
                        where: { estado: true },
                        attributes: ['external_id', 'nombre', 'estado']
                    }
                ]
            });

            if (listar.length === 0) {
                return res.status(404).json({ msg: "No se encontraron roles para la entidad proporcionada", code: 404 });
            }

            res.json({ msg: 'OK!', code: 200, info: listar });
        } catch (error) {
            res.status(500).json({ msg: 'Se produjo un error en listar roles', code: 500, info: error.message });
        }
    }

    async asignarLideres(req, res) {
        let transaction;
        try {
            transaction = await models.sequelize.transaction();
    
            const { lideres } = req.body;
    
            if (!lideres) {
                return res.status(400).json({ msg: "Faltan datos requeridos", code: 400 });
            }
            if (!Array.isArray(lideres) || lideres.length === 0) {
                return res.status(400).json({ msg: "No se pueden asignar lideres vacíos", code: 400 });
            }
    
            let asignaciones = [];
            for (const lider of lideres) {
                const entidad = await models.entidad.findOne({
                    where: { id: lider.id_entidad, estado: 1 }
                });
                if (!entidad) {
                    return res.status(404).json({ msg: `Entidad con ID ${lider.id_entidad} no encontrada o inactiva`, code: 404 });
                }
    
                const rolExistente = await models.rol_entidad.findOne({
                    where: { id_entidad: lider.id_entidad, id_rol: 3 } //CAMBIAR SEGUN EL VALOR DEL ID DEL ROL DE LIDER DE CALIDAD
                });
                if (rolExistente) {
                    return res.status(409).json({ msg: 'Ya tiene asignado el rol de LÍDER DE CALIDAD', code: 409 });
                }
    
                const nuevaAsignacion = await models.rol_entidad.create({
                    id_entidad: lider.id_entidad,
                    id_rol: 3, //CAMBIAR SEGUN EL VALOR DEL ID DEL ROL DE LIDER DE CALIDAD
                    external_id: uuid.v4()
                }, { transaction });
                asignaciones.push(nuevaAsignacion);
            }
    
            await transaction.commit();
    
            res.json({
                msg: asignaciones.length > 1 ? "Líderes asignados correctamente" : "Líder asignado correctamente",
                code: 200,
                info: asignaciones
            });
        } catch (error) {
            if (transaction) {
                await transaction.rollback();
            }
            console.error("Error al asignar lideres:", error);
            res.status(500).json({ msg: error.message || "Error interno del servicio", code: 500 });
        }
    }
    


}

module.exports = RolEntidadController;