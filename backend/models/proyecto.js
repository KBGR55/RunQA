'use strict';
module.exports = (sequelize, DataTypes) => {
    const proyecto = sequelize.define('proyecto', {
        external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, unique: true},
        estado:{type: DataTypes.BOOLEAN, defaultValue: true},
        nombre: { type: DataTypes.STRING(40), allowNull: false},
        fecha_inicio: { type: DataTypes.DATE},
        descripcion: { type: DataTypes.STRING(350), allowNull: true }
    }, {
        freezeTableName: true
    });
    proyecto.associate = function (models){
        proyecto.hasMany(models.rol_proyecto, {foreignKey: 'id_proyecto',as:'proyecto_rol'});
        proyecto.hasMany(models.caso_prueba, {foreignKey: 'id_proyecto',as:'caso_prueba'});
    };
 
    return proyecto;
};