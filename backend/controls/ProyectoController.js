"use strict";
const { validationResult } = require("express-validator");
var models = require("../models/");
const uuid = require("uuid");
const { where } = require("sequelize");
const proyecto = models.proyecto;
const rol = models.rol;
const rolLider = "LIDER DE CALIDAD";
const { Op } = require("sequelize");

class ProyectoController {
  async listar(req, res) {
    try {
      const listar = await proyecto.findAll({
        attributes: [
          "id",
          "external_id",
          "estado",
          "nombre",
          "fecha_inicio",
          "descripcion",
          "terminado",
          "razon_terminado",
          "createdAt",
          "updatedAt",
        ],
      });
      res.json({ msg: "OK!", code: 200, info: listar });
    } catch (error) {
      res.status(500).json({
        msg: "Error al listar proyectos",
        code: 500,
        error: error.message,
      });
    }
  }

  async getProyecto(req, res) {
    try {
      const listar = await proyecto.findOne({
        where: { external_id: req.params.external_id },
      });
      res.json({ msg: "OK!", code: 200, info: listar });
    } catch (error) {
      res.status(500).json({
        msg: "Error al obtener proyecto",
        code: 500,
        error: error.message,
      });
    }
  }

  async crearProyecto(req, res) {
    let transaction;
    try {
      transaction = await models.sequelize.transaction();

      const entidad = await models.entidad.findOne({
        where: { id: req.body.id_entidad },
        attributes: ["id", "horasDisponibles", "nombres"],
      });

      if (!entidad) {
        return res
          .status(404)
          .json({ msg: "Entidad no encontrada", code: 404 });
      }

      const dataRolLider = await models.rol.findOne({
        where: { nombre: rolLider },
        attributes: ["id"],
      });

      if (!dataRolLider) {
        return res.status(404).json({ msg: "Rol no encontrado", code: 404 });
      }

      const rolEntidad = await models.rol_entidad.findOne({
        where: { id_entidad: entidad.id, id_rol: dataRolLider.id },
        attributes: ["id"],
      });

      if (!rolEntidad) {
        return res
          .status(404)
          .json({ msg: "Rol en entidad no encontrado", code: 404 });
      }

      const proyectoExistente = await models.rol_proyecto.findOne({
        where: { id_rol_entidad: rolEntidad.id },
        include: {
          model: models.proyecto,
          as: "proyecto_rol",
          where: { nombre: req.body.name },
          attributes: ["id", "nombre"],
        },
        attributes: ["id_rol_entidad"],
      });

      if (proyectoExistente) {
        return res
          .status(409)
          .json({ msg: "El proyecto ya existe", code: 409 });
      }

      // Verifica si hay suficientes horas disponibles
      if (entidad.horasDisponibles < req.body.horasDiarias) {
        return res.status(400).json({
          msg: `${entidad.nombres} no tiene suficientes horas disponibles, solo tiene ${entidad.horasDisponibles} horas disponibles`,
          code: 400,
        });
      }

      entidad.horasDisponibles -= req.body.horasDiarias;
      await entidad.save({ transaction });
      var uuid = require("uuid");

      const proyectoData = {
        nombre: req.body.name,
        descripcion: req.body.description,
        fecha_inicio: new Date(),
        external_id: uuid.v4(),
      };

      const nuevoProyecto = await models.proyecto.create(proyectoData, {
        transaction,
      });

      await models.rol_proyecto.create(
        {
          id_rol_entidad: rolEntidad.id,
          id_proyecto: nuevoProyecto.id,
          horasDiarias: req.body.horasDiarias,
          external_id: uuid.v4(),
        },
        { transaction }
      );

      await transaction.commit();

      res.status(201).json({
        msg: "Proyecto registrado correctamente",
        code: 200,
        info: nuevoProyecto.external_id,
      });
    } catch (error) {
      console.error("Error al crear el proyecto:", error);
      const errorMsg =
        error.errors?.[0]?.message ||
        error.message ||
        "Error interno del servidor";
      res.status(500).json({ msg: errorMsg, code: 500 });
    }
  }

