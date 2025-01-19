'use strict';
module.exports = (sequelize, DataTypes) => {
    const error = sequelize.define('error', {
        external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, unique: true },
        descripcion: { type: DataTypes.STRING(350), defaultValue: "SIN_DATOS" },  
        titulo: { type: DataTypes.STRING(100), defaultValue: "SIN_DATOS" }, 
        severidad: { type: DataTypes.ENUM('CRÍTICA','MEDIA', 'BAJA'),  allowNull: false,  defaultValue: 'BAJA' },
        prioridad: { type: DataTypes.ENUM('ALTA', 'MEDIA', 'BAJA'), allowNull: false,  defaultValue: 'BAJA' },
        estado: { type: DataTypes.ENUM('NUEVO','CERRADO','PENDIENTE_VALIDACION', 'CORRECCION'),  defaultValue: 'NUEVO' },
        anexo_foto: { type: DataTypes.STRING(80), defaultValue: "NO_DATA"},
        pasos_repetir: {type: DataTypes.STRING(350), allowNull: true },
        resultado_obtenido: {type: DataTypes.STRING(350), allowNull: true },
        fecha_reporte: {type: DataTypes.DATE, defaultValue: DataTypes.NOW},
        fecha_resolucion: { type: DataTypes.DATE }, 
    }, {
        freezeTableName: true
    });

    error.associate = function (models){
        error.belongsTo(models.caso_prueba, { foreignKey: 'id_caso_prueba' });  
    };

    return error;
};