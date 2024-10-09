var express = require('express');
var router = express.Router();
let jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const uuid = require('uuid');

const { body, validationResult,isDate } = require('express-validator');
const CasoPruebaController=require('../controls/CasoPruebaController');
var casoPruebaController=new CasoPruebaController();
const ProyectoController = require('../controls/ProyectoController');
const proyectoController = new ProyectoController();

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

router.get('/proyecto/listar',proyectoController.listar);
router.post('/caso/prueba/guardar', [
  body('titulo').notEmpty().withMessage('El título es requerido'),
  body('descripcion').notEmpty().withMessage('La descripción es requerida'),
  body('resultado_esperado').notEmpty().withMessage('El resultado esperado es requerido'),
], casoPruebaController.guardar);
router.post('/caso/prueba/actualizar', casoPruebaController.actualizar);
router.get('/caso/prueba/listar',casoPruebaController.listar);
router.get('/caso/prueba/obtener',casoPruebaController.obtener);
router.put('/caso/prueba/cambiar/estado',casoPruebaController.cambiar_estado);
router.get('/caso/prueba/eliminar',casoPruebaController.cambiar_estado_obsoleto);

module.exports = router;  