  async eliminarProyecto(req, res) {
    let transaction;
    try {
      transaction = await models.sequelize.transaction();

      const proyecto = await models.proyecto.findOne({
        where: { external_id: req.params.external_id, estado: 1 },
        attributes: ["id", "estado", "nombre"],
      });

      if (!proyecto) {
        return res
          .status(404)
          .json({ msg: "Proyecto no encontrado", code: 404 });
      }

      const casosDePrueba = await models.caso_prueba.findOne({
        where: { id_proyecto: proyecto.id },
        attributes: ["id"],
      });

      if (casosDePrueba) {
        return res.status(400).json({
          msg: `El proyecto '${proyecto.nombre}' no puede ser eliminado porque tiene casos de prueba registrados.`,
          code: 400,
        });
      }

      const rolesProyecto = await models.rol_proyecto.findAll({
        where: { id_proyecto: proyecto.id, estado: 1 },
        include: [
          {
            model: models.rol_entidad,
            as: "rol_entidad",
            include: [
              {
                model: models.entidad,
                as: "entidad",
                attributes: ["id", "horasDisponibles", "nombres", "apellidos"],
              },
            ],
          },
        ],
        attributes: ["id", "horasDiarias"],
      });

      for (const rolProyecto of rolesProyecto) {
        if (rolProyecto.rol_entidad && rolProyecto.rol_entidad.entidad) {
          const entidad = rolProyecto.rol_entidad.entidad;
          entidad.horasDisponibles += rolProyecto.horasDiarias;
          await entidad.save({ transaction });
        }
      }

      proyecto.estado = 0;
      await proyecto.save({ transaction });

      await models.rol_proyecto.update(
        { estado: 0 },
        { where: { id_proyecto: proyecto.id }, transaction }
      );

      await transaction.commit();

      res.status(200).json({
        msg: `El proyecto '${proyecto.nombre}' ha sido eliminado`,
        code: 200,
      });
    } catch (error) {
      console.error("Error al eliminar el proyecto:", error);
      if (transaction) await transaction.rollback();
      const errorMsg =
        error.errors?.[0]?.message ||
        error.message ||
        "Error interno del servidor";
      res.status(500).json({ msg: errorMsg, code: 500 });
    }
  }

  async modificarProyecto(req, res) {
    try {
      const proyectoAux = await proyecto.findOne({
        where: { external_id: req.body.external_id },
      });

      if (!proyectoAux) {
        return res
          .status(400)
          .json({ msg: "NO EXISTE EL REGISTRO", code: 400 });
      }
      proyectoAux.nombre = req.body.nombre;
      proyectoAux.descripcion = req.body.descripcion;
      proyectoAux.external_id = uuid.v4();
      const result = await proyectoAux.save();
      if (!result && !cuantaActualizada) {
        return res.status(400).json({
          msg: "NO SE HAN MODIFICADO LOS DATOS, VUELVA A INTENTAR",
          code: 400,
        });
      }

      return res
        .status(200)
        .json({ msg: "SE HAN MODIFICADO LOS DATOS CON ÉXITO", code: 200 });
    } catch (error) {
      console.error("Error en el servidor:", error);
      return res
        .status(400)
        .json({ msg: "Error en el servidor", error, code: 400 });
    }
  }

