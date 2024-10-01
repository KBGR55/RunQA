'use strict';
module.exports = (sequelize, DataTypes) => {
    const error = sequelize.define('error', {
        external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4},
        nombre: { type: DataTypes.STRING(20), defaultValue: "NO_DATA" }
    }, {
        freezeTableName: true
    });
    error.associate = function (models){
        error.hasMany(models.error_rol, {foreignKey: 'id_error',as:'rol_error'});
        error.hasOne(models.cuenta, { foreignKey: 'id_error', as: 'cuenta'});
    };
 
    return error;
};