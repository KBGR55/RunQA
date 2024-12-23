'use strict';
const { body, validationResult, check } = require('express-validator');
const models = require('../models');
var entidad = models.entidad;
const bcrypt = require('bcrypt');
const saltRounds = 8;
const path = require('path');
const uuid = require('uuid');
const fs = require('fs');
const { where } = require('sequelize');

class EntidadController {

    async listar(req, res) {
        try {
            var listar = await entidad.findAll({
                 include: [
                    {
                        model: models.cuenta, 
                        as: 'cuenta', 
                        attributes: ['correo','estado'],
                    },
                    {
                        model: models.rol_entidad,
                        as: 'rol_entidad',
                        attributes: ["id_rol"], // No selecciona atributos, excluyéndolo efectivamente
                    }
                ],
            });
            res.json({ msg: 'OK!', code: 200, info: listar });
        } catch (error) {
            res.status(500);
            res.json({ msg: 'Error al listar personas: ' + error.message, code: 500, info: error });
        }
    }
    
    
    async listarActivos(req, res) {
        try {
            var listar = await entidad.findAll({
                where:  { estado: 1 },
                attributes: ['id', 'apellidos', 'nombres', 'external_id', 'foto', 'telefono', 'fecha_nacimiento', 'estado','horasDisponibles'],
                include: [
                    {
                        model: models.cuenta, 
                        as: 'cuenta', 
                        attributes: ['correo'],
                    },
                ],
            });
            
            res.json({ msg: 'OK!', code: 200, info: listar });
        } catch (error) {
            res.status(500);
            res.json({ msg: 'Error al listar personas: ' + error.message, code: 500, info: error });
        }
    }
    

    async obtener(req, res) {
        const external = req.params.external;
        var listar = await entidad.findOne({
            where: {
                external_id: external
            },   attributes: ['id', 'apellidos', 'nombres', 'external_id', 'foto', 'telefono', 'fecha_nacimiento', 'estado','horasDisponibles'],
            include: [  {
                    model: models.cuenta, 
                    as: 'cuenta', 
                },
            ],
        });


        if (listar=== null) {
            return res.status(400).json({
                msg: 'NO EXISTE EL REGISTRO',
                code: 400,
                info: listar
            });
        }
       
        return res.status(200).json({
            msg: 'OK!',
            code: 200,
            info:  {
                id: listar.id,
                nombres: listar.nombres,
                apellidos: listar.apellidos,
                fecha_nacimiento: listar.fecha_nacimiento,
                external_id: listar.external_id,
                foto: listar.foto,
                telefono: listar.telefono,
                estado: listar.estado,
                horasDisponibles: listar.horasDisponibles,
               correo:listar.cuenta.correo,
               estadoCuenta:listar.cuenta.estado
            }
        });
    }


    async guardar(req, res) {
        const transaction = await models.sequelize.transaction();
        const saltRounds = 10;
    
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    msg: "DATOS INCOMPLETOS",
                    code: 400,
                    errors: errors.array()
                });
            }
    
            if (!req.body.clave) {
                return res.status(400).json({
                    msg: "FALTA INGRESAR LA CLAVE",
                    code: 400
                });
            }
    
            const claveHash = (clave) => {
                if (!clave) {
                    throw new Error("La clave es obligatoria");
                }
                const salt = bcrypt.genSaltSync(saltRounds);
                return bcrypt.hashSync(clave, salt);
            };
    
            const fotoFilename = req.file ? req.file.filename : 'USUARIO_ICONO.png';
    
            const data = {
                nombres: req.body.nombres,
                apellidos: req.body.apellidos,
                fecha_nacimiento: req.body.fecha_nacimiento,
                telefono: req.body.telefono,
                horasDisponibles: req.body.horasDisponibles,
                estado: false,
                foto: fotoFilename,
                cuenta: {
                    correo: req.body.correo,
                    clave: claveHash(req.body.clave),
                    peticion: {
                        peticion:req.body.peticion
                    }

                },
                external_id: uuid.v4()
            };
            
            const entidad = await models.entidad.create(data, {
                include: [{ model: models.cuenta, as: "cuenta", include: { model: models.peticion, as: 'peticion'}  }],
                transaction
            });
            await transaction.commit();
    
            return res.status(200).json({
                msg: "Se ha registrado su petición con éxito",
                code: 200
            });
    
        } catch (error) {
            if (req.file && req.file.path) {
                fs.unlinkSync(path.join(__dirname, '../public/images/users', req.file.filename));
            }
    
            if (transaction && !transaction.finished) {
                await transaction.rollback();
            }

            if (error.name === 'SequelizeUniqueConstraintError' && error.errors[0].path === 'telefono') {
                return res.status(400).json({
                    msg: "ESTE NÚMERO DE TELÉFONO SE ENCUENTRA REGISTRADO EN EL SISTEMA",
                    code: 400
                });
            }
    
            if (error.name === 'SequelizeUniqueConstraintError' && error.errors[0].path === 'correo') {
                return res.status(400).json({
                    msg: "ESTE CORREO SE ENCUENTRA REGISTRADO EN EL SISTEMA",
                    code: 400
                });
            }
    
            return res.status(400).json({
                msg: error.message || "Ha ocurrido un error en el servidor",
                code: 400
            });
        }
    }    

    async modificar(req, res) {   
        try {

               const claveHash = (clave) => {
                if (!clave) {
                    throw new Error("La clave es obligatoria");
                }
                const salt = bcrypt.genSaltSync(saltRounds);
                return bcrypt.hashSync(clave, salt);
            };
            const entidadAux = await entidad.findOne({
                where: { external_id: req.body.external_id }
            });
    
            if (!entidadAux) {
                return res.status(400).json({ msg: "NO EXISTE EL REGISTRO", code: 400 });
            }
    
            const cuentaAux = await models.cuenta.findOne({
                where: { id_entidad: entidadAux.id }
            });
    
            if (!cuentaAux) {
                return res.status(400).json({ msg: "NO SE ENCONTRÓ LA CUENTA ASOCIADA A ESTA ENTIDAD", code: 400 });
            }
    
            let imagenAnterior = entidadAux.foto;
    
            if (req.file) {
                if (imagenAnterior) {
                    const imagenAnteriorPath = path.join(__dirname, '../public/images/users/', imagenAnterior);
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
                imagenAnterior = entidadAux.foto; 
            }
    
            entidadAux.nombres = req.body.nombres;
            entidadAux.apellidos = req.body.apellidos;
            entidadAux.estado = req.body.estado;
            entidadAux.telefono = req.body.telefono;
            entidadAux.fecha_nacimiento = req.body.fecha_nacimiento;
            entidadAux.foto = imagenAnterior; 
            entidadAux.external_id = uuid.v4();
            cuentaAux.external_id = uuid.v4();
            cuentaAux.correo=req.body.correo;
            if (req.body.clave) {
                cuentaAux.clave= claveHash(req.body.clave);
            }
            const result = await entidadAux.save();
            const cuantaActualizada =  await cuentaAux.save();
            if (!result && !cuantaActualizada) {
                return res.status(400).json({ msg: "NO SE HAN MODIFICADO SUS DATOS, VUELVA A INTENTAR", code: 400 });
            }
    
            return res.status(200).json({ msg: "SE HAN MODIFICADO SUS DATOS CON ÉXITO", code: 200 });
        } catch (error) {
            console.error("Error en el servidor:", error);
            return res.status(400).json({ msg: "Error en el servidor", error, code: 400 });
        }
    }
    
    
}
module.exports = EntidadController;