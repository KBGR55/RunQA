var express = require('express');
var router = express.Router();
let jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const uuid = require('uuid');

const RolController = require('../controls/RolController');
var rolController = new RolController();
const EntidadController = require('../controls/EntidadController');
var entidadController = new EntidadController();
const CuentaController = require('../controls/CuentaController');
var cuentaController = new CuentaController();

const { body, validationResult,isDate } = require('express-validator');
const CasoPruebaController=require('../controls/CasoPruebaController');
var casoPruebaController=new CasoPruebaController();
const ProyectoController = require('../controls/ProyectoController');
const proyectoController = new ProyectoController();const RolController = require('../controls/RolController');
var rolController = new RolController();
const ProyectoController = require('../controls/ProyectoController');
var proyectoController = new  ProyectoController();
const CuentaController = require('../controls/CuentaController');
var cuentaController = new CuentaController();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

var auth = function middleware(req, res, next) {
  const token = req.headers['x-api-token'];
  if (token) {
    require('dotenv').config();
    const llave = process.env.KEY;
    console.log(llave)
    jwt.verify(token, llave, async (err, decoded) => {
      if (err) {
        res.status(401);
        res.json({
          msg: "Token no valido",
          code: 401
        });
      } else {
        var models = require('../models');
        var cuenta = models.cuenta;
        req.decoded = decoded;
        let aux = await cuenta.findOne({ 
          where: { 
            external_id: req.decoded.external 
          } 
        })
        if (aux === null) {
          res.status(401);
          res.json({
            msg: "Token no valido o expirado",
            code: 401
          });
        } else {
          next();
        }
      }
    });
  } else {
    res.status(401);
    res.json({
      msg: "No existe token",
      code: 401
    });
  }

};

module.exports = router;  