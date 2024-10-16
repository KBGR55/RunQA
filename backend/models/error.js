'use strict';
module.exports = (sequelize, DataTypes) => {
    const error = sequelize.define('error', {
        external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 },
        funcionalidad: { type: DataTypes.STRING(100), defaultValue: "SIN_DATOS" },  // Funcionalidad afectada por el error
        titulo: { type: DataTypes.STRING(100), defaultValue: "SIN_DATOS" },  // Título del error reportado
        pasos_reproducir: { type: DataTypes.TEXT, allowNull: true },  // Pasos para reproducir el error
        rol_asignado: { type: DataTypes.STRING(80), defaultValue: "SIN_DATOS" },  // Persona o rol asignado
        severidad: { 
            type: DataTypes.ENUM('ALTA', 'MEDIA', 'BAJA', 'CRITICO'), 
            allowNull: false,  
            defaultValue: 'BAJA'  // Nivel de severidad del error
        },
        prioridad: { type: DataTypes.INTEGER, defaultValue: 0 },  // Prioridad del error (entero)
        estado: { 
            type: DataTypes.ENUM('PENDIENTE', 'RESUELTO', 'NO_REPUDIO', 'EN_PROCESO'), 
            defaultValue: 'PENDIENTE'  // Estado actual del error
        },
        ciclo_error: { type: DataTypes.INTEGER, defaultValue: 1 },  // Ciclo en el que fue encontrado el error (entero)
        razon: { type: DataTypes.STRING(40), defaultValue: "SIN_DATOS" },  // Razón del estado actual del error
        fecha_reporte: { type: DataTypes.DATE },  // Fecha en la que se reportó el error
        fecha_resolucion: { type: DataTypes.DATE },  // Fecha en la que se resolvió el error
    }, {
        freezeTableName: true
    });

    // Asociación con otros modelos
    error.associate = function (models){
        error.belongsTo(models.caso_prueba, { foreignKey: 'id_caso_prueba' });  // Asociación con el caso de prueba
    };

    return error;
};