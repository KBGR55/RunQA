'use strict';
module.exports = (sequelize, DataTypes) => {
    const caso_prueba = sequelize.define('caso_prueba', {
        external_id: {  type: DataTypes.UUID,  defaultValue: DataTypes.UUIDV4 },
        nombre: {  type: DataTypes.STRING(50), allowNull: false },
        estado:{type: DataTypes.ENUM('OBSOLETO','DUPLICADO','BLOQUEADO','RECHAZADO', 'APROBADO'), },
        descripcion: { type: DataTypes.STRING(255),  allowNull: true },
        resultado_esperado: {  type: DataTypes.STRING(255),   allowNull: false   },
        resultado_obtenido: {   type: DataTypes.STRING(255),  allowNull: true  },
        prioridad: {  type: DataTypes.ENUM('ALTA', 'MEDIA', 'BAJA'), allowNull: false,  defaultValue: 'MEDIA'  },
        fecha_creacion: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        fecha_actualizacion: { type: DataTypes.DATE},
    }, {
        freezeTableName: true
    });

    caso_prueba.associate = function(models) {
        caso_prueba.belongsTo(models.proyecto, { foreignKey: 'id_proyecto'});
        caso_prueba.hasMany(models.error, {foreignKey: 'id_caso_prueba',as:'error'});
        caso_prueba.hasOne(models.contrato, { foreignKey: 'id_caso_prueba', as: 'contrato'});
    };

    return caso_prueba;
};
