"use strict";
const { validationResult } = require("express-validator");
var models = require("../models/");
const { where } = require("sequelize");
const error = models.error;
const proyecto = models.proyecto;
const id_rol_desarrollador = 5;

class ErrorController {
  /**
   * @description Lista todos los errores.
   * @author KBGR55
   * @param {*} req - La solicitud HTTP.
   * @param {*} res - La respuesta HTTP.
   */
  async listar(req, res) {
    try {
      const errores = await error.findAll({
        attributes: [
          "id",
          "external_id",
          "funcionalidad",
          "titulo",
          "severidad",
          "estado",
          "prioridad",
          "anexo_foto",
          "resultado_obtenido",
          "fecha_reporte",
          "fecha_resolucion",
        ],
      });

      res.json({
        msg: "Errores listados correctamente",
        code: 200,
        info: errores,
      });

    } catch (err) {
      console.error("Error al listar todos los errores:", err);
      res.status(500).json({
        msg: "Ocurrió un error al intentar listar los errores",
        code: 500,
        error: err.message,
      });
    }
  }

  /**
   * @description Lista los errores asociados a un caso de prueba específico.
   * @author KBGR55
   * @param {*} req - La solicitud HTTP.
   * @param {*} res - La respuesta HTTP.
   */
  async listarPorCasoPrueba(req, res) {
    const { external_caso_prueba } = req.query;

    const casoPrueba = await models.caso_prueba.findOne({
      where: { external_id: external_caso_prueba },
    });

    if (!casoPrueba) {
      return res.status(404).json({
        msg: "Caso de prueba no encontrado",
        code: 404,
      });
    }
    const id_caso = casoPrueba.id;
    try {
      const errores = await error.findAll({
        where: { id_caso_prueba: id_caso },
        attributes: [
          "id",
          "external_id",
          "funcionalidad",
          "titulo",
          "pasos_repetir",
          "severidad",
          "estado",
          "prioridad",
          "anexo_foto",
          "resultado_obtenido",
          "fecha_reporte",
          "fecha_resolucion",
        ],
      });

      if (errores.length === 0) {
        return res.status(404).json({
          msg: "No se encontraron errores asociados al caso de prueba proporcionado",
          code: 404,
        });
      }

      res.json({
        msg: "Errores encontrados para el caso de prueba",
        code: 200,
        info: errores,
      });
    } catch (err) {
      console.error("Error al listar errores por caso de prueba:", err);
      res.status(500).json({
        msg: "Ocurrió un error al intentar listar los errores por caso de prueba",
        code: 500,
        error: err.message,
      });
    }
  }

  /**
   * @description Edita un error existente.
   * @author KBGR55
   * @param {*} req - La solicitud HTTP.
   * @param {*} res - La respuesta HTTP.
   */
  async editar(req, res) {
    const { external_id } = req.query;
    if (!external_id) {
      return res.status(400).json({
        msg: "El external_id es requerido",
        code: 400,
      });
    }

    try {
      const errorEncontrado = await error.findOne({
        where: { external_id: external_id },
        attributes: [
          "id",
          "external_id",
          "funcionalidad",
          "titulo",
          "pasos_repetir",
          "severidad",
          "estado",
          "prioridad",
          "anexo_foto",
          "resultado_obtenido",
          "fecha_reporte",
        ],
      });

      if (!errorEncontrado) {
        return res.status(404).json({
          msg: "Error no encontrado",
          code: 404,
        });
      }
      let imagenAnterior = errorEncontrado.foto;

      if (req.file) {
        if (imagenAnterior) {
          const imagenAnteriorPath = path.join(
            __dirname,
            "../public/images/errors/",
            imagenAnterior
          );
          fs.unlink(imagenAnteriorPath, (err) => {
            if (err) {
              console.log("Error al eliminar la imagen anterior:", err);
            } else {
              console.log("eliminada: " + imagenAnterior);
            }
          });
        }
        imagenAnterior = req.file.filename;
      } else {
        imagenAnterior = errorEncontrado.foto;
      }

      const [updated] = await error.update(
        {
          funcionalidad:
            req.body.funcionalidad || errorEncontrado.funcionalidad,
          titulo: req.body.titulo || errorEncontrado.titulo,
          severidad: req.body.severidad || errorEncontrado.severidad,
          prioridad: req.body.prioridad || errorEncontrado.prioridad,
          pasos_repetir:
            req.body.pasos_repetir || errorEncontrado.pasos_repetir,
          estado: req.body.estado || errorEncontrado.estado,
          anexo_foto: imagenAnterior,
          resultado_obtenido:
            req.body.resultado_obtenido || errorEncontrado.resultado_obtenido,
        },
        {
          where: { external_id: external_id },
        }
      );

      if (!updated) {
        return res.status(404).json({
          msg: "No se pudo actualizar el error",
          code: 404,
        });
      }

      return res.json({
        msg: "Error actualizado correctamente",
        code: 200,
        info: updated,
      });
    } catch (err) {
      console.error("Error al actualizar el error:", err);
      if (!res.headersSent) {
        return res.status(500).json({
          msg: "Ocurrió un error al intentar actualizar el error",
          code: 500,
          error: err.message,
        });
      }
    }
  }

