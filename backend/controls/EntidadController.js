'use strict';
const { body, validationResult, check } = require('express-validator');
const models = require('../models');
var entidad = models.entidad;
const bcrypt = require('bcrypt');
const saltRounds = 8;
const path = require('path');
const uuid = require('uuid');
const fs = require('fs');

class EntidadController {

    async listar(req, res) {
        try {
            var listar = await entidad.findAll({
                attributes: ['apellidos', 'nombres', 'external_id', 'foto', 'telefono', 'fecha_nacimiento', 'estado'],
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
        var lista = await entidad.findOne({
            where: {
                external_id: external
            },
            attributes: [
                'id',
                'apellidos',
                'nombres',
                'external_id',
                'fecha_nacimiento',
                'telefono',
                'estado',
                'foto'
            ],
        });
        if (lista === null) {
            return res.status(400).json({
                msg: 'NO EXISTE EL REGISTRO',
                code: 400,
                info: listar
            });
        }
        return res.status(200).json({
            msg: 'OK!',
            code: 200,
            info: lista
        });
    }


    async guardar(req, res) {
    
        // Iniciar una transacción fuera del bloque try
        const transaction = await models.sequelize.transaction();
    
        try {
            // Validación de los datos
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
    
            if (!req.file) {
                return res.status(400).json({
                    msg: "FALTA CARGAR LA IMAGEN",
                    code: 400
                });
            }
    
            // Generar el hash de la clave
            const claveHash = (clave) => {
                if (!clave) {
                    throw new Error("La clave es obligatoria");
                }
                const salt = bcrypt.genSaltSync(saltRounds);
                return bcrypt.hashSync(clave, salt);
            };
    
            // Datos a guardar en la base de datos
            const data = {
                nombres: req.body.nombres,
                apellidos: req.body.apellidos,
                fecha_nacimiento: req.body.fecha_nacimiento,
                telefono: req.body.telefono,
                cuenta: {
                    correo: req.body.correo,
                    clave: claveHash(req.body.clave)
                },
                external_id: uuid.v4()
            };
    
            const entidad = await models.entidad.create(data, {
                include: [{ model: models.cuenta, as: "cuenta" }],
                transaction
            });
    
            const filename = `${uuid.v4()}${path.extname(req.file.originalname)}`;
            const finalPath = path.join(__dirname, '../public/images/users', filename);
    
            fs.writeFileSync(finalPath, req.file.buffer);
    
            // Actualizar el campo de la foto con el nombre final
            entidad.foto = filename;
            await entidad.save({ transaction });
    
            // Confirmar la transacción solo después de que todo esté completo
            await transaction.commit();
    
            return res.status(200).json({
                msg: "SE HAN REGISTRADO LOS DATOS CON ÉXITO",
                code: 200
            });
    
        } catch (error) {
            console.error(error);
    
            // Si ocurre un error, asegurarse de hacer rollback solo si la transacción no ha sido finalizada
            if (transaction && !transaction.finished) {
                await transaction.rollback();
            }
    
            // Verificar si el error es de duplicación de correo
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
                imagenAnterior = req.file.filename; // Aquí asegúrate de que esto sea correcto
            }
    
            entidadAux.nombres = req.body.nombres;
            entidadAux.apellidos = req.body.apellidos;
            entidadAux.estado = req.body.estado;
            cuentaAux.estado = req.body.estado;
            entidadAux.foto = imagenAnterior; // Guardar el nuevo nombre de imagen
            entidadAux.external_id = uuid.v4();
    
            const result = await entidadAux.save();
            await cuentaAux.save();
    
            if (!result) {
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