  async actualizarProyecto(req, res) {
    let transaction;

    try {
      transaction = await models.sequelize.transaction();
      const oldProyect = await models.proyecto.findOne({
        where: { id: req.body.id_proyect },
      });
      const rolProyect = await models.rol_proyecto.findOne({
        where: { id_proyecto: req.body.id_proyect },
      });

      if (oldProyect) {
        if (
          oldProyect.descripcion == req.body.description &&
          oldProyect.nombre == req.body.name
        ) {
          res
            .status(409)
            .json({ msg: "No se han realizado actualizaciones", code: 409 });
        } else {
          oldProyect.nombre = req.body.name;
          oldProyect.descripcion = req.body.description;
          await oldProyect.save({ transaction });
          await transaction.commit();
          res.json({
            msg: "El proyecto se ha actualizado correctamente",
            code: 200,
            info: oldProyect.external_id,
          });
        }
      } else {
        res.status(400).json({ msg: "No se encontró el proyecto", code: 400 });
      }
    } catch (error) {
      if (transaction) await transaction.rollback();
      if (error.errors && error.errors[0].message) {
        res.json({
          msg: "Hubo un problema al actualizar el proyecto",
          code: 500,
        });
      } else {
        res.json({
          msg: "Hubo un problema al actualizar el proyecto",
          code: 400,
        });
      }
    }
  }

  async terminarProyecto(req, res) {
    let transaction;
    const { id_proyect, razonTerminacion } = req.params;

    try {
      transaction = await models.sequelize.transaction();

      const oldProyect = await models.proyecto.findOne({
        where: { external_id: id_proyect },
      });

      if (!oldProyect) {
        return res
          .status(400)
          .json({ msg: "No se encontró el proyecto", code: 400 });
      }

      // Buscar roles asociados al proyecto
      const rolesProyectos = await models.rol_proyecto.findAll({
        where: { id_proyecto: oldProyect.id },
      });

      for (const rol of rolesProyectos) {
        // Buscar rol_entidad relacionado
        const rol_entidad = await models.rol_entidad.findOne({
          where: { id: rol.id_rol_entidad },
        });

        if (rol_entidad) {
          // Buscar entidad asociada
          const entidad = await models.entidad.findOne({
            where: { id: rol_entidad.id_entidad },
          });

          if (entidad) {
            // Actualizar horas disponibles
            entidad.horasDisponibles += rol.horasDiarias;
            await entidad.save({ transaction });

            // Actualizar estado de rol_entidad
            rol_entidad.estado = 0; // Cambiar estado a inactivo
            await rol_entidad.save({ transaction });
          }
        }
      }

      // Marcar proyecto como terminado
      oldProyect.terminado = 1;

      if (razonTerminacion && oldProyect.razon_terminado !== razonTerminacion) {
        oldProyect.razon_terminado = razonTerminacion;
      }

      await oldProyect.save({ transaction });
      await transaction.commit();

      res.json({
        msg: "El proyecto se ha terminado por " + oldProyect.razon_terminado,
        code: 200,
        info: oldProyect.external_id,
      });
    } catch (error) {
      if (transaction) await transaction.rollback();
      console.error("Error al procesar la transacción:", error);
      res
        .status(500)
        .json({ msg: "Hubo un problema al actualizar el proyecto", code: 500 });
    }
  }

