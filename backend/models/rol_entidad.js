'use strict';
module.exports = (sequelize, DataTypes) => {
    const rol_entidad = sequelize.define('rol_entidad', {
        external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 },
        estado: {type: DataTypes.BOOLEAN, defaultValue: true}
    }, {freezeTableName: true});

    rol_entidad.associate = function (models) {
        rol_entidad.belongsTo(models.rol, {foreignKey: 'id_rol'});
        rol_entidad.belongsTo(models.entidad, {foreignKey: 'id_entidad'});
        rol_entidad.hasMany(models.rol_proyecto, { foreignKey: 'id_rol_entidad', as: 'rol_entidad' });
    }

    return rol_entidad;    
};