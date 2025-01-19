'use strict';
module.exports = (sequelize, DataTypes) => {
    const funcionalidad = sequelize.define('funcionalidad', {
        external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, unique: true },
        nombre: { type: DataTypes.STRING(100), allowNull: false, unique: true },
        descripcion: { type: DataTypes.STRING(350), allowNull: false},
        estado: {type: DataTypes.BOOLEAN, defaultValue: true},
        tipo: {type: DataTypes.ENUM("REQUISITO", "CASO DE USO", "HISTORIA DE USUARIO", "REGLA DE NEGOCIO"), defaultValue: "CASO DE USO"},
    }, {
        freezeTableName: true
    });

    funcionalidad.associate = function (models) {
        funcionalidad.belongsTo(models.entidad, { foreignKey: 'id_entidad'});
        funcionalidad.hasMany(models.caso_prueba, { foreignKey: 'id_funcionalidad', as: 'caso_prueba' });
        funcionalidad.belongsTo(models.proyecto, { foreignKey: 'id_proyecto' });
    };

    return funcionalidad;
};
