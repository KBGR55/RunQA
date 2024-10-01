'use strict';
module.exports = (sequelize, DataTypes) => {
    const contrato = sequelize.define('contrato', {
        estado:{type: DataTypes.BOOLEAN, defaultValue: true},
        asigna_id: { type: DataTypes.INTEGER }, 
        responsable_id: { type: DataTypes.INTEGER }, 
        fecha_inicio: { type: DataTypes.DATE},
        fecha_fin: { type: DataTypes.DATE}
    }, {
        freezeTableName: true
    });
    contrato.associate = function (models){
        solicitudPublicacion.belongsTo(models.entidad, { foreignKey: 'asigna_id', as: 'asigna' });
        solicitudPublicacion.belongsTo(models.entidad, { foreignKey: 'responsable_id', as: 'responsable' });
        contrato.hasMany(models.contrato_rol, {foreignKey: 'id_contrato',as:'rol_contrato'});
        contrato.hasOne(models.cuenta, { foreignKey: 'id_contrato', as: 'cuenta'});
    };
 
    return contrato;
};