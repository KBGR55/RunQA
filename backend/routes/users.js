var express = require('express');
var router = express.Router();
let jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const uuid = require('uuid');

const { body, validationResult,isDate } = require('express-validator');
const RolController = require('../controls/RolController');
const rolController = new RolController();
const EntidadController = require('../controls/EntidadController');
const entidadController = new EntidadController();
const CuentaController = require('../controls/CuentaController');
const cuentaController = new CuentaController();
const CasoPruebaController=require('../controls/CasoPruebaController');
const casoPruebaController=new CasoPruebaController();
const ProyectoController = require('../controls/ProyectoController');
const proyectoController = new ProyectoController();
const RolProyectoController = require('../controls/RolProyectoController');
const rolProyectoController = new RolProyectoController();
const RolEntidadController = require('../controls/RolEntidadController');
const rolEntidadController = new RolEntidadController();
const ContratoController = require('../controls/ContratoController');
const contratoController = new ContratoController();
const PeticionController = require('../controls/PeticionController');
const peticionController = new PeticionController();
const ErrorController = require('../controls/ErrorController');
const errorController = new ErrorController();
const FuncionalidadController = require('../controls/FuncionalidadController');
const funcionalidadController = new FuncionalidadController();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

var auth = function middleware(req, res, next) {
  const token = req.headers['x-api-token'];
  if (token) {
    require('dotenv').config();
    const llave = process.env.KEY;
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

// GUARDAR IMAGENES 

// Función para crear configuraciones de almacenamiento de multer
const createStorage = (folderPath) => {
  return multer.diskStorage({
    destination: path.join(__dirname, folderPath),
    filename: (req, file, cb) => {
      const parts = file.originalname.split('.');
      const extension = parts[parts.length - 1];
      cb(null, uuid.v4() + "." + extension);
    }
  });
};

// Método para validar las extensiones de las fotografías
const extensionesAceptadasFoto = (req, file, cb) => {
  const allowedExtensions = ['.jpeg', '.jpg', '.png'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos JPEG, JPG y PNG.'), false);
  }
};

// Configuración de Multer con control de tamaño y tipo de archivo
const uploadFoto = (folderPath) => {
  const storage = createStorage(folderPath);
  return multer({
    storage: storage,
    fileFilter: extensionesAceptadasFoto,
    limits: {
      fileSize: 2 * 1024 * 1024  // 5MB
    }
  });
};


// Ejemplos de uso
const uploadFotoPersona = uploadFoto('../public/images/users');
const uploadAnexoFotoError = uploadFoto('../public/images/errors');

//INICIO DE SESION
router.post('/sesion', [
  body('correo', 'Ingrese un correo valido').exists().not().isEmpty().isEmail(),
  body('clave', 'Ingrese una clave valido').exists().not().isEmpty(),
], cuentaController.sesion)

//CAMBIAR CLAVE
router.put('/cuenta/clave/:external_id', [
  body('clave_vieja', 'Ingrese una clave valido').exists().not().isEmpty(),
  body('clave_nueva', 'Ingrese una clave valido').exists().not().isEmpty()
], cuentaController.cambioClave)
router.put('/cuenta/restablecer/clave/:external_id', auth, [
  body('clave_nueva', 'Ingrese una clave valido').exists().not().isEmpty()
], cuentaController.cambioClaveSoloNueva)
router.get('/cuenta/token/:external_id', cuentaController.tokenCambioClave)
router.put('/cuenta/validar',[
  body('correo', 'Ingrese un correo valido').exists().not().isEmpty().isEmail()], cuentaController.validarCambioClave)

//GET-ROL
router.get('/rol/listar', rolController.listar);

//POST ROL
router.post('/rol/guardar', rolController.guardar);

/*****ENTIDAD****/
router.post('/entidad/guardar', (req, res, next) => {
  uploadFotoPersona.single('foto')(req, res, (error) => {
    if (error) {
      if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          msg: "El archivo es demasiado grande. Por favor, sube un archivo de menos de 2 MB.",
          code: 413
        });
      }
      return res.status(400).json({
        msg: "Error al cargar el archivo: " + error.message,
        code: 400
      });
    }
    entidadController.guardar(req, res, next);
  });
});
router.put('/modificar/entidad', (req, res, next) => {
  uploadFotoPersona.single('foto')(req, res, (error) => {
    if (error) {
      if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          msg: "El archivo es demasiado grande. Por favor, sube un archivo de menos de 2 MB.",
          code: 413
        });
      }
      return res.status(400).json({
        msg: "Error al cargar el archivo: " + error.message,
        code: 400
      });
    }
    entidadController.modificar(req, res, next);
  });
});
router.get('/listar/entidad', entidadController.listar);
router.get('/listar/entidad/activos', entidadController.listarActivos);
router.get('/obtener/entidad/:external',  entidadController.obtener);
router.get('/proyecto/listar',proyectoController.listar);

/** CASOS PRUEBA */
router.post('/caso/prueba/guardar', [
  body('nombre').notEmpty().withMessage('El título es requerido'),
  body('descripcion').notEmpty().withMessage('La descripción es requerida'),
  body('resultado_esperado').notEmpty().withMessage('El resultado esperado es requerido'),
], casoPruebaController.guardar);
router.post('/caso/prueba/actualizar', [
  body('external_id').trim().notEmpty().withMessage('El external_id es requerido'),
  body('nombre').trim().optional().notEmpty().withMessage('El título no puede estar vacío'),
  body('descripcion').trim().optional().notEmpty().withMessage('La descripción no puede estar vacía'),
  body('resultado_esperado').trim().optional().notEmpty().withMessage('El resultado esperado no puede estar vacío'),
], casoPruebaController.actualizar);
router.get('/caso/prueba/listar/:id_entidad',casoPruebaController.listar);
router.get('/caso/prueba/obtener/:entidad_id',casoPruebaController.obtener);
router.put('/caso/prueba/cambiar/estado',casoPruebaController.cambiar_estado);
router.get('/caso/prueba/eliminar',casoPruebaController.cambiar_estado_obsoleto);
router.get('/caso/obtener/proyecto/:external_id', casoPruebaController.obtenerCasosProyecto);
router.put('/caso/prueba/ejecutar/:external_id',casoPruebaController.ejecutarCasoPrueba);

