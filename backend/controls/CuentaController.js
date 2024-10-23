var models = require('../models')
var cuenta = models.cuenta;

const { validationResult } = require('express-validator');

const bcrypt = require('bcrypt');
const saltRounds = 8;

let jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
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

            var esClaveValida = function (clave, claveUser) {
                return bcrypt.compareSync(claveUser, clave);
            }
            
            if (!login.estado) {
                return res.status(400).json({
                    msg: "CUENTA DESACTIVADA",
                    code: 400
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
            console.log(error);
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
                ]
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
            console.log(error);
            return res.status(500).json({
                msg: "Error en el servidor",
                code: 500
            });
        }
    }    
    

}
module.exports = CuentaController;