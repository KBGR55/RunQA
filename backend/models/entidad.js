'use strict';
module.exports = (sequelize, DataTypes) => {
    const entidad = sequelize.define('entidad', {
        external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, unique: true},
        estado:{type: DataTypes.BOOLEAN, defaultValue: true},
        foto: { type: DataTypes.STRING(80), defaultValue: "NO_DATA"},
        nombres: { type: DataTypes.STRING(20), defaultValue: "NO_DATA" },
        apellidos: { type: DataTypes.STRING(20), defaultValue: "NO_DATA" },
        fecha_nacimiento: { type: DataTypes.DATE},
        telefono:  { type: DataTypes.STRING(20), defaultValue: "NO_DATA", unique: true} ,
        horasDisponibles: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 8}
    }, {
        freezeTableName: true
    });
    entidad.associate = function (models){
        entidad.hasMany(models.rol_entidad, {foreignKey: 'id_entidad',as:'rol_entidad'});
        entidad.hasOne(models.cuenta, { foreignKey: 'id_entidad', as: 'cuenta'});
    };
 
    return entidad;
};