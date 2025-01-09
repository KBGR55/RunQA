'use strict';
module.exports = (sequelize, DataTypes) => {
    const rol = sequelize.define('rol', {
        external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 ,unique: true},
        estado: {type: DataTypes.BOOLEAN, defaultValue: true},
        nombre: {type: DataTypes.STRING(20), defaultValue: "NO_DATA"}
    }, {
        freezeTableName: true
    });
    rol.associate = function (models){
        rol.hasOne(models.rol_entidad, { foreignKey: 'id_rol', as: 'rol_entidad'});
    };
 
    return rol;
};