  async asignarProyecto(req, res) {
    let transaction;
    const errorMessages = [];

    try {
      transaction = await models.sequelize.transaction();

      // Fetch the project
      const proyecto = await models.proyecto.findOne({
        where: { external_id: req.body.id_proyect, estado: 1 },
        attributes: ["id", "nombre"],
      });
      if (!proyecto) {
        errorMessages.push("Proyecto no encontrado.");
        return res
          .status(400)
          .json({ msg: "Proyecto no encontrado", code: 400 });
      }

      // Fetch the role
      const rol = await models.rol.findOne({
        where: { external_id: req.body.id_rol },
        attributes: ["id"],
      });
      if (!rol) {
        errorMessages.push("Rol no encontrado.");
        return res.status(400).json({ msg: "Rol no encontrado", code: 400 });
      }

      const users = req.body.users;
      let hasErrors = false;

      for (const user of users) {
        const entidad = await models.entidad.findOne({
          where: { id: user.id_entidad, estado: 1 },
          attributes: ["id", "nombres", "horasDisponibles"],
        });

        if (!entidad) {
          errorMessages.push(
            `Entidad con ID ${user.id_entidad} no encontrada.`
          );
          hasErrors = true;
          continue;
        }

        if (entidad.horasDisponibles < req.body.horasDiarias) {
          errorMessages.push(
            `${entidad.nombres} no tiene suficientes horas disponibles, ya que solo tiene ${entidad.horasDisponibles} horas disponibles.`
          );
          hasErrors = true;
          continue;
        }

        let rolEntidad = await models.rol_entidad.findOne({
          where: { id_entidad: entidad.id, id_rol: rol.id, estado: 1 },
        });

        if (!rolEntidad) {
          rolEntidad = await models.rol_entidad.create(
            {
              id_entidad: entidad.id,
              id_rol: rol.id,
              external_id: uuid.v4(),
            },
            { transaction }
          );
        }

        const existingRolProyecto = await models.rol_proyecto.findOne({
          where: {
            id_rol_entidad: rolEntidad.id,
            id_proyecto: proyecto.id,
            estado: 1,
          },
        });

        if (!existingRolProyecto) {
          // Deduct the assigned hours from available hours
          entidad.horasDisponibles -= req.body.horasDiarias;
          await entidad.save({ transaction });

          // Create the role project
          await models.rol_proyecto.create(
            {
              id_rol_entidad: rolEntidad.id,
              id_proyecto: proyecto.id,
              horasDiarias: req.body.horasDiarias,
              external_id: uuid.v4(),
            },
            { transaction }
          );
        }
      }

      // If any errors occurred, rollback the transaction
      if (hasErrors) {
        if (transaction.finished !== "rollback") {
          await transaction.rollback();
        }
        const errorMsg = errorMessages.join(", ");
        return res
          .status(500)
          .json({ msg: `Error asignando roles: ${errorMsg}.`, code: 500 });
      }

      // Commit the transaction if everything is successful
      await transaction.commit();
      return res.json({
        msg:
          users.length > 1
            ? "Roles asignados correctamente"
            : "Rol asignado correctamente",
        code: 200,
      });
    } catch (error) {
      if (transaction && transaction.finished !== "rollback") {
        await transaction.rollback();
      }
      console.error("Error:", error);
      return res.status(500).json({
        msg: error.message || "Error interno del servidor",
        code: 500,
      });
    }
  }

