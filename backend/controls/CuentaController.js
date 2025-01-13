var models = require('../models')
var cuenta = models.cuenta;

const { validationResult } = require('express-validator');

const bcrypt = require('bcrypt');
const saltRounds = 8;

let jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const e = require('express');

const esClaveValida = function (clave, claveUser) {
    return bcrypt.compareSync(claveUser, clave);
}
class CuentaController {

    async sesion(req, res) {

        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    msg: "FALTAN DATOS",
                    code: 400,
                    errors: errors.array()
                });
            }
            var login = await cuenta.findOne({
                where: {
                    correo: req.body.correo
                },
                include: [{
                    model: models.entidad,
                    as: "entidad"
                }]
            });

            if (login === null)
                return res.status(400).json({
                    msg: "CUENTA NO ENCONTRADA",
                    code: 400
                })

            const estadoPersona = await models.entidad.findOne({
                where: {
                    id: login.id_entidad
                },   attributes: ['estado']
            });

            if (!estadoPersona.estado) {
                return res.status(400).json({
                    msg: "CUENTA DESACTIVADA",
                    code: 400
                });
            } else if (login.estado === "ESPERA") {
                res.json({
                    msg: "SU PETICIÓN SE ENCUENTRA EN ESPERA",
                    code: 201
                });
            } else if (login.estado === "DENEGADO") {
                res.json({
                    msg: "SU PETICIÓN SE HA DENEGADO",
                    code: 201
                });
            }
            if (esClaveValida(login.clave, req.body.clave)) {
                const tokenData = {
                    external: login.external_id,
                    email: login.correo,
                    check: true
                };

                require('dotenv').config();
                const llave = process.env.KEY;
                const token = jwt.sign(
                    tokenData,
                    llave,
                    {
                        expiresIn: '12h'
                    });
                return res.status(200).json({
                    msg: "Bievenido " + login.entidad.nombres,
                    info: {
                        token: token,
                        user: {
                            correo: login.correo,
                            external_cuenta: login.external_id,
                            nombres: login.entidad.nombres,
                            apellidos: login.entidad.apellidos,
                            user: login.entidad,
                        },
                    },
                    code: 200
                })
            } else {
                return res.status(401).json({
                    msg: "CLAVE INCORRECTA",
                    code: 401
                })
            }

        } catch (error) {
            if (error.errors && error.errors[0].message) {
                return res.status(400).json({
                    msg: error.errors[0].message,
                    code: 400
                });
            } else {
                return res.status(400).json({
                    msg: "Ha ocurrido un error en el servidor",
                    code: 400
                });
            }
        }
    }

    async obtenerCuenta(req, res) {
        try {
            if (!req.params.nombreCompleto) {
                return res.status(400).json({
                    msg: "FALTA EL NOMBRE COMPLETO O PARCIAL EN LA SOLICITUD",
                    code: 400
                });
            }
            const nombreCompleto = req.params.nombreCompleto.trim();
            const condicionesBusqueda = {
                [Op.or]: [
                    {
                        nombres: {
                            [Op.like]: `%${nombreCompleto}%`
                        }
                    },
                    {
                        apellidos: {
                            [Op.like]: `%${nombreCompleto}%`
                        }
                    }
                ],
                estado: true
            };
            var cuentasEncontradas = await models.entidad.findAll({
                where: condicionesBusqueda,
                limit: 10 // Limitar los resultados a 10
            });

            if (cuentasEncontradas.length === 0) {
                return res.status(404).json({
                    msg: "NO SE ENCONTRARON USUARIOS",
                    code: 404
                });
            }
            const cuentasInfo = cuentasEncontradas.map(entidad => ({
                nombres: entidad.nombres,
                apellidos: entidad.apellidos,
                id: entidad.id,
                foto: entidad.foto
            }));

            return res.status(200).json({
                msg: "Usuarios Encontrados",
                info: cuentasInfo,
                code: 200
            });
        } catch (error) {
            return res.status(500).json({
                msg: "Error en el servidor",
                code: 500
            });
        }
    }

    async cambioClave(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    msg: "FALTAN DATOS",
                    code: 400,
                    errors: errors.array()
                });
            }
            const id_cuenta = req.params.external_id;
            const cuenta = await models.cuenta.findOne({ where: { external_id: id_cuenta } });

            if (!cuenta) {
                return res.status(404).json({
                    msg: "CUENTA NO ENCONTRADA",
                    code: 404
                });
            }
            const salt = bcrypt.genSaltSync(saltRounds);
            if (esClaveValida(cuenta.clave, req.body.clave_vieja)) {
                const claveHash_nueva = bcrypt.hashSync(req.body.clave_nueva, salt);
                cuenta.clave = claveHash_nueva;
                const cuantaActualizada = await cuenta.save();
                if (!cuantaActualizada) {
                    return res.status(400).json({ msg: "NO SE HAN MODIFICADO SUS DATOS, VUELVA A INTENTAR", code: 400 });
                } else {
                    return res.status(200).json({ msg: "CLAVE MODIFICADA CON ÉXITO", code: 200 });
                }
            } else {
                return res.status(401).json({
                    msg: "CLAVE INCORRECTA",
                    code: 401
                });
            }
        } catch (error) {
           
            return res.status(500).json({
                msg: "Error en el servidor",
                code: 500
            });
        }
    }
    async cambioClaveSoloNueva(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    msg: "FALTAN DATOS",
                    code: 400,
                    errors: errors.array()
                });
            }
    
            const id_cuenta = req.params.external_id;
            const cuenta = await models.cuenta.findOne({ where: { external_id: id_cuenta } });
    
            if (!cuenta) {
                return res.status(404).json({
                    msg: "CUENTA NO ENCONTRADA",
                    code: 404
                });
            }
    
            const salt = bcrypt.genSaltSync(saltRounds);
            const claveHash_nueva = bcrypt.hashSync(req.body.clave_nueva, salt);
    
            cuenta.clave = claveHash_nueva;
            const cuentaActualizada = await cuenta.save();
    
            if (!cuentaActualizada) {
                return res.status(400).json({ 
                    msg: "NO SE HAN MODIFICADO SUS DATOS, VUELVA A INTENTAR", 
                    code: 400 
                });
            } else {
                return res.status(200).json({ 
                    msg: "CLAVE MODIFICADA CON ÉXITO", 
                    code: 200 
                });
            }
        } catch (error) {
           
            return res.status(500).json({
                msg: "Error en el servidor",
                code: 500
            });
        }
    }
    

    async tokenCambioClave(req, res) {
        if (!req.params.external_id) {
            return res.status(400).json({
                msg: "FALTAN DATOS",
                code: 400
            });
        } else {
            const cuenta = await models.cuenta.findOne({ where: { external_id: req.params.external_id } });
            if (cuenta) {
                const tokenData = {
                    external: cuenta.external_id,
                    email: cuenta.correo,
                    check: true
                };
    
                require('dotenv').config();
                const llave = process.env.KEY;
                const token = jwt.sign(
                    tokenData,
                    llave,
                    {
                        expiresIn: '10m'
                    });
                return res.status(200).json({
                    msg: "Token generado",
                    info: {
                        token: token
                    },
                    code: 200
                })
            }else{
                return res.status(400).json({
                    msg: "CUENTA NO ENCONTRADA",
                    code: 400
                });
            }
        }
    }

    async validarCambioClave(req, res) {
        const transaction = await models.sequelize.transaction();
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    msg: "FALTAN DATOS",
                    code: 400,
                    errors: errors.array()
                });
            }
            const cuenta = await models.cuenta.findOne({ where: { correo: req.body.correo, estado: "ACEPTADO" } });
            if (!cuenta) {
                return res.status(200).json({
                    code: 200
                });
            } else {
                var listar = await models.peticion.findOne({ where: { estado: 'ES', tipo: "CC", id_cuenta: cuenta.id } });
                if (listar) {
                    return res.status(200).json({
                        code: 200, msg: "Ya existe una petición en espera"
                    });
                } else {
                const peticion = {
                    peticion: "Cambio de Clave",
                    tipo: "CC",
                    id_cuenta: cuenta.id
                };
                await models.peticion.create(peticion), { transaction };
                await transaction.commit();
                res.json({ code: 200 });}
            }

        } catch (error) {
           
            return res.status(500).json({
                msg: "Error en el servidor",
                code: 500
            });
        }
    }


}
module.exports = CuentaController;