/** ERROR */
router.get('/error/listar', errorController.listar);
router.get('/error/obtener', errorController.listarPorCasoPrueba);
router.get('/error/caso/prueba', errorController.listarPorCasoPrueba);
router.post('/error/guardar', (req, res, next) => {
  uploadAnexoFotoError.single('foto')(req, res, (error) => {
    if (error) {
      if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          msg: "El archivo es demasiado grande. Por favor, sube un archivo de menos de 2 MB.",
          code: 413
        });
      }
      return res.status(400).json({
        msg: "Error al cargar el archivo: " + error.message,
        code: 400
      });
    }
    errorController.guardar(req, res, next);
  });
});
router.put('/error/actualizar', (req, res, next) => {
  uploadAnexoFotoError.single('foto')(req, res, (error) => {
    if (error) {
      if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          msg: "El archivo es demasiado grande. Por favor, sube un archivo de menos de 2 MB.",
          code: 413
        });
      }
      return res.status(400).json({
        msg: "Error al cargar el archivo: " + error.message,
        code: 400
      });
    }
    errorController.editar(req, res, next);
  });
});
router.get('/error/obtener/external/:entidad_id', errorController.obtener);
router.get('/error/obtener/proyecto/:external_id', errorController.obtenerErrores);
router.get('/error/obtener/asignado/proyecto/:id_entidad/:proyecto_external_id', errorController.obtenerErrorAsignado);
router.get('/error/cambiar/estado/:estado/:id_error', errorController.cambiarEstado);
router.post('/error/registrar-correccion/:external_id_error', errorController.registrarCorreccion);
router.post('/error/evaluar/:external_id_error', errorController.evaluarCorreccion);


/** ROL_PROYECTO */
router.get('/rol_proyecto/listar/proyectos', rolProyectoController.listar.bind(rolProyectoController));
router.get('/rol_proyecto/listar/entidad',rolProyectoController.listar_roles_entidad);
router.get('/cuenta/:nombreCompleto',cuentaController.obtenerCuenta);


/** PROYECTO */
router.post('/proyecto', proyectoController.crearProyecto);
router.put('/proyecto', proyectoController.actualizarProyecto);
router.post('/proyecto/asignar', proyectoController.asignarProyecto);
router.get('/proyecto/:id_proyect',proyectoController.getEntidadProyecto);
router.get('/proyecto/obtener/:external_id',proyectoController.getProyecto);
router.delete('/proyecto/:id_proyect/:id_rol_proyecto',proyectoController.removerEntidad);
router.get('/proyecto/listar/rol/:rol_name/:external_id',proyectoController.obtenerRolesPorProyecto);
router.get('/proyecto/eliminar/:external_id', proyectoController.eliminarProyecto);
router.get('/proyecto/horas/cambiar/:id_entidad/:id_rol_proyecto/:horasDiarias', proyectoController.cambiarHorasDiarias);
router.delete('/proyecto/terminar/:id_proyect/:razonTerminacion',proyectoController.terminarProyecto);

/** CONTRATO */
router.post('/contrato/caso/prueba', contratoController.asignarTesters);
router.get('/contrato/asignados', contratoController.obtenerDatosTabla);
router.get('/contrato/asignado/:external_id', contratoController.obtenerDatosCasoAsignado);

router.post('/contrato/error', contratoController.asignarDesarrolladores);
router.get('/contrato/errores/asignados', contratoController.obtenerDatosTabla);
router.get('/contrato/error/obtener/:external_id', contratoController.obtenerDatosErrorAsignado);
router.post('/contrato/error/reasginar', contratoController.reasignarError);


/** ROL_ENTIDAD */
router.get('/rol/entidad/listar', rolEntidadController.listar);
router.post('/asignar/lideres', rolEntidadController.asignarLideres);
router.post('/asignar/admin', rolEntidadController.asignarAdministrador);
router.get('/rol/entidad/obtener/lider', rolEntidadController.obtenerLider);
router.get('/rol/entidad/obtener/administrador', rolEntidadController.obtenerAdministrador);


/** PETICION */
router.get('/peticion/:tipo', peticionController.listarPeticiones);
router.get('/aceptarechazar/peticiones/:external/:estado/:motivo_rechazo/:id_rechazador', /*auth,*/ peticionController.aceptarRechazar);

/** FUNCIONALIDAD */
router.get('/funcionalidad', funcionalidadController.listar);
router.get('/funcionalidad/obtener/:external_id', funcionalidadController.obtenerFuncionalidadesProyecto);
router.get('/funcionalidad/obtener-activos/:external_id', funcionalidadController.obtenerFuncionalidadesActivasProyecto);
router.get('/funcionalidad/obtener-desactivos/:external_id', funcionalidadController.obtenerFuncionalidadesDesactivasProyecto);
router.post('/funcionalidad/guardar', funcionalidadController.guardar);
router.post('/funcionalidad/editar', funcionalidadController.actualizar);
router.get('/funcionalidad/cambiar-estado/:external_id', funcionalidadController.cambiarEstado);


module.exports = router;  