'use strict';
module.exports = (sequelize, DataTypes) => {
    const error = sequelize.define('error', {
        external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, unique: true },
        funcionalidad: { type: DataTypes.STRING(100), defaultValue: "SIN_DATOS" },  // Funcionalidad afectada por el error
        titulo: { type: DataTypes.STRING(100), defaultValue: "SIN_DATOS" },  // Título del error reportado
        pasos_reproducir: { type: DataTypes.TEXT, allowNull: true },  // Pasos para reproducir el error
        persona_asignada: { type: DataTypes.STRING(80), defaultValue: "SIN_DATOS" },  // Persona o rol asignado
        severidad: { 
            type: DataTypes.ENUM('MEDIA', 'BAJA', 'CRITICO'), 
            allowNull: false,  
            defaultValue: 'BAJA'  
        },
        prioridad: { 
            type: DataTypes.ENUM('ALTA', 'MEDIA', 'BAJA'), 
            allowNull: false,  
            defaultValue: 'BAJA' 
        },
        estado: { 
            type: DataTypes.ENUM('NUEVO','CERRADO','PENDIENTE_VALIDACION', 'CORRECCION'), 
            defaultValue: 'NUEVO' 
        },
        razon: { type: DataTypes.STRING(225), defaultValue: "SIN_DATOS" },  // Razón del estado actual del error
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