'use strict';
module.exports = (sequelize, DataTypes) => {
    const error = sequelize.define('error', {
        external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4},
        nombre: { type: DataTypes.STRING(20), defaultValue: "NO_DATA" },
        descripcion: { type: DataTypes.STRING(255),  allowNull: true },
        estado:{type: DataTypes.ENUM('PENDIENTE','RESUELTO','NO_REPUDIO','EN_PROCESO'), },
        severidad: {  type: DataTypes.ENUM('ALTA', 'MEDIA', 'BAJA','CRITICO'), allowNull: false,  defaultValue: 'BAJA'  },
        rol_proyecto_asignado:  { type: DataTypes.STRING(80), defaultValue: "NO_DATA"},
        fecha_reporte: { type: DataTypes.DATE},
        fecha_resolucion: { type: DataTypes.DATE},
    }, {
        freezeTableName: true
    });
    error.associate = function (models){
        error.belongsTo(models.caso_prueba, { foreignKey: 'id_caso_prueba'});
    };
 
    return error;
};