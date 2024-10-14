var models = require('../models')
var cuenta = models.cuenta;

const { validationResult } = require('express-validator');

const bcrypt = require('bcrypt');
const saltRounds = 8;

let jwt = require('jsonwebtoken');

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
}
module.exports = CuentaController;var models = require('../models')
var cuenta = models.cuenta;

const { validationResult } = require('express-validator');

const bcrypt = require('bcrypt');
const saltRounds = 8;

let jwt = require('jsonwebtoken');

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
            if (!req.params.correo) {
                return res.status(400).json({
                    msg: "FALTA EL CORREO EN LA SOLICITUD",
                    code: 400
                });
            }
            console.log(req.params.correo);
            var cuentaEncontrada = await cuenta.findOne({ where: {correo: req.params.correo  }, include: [{model: models.entidad,as: "entidad"  }]  });
            if (cuentaEncontrada === null) {
                return res.status(404).json({
                    msg: "CUENTA NO ENCONTRADA",
                    code: 404
                });
            }
            return res.status(200).json({
                msg: "Cuenta encontrada",
                info: {
                    correo: cuentaEncontrada.correo,
                    nombres: cuentaEncontrada.entidad.nombres,
                    apellidos: cuentaEncontrada.entidad.apellidos,
                    id: cuentaEncontrada.entidad.id
                },
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