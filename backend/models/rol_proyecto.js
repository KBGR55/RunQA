'use strict';
module.exports = (sequelize, DataTypes) => {
    const rol_proyecto = sequelize.define('rol_proyecto', {
        external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4},
    }, {
        freezeTableName: true
    });
    rol_proyecto.associate = function (models){
        rol_proyecto.hasMany(models.rol_proyecto_rol, {foreignKey: 'id_rol_proyecto',as:'rol_rol_proyecto'});
        rol_proyecto.hasOne(models.cuenta, { foreignKey: 'id_rol_proyecto', as: 'cuenta'});
    };
 
    return rol_proyecto;
};