'use strict';

var models = require('../models/');
var peticion = models.peticion;

class PeticionController {
    async listarPeticiones(req, res) {
        try {
            if (!req.params.tipo) {
                res.status(400);
                res.json({ msg: 'Se requiere un tipo de peticion', code: 400 });
            }
            var listar = await peticion.findAll({
                where: { estado: 'ES', tipo: req.params.tipo },
                include: {
                    model: models.cuenta,foreignKey: 'id_cuenta', attributes: ['correo', 'external_id'], 
                    include: { model: models.entidad, foreignKey: 'id_entidad', attributes: ['nombres', 'apellidos'] }
                },
                attributes: ['peticion', 'external_id', 'createdAt']
            });
            res.status(200);
            res.json({ msg: 'OK!', code: 200, info: listar });
        } catch (error) {
            res.status(500);
            res.json({ msg: 'Algo salio mal en listar peticiones', code: 500, info: error });
        }
    }

    async aceptarRechazar(req, res) {
        try {
            var peticionNew = await peticion.findOne({ where: { external_id: req.params.external } });
            if (peticionNew === null) {
                res.status(400);
                res.json({ msg: 'Peticion no encontarda', code: 400 });
            } else {
                var cuentaAc = await models.cuenta.findOne({ where: { id: peticionNew.id_cuenta } });
                var person = await models.entidad.findOne({where: {id: cuentaAc.id_entidad}});
                if (req.params.estado == '1') {
                    peticionNew.estado = 'AC';
                    cuentaAc.estado = 'ACEPTADO';
                    peticionNew.id_aceptador_rechazador = req.params.id_rechazador;
                    person.estado=1;
                } else {
                    peticionNew.estado = 'RE';
                    cuentaAc.estado = 'DENEGADO';
                    peticionNew.motivo_rechazo = req.params.motivo_rechazo;
                    peticionNew.id_rechazador_aceptador = req.params.id_rechazador;
                    person.estado=0;
                }
                var uuid = require('uuid');
                peticionNew.external_id = uuid.v4();
                cuentaAc.external_id = uuid.v4();
                person.external_id = uuid.v4();
                var result = await peticionNew.save();
                var resultCuenta = await cuentaAc.save();
                var resultPerson = await person.save();
                if (result === null || resultCuenta === null || resultPerson === null) {
                    res.status(400);
                    res.json({
                        msg: "No se guardado la informacion de la peticion",
                        code: 400
                    });
                } else {
                    res.status(200);
                    res.json({
                        msg: ((req.params.estado === '1') ? 'Se ha aceptado la petición' : 'Se ha rechazado la petición'),
                        code: 200, info: resultCuenta.external_id
                    });
                }
            }

        } catch (error) {
            res.status(500);
            res.json({ msg: 'Algo salio mal en peticiones', code: 500, info: error });
        }
    }

}

module.exports = PeticionController;