  async getEntidadProyecto(req, res) {
    try {
      const proyecto = await models.proyecto.findOne({
        where: { external_id: req.params.id_proyect },
      });
      if (!proyecto) {
        return res
          .status(400)
          .json({ msg: "No se encontró el proyecto", code: 400 });
      }

      const rolProyectos = await models.rol_proyecto.findAll({
        where: { id_proyecto: proyecto.id, estado: 1 },
        attributes: ["id"],
        include: [
          {
            model: models.rol_entidad,
            as: "rol_entidad",
            include: [
              {
                model: models.entidad,
                as: "entidad",
                attributes: [
                  "nombres",
                  "apellidos",
                  "foto",
                  "id",
                  "horasDisponibles",
                ],
              },
              {
                model: models.rol,
                as: "rol",
                attributes: ["nombre"],
              },
            ],
          },
          {
            model: models.proyecto,
            as: "proyecto_rol",
            attributes: ["nombre", "descripcion"],
          },
        ],
        attributes: ["id", "horasDiarias"],
      });

      res.status(200).json({ msg: "OK!", code: 200, info: rolProyectos });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ msg: "Estamos teniendo problemas", code: 500 });
    }
  }

  async getEntidadProyectoTesterDesarrollador(req, res) {
    try {
      const proyecto = await models.proyecto.findOne({
        where: { external_id: req.params.id_proyect },
      });
      if (!proyecto) {
        return res
          .status(400)
          .json({ msg: "No se encontró el proyecto", code: 400 });
      }

      const rolProyectos = await models.rol_proyecto.findAll({
        where: { id_proyecto: proyecto.id },
        attributes: ["id", "external_id"],
        include: [
          {
            model: models.rol_entidad,
            as: "rol_entidad",
            include: [
              {
                model: models.entidad,
                as: "entidad",
                attributes: [
                  "nombres",
                  "apellidos",
                  "foto",
                  "id",
                  "horasDisponibles",
                  "external_id",
                ],
              },
              {
                model: models.rol,
                as: "rol",
                attributes: ["nombre"],
                where: {
                  nombre: ["TESTER", "DESARROLLADOR"],
                },
              },
            ],
          },
          {
            model: models.proyecto,
            as: "proyecto_rol",
            attributes: ["nombre", "descripcion"],
          },
        ],
        attributes: ["id", "horasDiarias"],
      });

      res.status(200).json({ msg: "OK!", code: 200, info: rolProyectos });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ msg: "Estamos teniendo problemas", code: 500 });
    }
  }

  async removerEntidad(req, res) {
    try {
      const { id_rol_proyecto } = req.params;

      const rolProyecto = await models.rol_proyecto.findOne({
        where: { id: id_rol_proyecto },
        include: [
          {
            model: models.rol_entidad,
            as: "rol_entidad",
            include: {
              model: models.rol,
              attributes: ["nombre"],
            },
          },
          {
            model: models.proyecto,
            as: "proyecto_rol",
            attributes: ["id", "external_id"],
          },
        ],
      });

      if (!rolProyecto) {
        return res
          .status(404)
          .json({ msg: "No se encontró el rol_proyecto", code: 404 });
      }

      const { rol_entidad, id_proyecto } = rolProyecto;

      const entidad = await models.entidad.findOne({
        where: { id: rol_entidad.id_entidad },
        attributes: ["id", "horasDisponibles"],
      });

      if (!entidad) {
        return res
          .status(404)
          .json({ msg: "Entidad no encontrada", code: 404 });
      }

      if (!rol_entidad || !rol_entidad.rol) {
        return res.status(404).json({
          msg: "No se encontró el rol asociado al proyecto",
          code: 404,
        });
      }

      const rolNombre = rol_entidad.rol.nombre;

      if (["TESTER", "DESARROLLADOR"].includes(rolNombre)) {
        const contratosActivos = await models.contrato.count({
          where: {
            estado: 1,
            [Op.or]: [
              { id_rol_proyecto_asignado: rolProyecto.id },
              { id_rol_proyecto_responsable: rolProyecto.id },
            ],
          },
        });

        if (contratosActivos > 0) {
          return res.status(400).json({
            msg: `No se puede eliminar el rol ${rolNombre} porque tiene contratos activos.`,
            code: 400,
          });
        }
      }

      const rolesCriticos = ["LIDER DE CALIDAD", "ANALISTA DE PRUEBAS"];

      if (rolesCriticos.includes(rolNombre)) {
        try {
          const roles = await rol.findOne({
            where: {
              nombre: [rolNombre],
              estado: 1,
            },
          });
          if (roles.length === 0) {
            console.log("No se encontraron role activo.");
            return;
          }

          const rolEntidades = await models.rol_entidad.findAll({
            where: {
              id_rol: roles.id,
              estado: 1,
            },
          });

          if (rolEntidades.length === 0) {
            console.log("No se encontraron entidades de rol activas.");
            return;
          }

          const rolEntidadIds = rolEntidades.map((entidad) => entidad.id);

          const cantidadRoles = await models.rol_proyecto.count({
            where: {
              id_proyecto: id_proyecto,
              id_rol_entidad: {
                [Op.in]: rolEntidadIds,
              },
              estado: 1,
            },
          });

          if (cantidadRoles <= 1) {
            return res.status(400).json({
              msg: `No se puede eliminar el único ${rolNombre} del proyecto.`,
              code: 400,
            });
          }
        } catch (error) {
          console.error("Error al contar los roles:", error);
          return res.status(500).json({
            msg: "Error al realizar la consulta.",
            code: 500,
          });
        }
      }

      rol_entidad.estado = 0;
      await rol_entidad.save();
      entidad.horasDisponibles += rolProyecto.horasDiarias;
      await entidad.save();
      rolProyecto.estado = 0;
      await rolProyecto.save();

      return res.status(200).json({
        msg: `Rol ${rolNombre} eliminado del proyecto exitosamente.`,
        code: 200,
      });
    } catch (error) {
      console.error("Error en removerEntidad:", error);
      return res.status(500).json({
        msg: "Ocurrió un error al intentar eliminar el rol del proyecto.",
        code: 500,
      });
    }
  }

  /** SEGUNDO SPRINT */
  async obtenerRolesPorProyecto(req, res) {
    try {
      const proyecto = await models.proyecto.findOne({
        where: { external_id: req.params.external_id, estado: 1 },
      });
      if (!proyecto) {
        return res
          .status(400)
          .json({ msg: "Proyecto no encontrado", code: 400 });
      }

      const rolTester = await models.rol.findOne({
        where: { nombre: req.params.rol_name, estado: 1 },
        attributes: ["id"],
      });
      if (!rolTester) {
        return res.status(400).json({ msg: "Rol no encontrado", code: 400 });
      }

      const testers = await models.rol_proyecto.findAll({
        where: {
          id_proyecto: proyecto.id,
          estado: 1,
        },
        include: [
          {
            model: models.rol_entidad,
            as: "rol_entidad",
            where: { id_rol: rolTester.id, estado: 1 },
            include: [
              {
                model: models.entidad,
                as: "entidad",
                attributes: ["id", "nombres", "apellidos"],
                include: [
                  {
                    model: models.cuenta,
                    as: "cuenta",
                    attributes: ["correo"],
                  },
                ],
              },
            ],
          },
        ],
      });

      if (testers.length === 0) {
        return res.status(404).json({
          msg: `No se encontraron ${req.params.rol_name} asignados a este proyecto`,
          code: 404,
        });
      }

      res.json({
        msg: "OK",
        code: 200,
        info: testers.map((t) => ({
          id: t.rol_entidad.entidad.id,
          nombres: t.rol_entidad.entidad.nombres,
          apellidos: t.rol_entidad.entidad.apellidos,
          correo: t.rol_entidad.entidad.cuenta.correo,
        })),
        id_rol: rolTester.id,
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({
        msg: error.message || "Error interno del servidor",
        code: 500,
      });
    }
  }

  async cambiarHorasDiarias(req, res) {
    const { id_rol_proyecto, horasDiarias, id_entidad } = req.params;
    try {
      if (
        id_rol_proyecto === undefined ||
        horasDiarias === undefined ||
        id_entidad === undefined
      ) {
        return res.status(400).json({ msg: "Faltan parámetros", code: 400 });
      }
      const rolProyecto = await models.rol_proyecto.findOne({
        where: { id: id_rol_proyecto },
      });
      const entidad = await models.entidad.findOne({
        where: { id: id_entidad },
      });
      entidad.horasDisponibles += rolProyecto.horasDiarias;
      if (entidad.horasDisponibles < horasDiarias) {
        return res.status(400).json({
          msg: `${entidad.nombres} ${entidad.apellidos} tiene ${
            entidad.horasDisponibles - rolProyecto.horasDiarias
          } horas disponibles`,
          code: 400,
        });
      }
      entidad.horasDisponibles -= horasDiarias;
      rolProyecto.horasDiarias = horasDiarias;
      await rolProyecto.save();
      await entidad.save();
      res
        .status(200)
        .json({ msg: "Horas diarias actualizadas correctamente", code: 200 });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ msg: "Estamos teniendo problemas", code: 500 });
    }
  }

  async obtenerConteoCasosPorEstado(req, res) {
    try {
        // Buscar proyecto
        const proyecto = await models.proyecto.findOne({
            where: { external_id: req.params.external_id, estado: true },
            attributes: ["id", "estado", "nombre"],
        });

        if (!proyecto) {
            console.log("Proyecto no encontrado.");
            return res
                .status(404)
                .json({ msg: "Proyecto no encontrado", code: 404 });
        }

        console.log("Buscando casos de prueba asociados al proyecto...");
        // Obtener casos de prueba asociados al proyecto
        const casosDePrueba = await models.caso_prueba.findAll({
            attributes: ["id", "estado"], // Obtener id y estado de cada caso
            where: { id_proyecto: proyecto.id },
        });

        console.log("Resultado de los casos de prueba:", casosDePrueba);

        if (casosDePrueba.length === 0) {
            console.log("No se encontraron casos de prueba para el proyecto.");
            return res.status(404).json({
                msg: `No se encontraron casos de prueba para este proyecto`,
                code: 404,
            });
        }

        // Obtener solo los ids de los casos de prueba
        const idsCasosDePrueba = casosDePrueba.map(caso => caso.id);

        // Obtener los estados de los casos de prueba agrupados por estado
        const estadosContados = await models.caso_prueba.findAll({
            attributes: [
                "estado",
                [models.sequelize.fn("COUNT", models.sequelize.col("*")), "cantidad"],
            ],
            where: { id_proyecto: proyecto.id },
            group: ["estado"],
        });

        console.log("Resultado de los estados de los casos de prueba:", estadosContados);

        // Obtener los errores asociados a los casos de prueba (estado != 'CERRADO')
        const erroresContados = await models.error.findAll({
            attributes: [
                "estado",
                [models.sequelize.fn("COUNT", models.sequelize.col("*")), "cantidad"],
            ],
            where: {
                id_caso_prueba: {
                    [models.Sequelize.Op.in]: idsCasosDePrueba, // Usar los ids de los casos de prueba
                },
                estado: { [models.Sequelize.Op.not]: 'CERRADO' }, // Solo errores no cerrados
            },
            group: ["estado"],
        });

        console.log("Resultado de los errores:", erroresContados);

        // Obtener la severidad y prioridad de los errores no cerrados
        const severidadContada = await models.error.findAll({
            attributes: [
                "severidad",
                [models.sequelize.fn("COUNT", models.sequelize.col("*")), "cantidad"],
            ],
            where: {
                id_caso_prueba: {
                    [models.Sequelize.Op.in]: idsCasosDePrueba,
                },
                estado: { [models.Sequelize.Op.not]: 'CERRADO' },
            },
            group: ["severidad"],
        });

        const prioridadContada = await models.error.findAll({
            attributes: [
                "prioridad",
                [models.sequelize.fn("COUNT", models.sequelize.col("*")), "cantidad"],
            ],
            where: {
                id_caso_prueba: {
                    [models.Sequelize.Op.in]: idsCasosDePrueba,
                },
                estado: { [models.Sequelize.Op.not]: 'CERRADO' },
            },
            group: ["prioridad"],
        });

        console.log("Resultado de severidad de los errores:", severidadContada);
        console.log("Resultado de prioridad de los errores:", prioridadContada);

        // Formateando el resultado para enviar en la respuesta
        const resultado = {
            casos_de_prueba: estadosContados.map((estado) => ({
                estado: estado.estado,
                cantidad: estado.get("cantidad"), // Cantidad de casos de prueba por estado
            })),
            errores: erroresContados.map((error) => ({
                estado: error.estado,
                cantidad: error.get("cantidad"), // Cantidad de errores por estado
            })),
            severidad: severidadContada.map((severidad) => ({
                severidad: severidad.severidad,
                cantidad: severidad.get("cantidad"), // Cantidad de errores por severidad
            })),
            prioridad: prioridadContada.map((prioridad) => ({
                prioridad: prioridad.prioridad,
                cantidad: prioridad.get("cantidad"), // Cantidad de errores por prioridad
            })),
        };

        console.log("Enviando respuesta con el conteo de estados, errores, severidad y prioridad...");
        res.json({
            msg: "OK",
            code: 200,
            info: resultado, // Información con los resultados finales
        });
    } catch (error) {
        console.error("Error en obtenerConteoCasosPorEstado:", error);
        res.status(500).json({
            msg: error.message || "Error interno del servidor",
            code: 500,
        });
    }
}






}

module.exports = ProyectoController;
