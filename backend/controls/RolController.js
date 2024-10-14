'use strict';

var models = require('../models/');
var rol = models.rol;

class RolController {
    async listar(req, res) {
        try {
            var listar = await rol.findAll({
                attributes: ['nombre', 'external_id','id', 'estado']
            });
            res.json({ msg: 'OK!', code: 200, info: listar });
        } catch (error) {
            res.json({ msg: 'Se produjo un error en listar roles', code: 200, info: error });
        }
    }

    async guardar(req, res) {
        try {
            const data = {
                "nombre": req.body.nombre,
            }
            let transaction = await models.sequelize.transaction();
            await rol.create(data, transaction);
            await transaction.commit();
            res.json({
                msg: "SE HA REGISTRADO EL ROL CON ÉXTIO",
                code: 200
            });

        } catch (error) {
            if (transaction) await transaction.rollback();
            if (error.errors && error.errors[0].message) {
                res.json({ msg: error.errors[0].message, code: 200 });
            } else {
                res.json({ msg: error.message, code: 200 });
            }
        }
    }
}

module.exports = RolController;