  /**
   * @description Obtiene un error específico por su external_id.
   * @author KBGR55
   * @param {*} req - La solicitud HTTP.
   * @param {*} res - La respuesta HTTP.
   */
  async obtener(req, res) {
    const { external_id } = req.query;
    if (!external_id) {
      return res.status(400).json({
        msg: "El external_id es requerido",
        code: 400,
      });
    }

    try {
      const errorEncontrado = await error.findOne({
        where: { external_id: external_id },
        attributes: [
          "id",
          "external_id",
          "funcionalidad",
          "titulo",
          "severidad",
          "estado",
          "prioridad",
          "anexo_foto",
          "resultado_obtenido",
          "fecha_reporte",
          "fecha_resolucion",
          "pasos_repetir",
        ],
      });

      if (!errorEncontrado) {
        return res.status(404).json({
          msg: "Error no encontrado",
          code: 404,
        });
      }
      const contrato = await models.contrato.findOne({ where: { id_error: errorEncontrado.id } });
      const rol_proyecto_responsable = contrato
        ? await models.rol_proyecto.findOne({ where: { id: contrato.id_rol_proyecto_responsable } })
        : null;
      const rol_entidad = rol_proyecto_responsable
        ? await models.rol_entidad.findOne({ where: { id: rol_proyecto_responsable.id_rol_entidad } })
        : null;
      const entidad = rol_entidad
        ? await models.entidad.findOne({ where: { id: rol_entidad.id_entidad } })
        : null;

      const data = {
        contrato_id: contrato?.id || null,
        contrato_external_id: contrato?.external_id || null,
        entidad_id: entidad?.id || null,
        entidad_external_id: entidad?.external_id || null,
        responsable: entidad ? `${entidad.nombres || ''} ${entidad.apellidos || ''}`.trim() : null,
      };
      res.json({
        msg: "Error encontrado correctamente",
        code: 200,
        info: { errorEncontrado, data },
      });
    } catch (err) {
      console.error("Error al buscar el error por external_id:", err);
      res.status(500).json({
        msg: "Ocurrió un error al intentar buscar el error",
        code: 500,
        error: err.message,
      });
    }
  }

  /**
   * @description Guarda un nuevo error en la base de datos.
   * ! Se debe enviar el external_caso_prueba en el cuerpo de la petición.
   * ! Solo se permite guardar el error cuando este no tenga el mismo titulo para ese caso de prueba.
   * @author KBGR55
   * @param {*} req - La solicitud HTTP.
   * @param {*} res - La respuesta HTTP.
   */
  async guardar(req, res) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        msg: "Error de validación",
        code: 400,
        errors: errors.array(),
      });
    }

    if (!req.body.external_caso_prueba) {
      return res.status(400).json({
        msg: "El campo external_caso_prueba es obligatorio",
        code: 400,
      });
    }

    try {
      const casoPrueba = await models.caso_prueba.findOne({
        where: { external_id: req.body.external_caso_prueba },
      });

      if (!casoPrueba) {
        return res.status(404).json({
          msg: "Caso de prueba no encontrado",
          code: 404,
        });
      }

      const tituloExistente = await models.error.findOne({
        where: {
          titulo: req.body.titulo,
          id_caso_prueba: casoPrueba.id,
        },
      });

      if (tituloExistente) {
        return res.status(400).json({
          msg: "Ya existe un error con el mismo título para este caso de prueba",
          code: 400,
        });
      }

      casoPrueba.estado = "FALLIDO";
      await casoPrueba.save();

      const nuevoError = await error.create({
        funcionalidad: req.body.funcionalidad || "SIN_DATOS",
        titulo: req.body.titulo || "SIN_DATOS",
        severidad: req.body.severidad,
        prioridad: req.body.prioridad,
        pasos_repetir: req.body.pasos_repetir,
        anexo_foto: req.file ? req.file.filename : "SIN_ANEXO.png",
        id_caso_prueba: casoPrueba.id,
      });

      res.status(201).json({
        msg: "Error registrado exitosamente",
        code: 200,
        info: nuevoError,
      });
    } catch (err) {
      console.error("Error al guardar un nuevo error:", err);
      res.status(500).json({
        msg: "Ocurrió un error al guardar el error",
        code: 500,
        error: err.message,
      });
    }
  }

  /*SEXTO SPRINT*/
  async obtenerErrores(req, res) {
    const proyecto_idExternal = req.params.external_id;
    if (!proyecto_idExternal) {
      return res.status(400).json({ msg: "Falta datos de búsqueda", code: 400 });
    }

    try {
      let proyectoAux = await proyecto.findOne({ where: { external_id: proyecto_idExternal } });

      if (!proyectoAux) {
        return res.status(404).json({ msg: "Proyecto no encontrado", code: 404 });
      }

      let casosPrueba = await models.caso_prueba.findAll({ where: { id_proyecto: proyectoAux.id } });

      if (casosPrueba.length === 0) {
        return res.status(404).json({ msg: "No hay casos de prueba asociados al proyecto", code: 404 });
      }

      // Mapeo para extraer los IDs de los casos de prueba
      const casosPruebaIds = casosPrueba.map(caso => caso.id);

      // Modelo de errores
      const errores = await models.error.findAll({
        where: { id_caso_prueba: casosPruebaIds, estado: "NUEVO" },
        attributes: ['funcionalidad', 'estado', 'external_id', 'titulo', 'pasos_repetir', 'severidad', 'prioridad', 'fecha_reporte', 'fecha_resolucion', 'id']
      });

      if (errores.length === 0) {
        return res.status(404).json({ msg: 'No se encontraron errores nuevos para los casos de prueba', code: 404 });
      }

      res.json({ msg: 'OK!', code: 200, info: errores });
    } catch (err) {
      console.error('Database error:', err);
      res.status(500).json({ msg: 'Error al obtener registro de error', code: 500, error: err.message });
    }
  }

  async obtenerErrorAsignado(req, res) {
    const id_entidad = req.params.id_entidad;
    const id_proyecto = req.params.proyecto_external_id;

    if (!id_entidad || !id_proyecto) {
      return res.status(400).json({ msg: "Faltan datos de búsqueda", code: 400 });
    }

    try {
      const proyecto = await models.proyecto.findOne({ where: { external_id: id_proyecto } });

      if (!proyecto) {
        return res.status(404).json({ msg: "Proyecto no encontrado", code: 404 });
      }

      // Buscar en rol_entidad con el filtro requerido
      const rolesEntidad = await models.rol_entidad.findOne({
        where: {
          id_entidad: id_entidad,
          id_rol: id_rol_desarrollador,
        }
      });
      if (!rolesEntidad) {
        return res
          .status(404)
          .json({ msg: "No se encontraron roles para la entidad y proyecto dados", code: 404 });
      }
      const rol_proyecto = await models.rol_proyecto.findOne({
        where: {
          id_proyecto: proyecto.id,
          id_rol_entidad: rolesEntidad.id
        }
      });
      if (!rol_proyecto) {
        return res
          .status(404)
          .json({ msg: "No se encontraron roles para la entidad y proyecto dados", code: 404 });
      }
      const contratos = await models.contrato.findAll({
        where: {
          id_rol_proyecto_responsable: rol_proyecto.id, tipo_contrato: 'ERROR'
        }, attributes: ['id_error']
      });
      const idsErrores = contratos.map((contrato) => contrato.id_error);

      // Buscar los errores correspondientes en la base de datos
      const errores = await models.error.findAll({
        where: {
          id: idsErrores,
        },
        include: [{ model: models.caso_prueba, attributes: ['external_id'] }],
      });

      if (!errores || errores.length === 0) {
        return res.status(404).json({
          msg: "No se encontraron detalles de errores asignados",
          code: 404,
        });
      }

      // Respuesta exitosa con los errores encontrados
      return res.status(200).json({
        msg: "Errores encontrados",
        code: 200,
        info: errores,
      });

      // Respuesta exitosa con los datos encontrados
      return res.status(200).json({ msg: "Errores encontrados", code: 200, info: contratos });
    } catch (error) {
      console.error("Error al buscar en la base de datos:", error);
      return res.status(500).json({ msg: "Error interno del servidor", code: 500 });
    }

  }

  async cambiarEstado(req, res) {
    const estado = req.params.estado;
    const id = req.params.id_error;
    if (!estado) {
      return res.status(400).json({ msg: "Falta el estado", code: 400 });
    }
    try {
      var error = await models.error.findOne({ where: { id: id } });
      if (!error) {
        return res.status(404).json({ msg: "Error no encontrado", code: 404 });
      }
      error.estado = estado;
      const result = await error.save();
      if (!result) {
        return res.status(400).json({ msg: "NO SE HAN MODIFICADO EL ESTADO, VUELVA A INTENTAR", code: 400 });
      }
      return res.status(200).json({ msg: "SE HAN MODIFICADO EL ESTADO CON ÉXITO", code: 200 });
    } catch (error) {
      console.error("Error al buscar en la base de datos:", error);
      return res.status(500).json({ msg: "Error interno del servidor", code: 500 });
    }
  }

}

module.exports = ErrorController;
