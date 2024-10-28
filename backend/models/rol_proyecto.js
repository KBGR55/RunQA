'use strict';
module.exports = (sequelize, DataTypes) => {
    const rol_proyecto = sequelize.define('rol_proyecto', {
        external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4,unique: true},
        estado: { type: DataTypes.BOOLEAN, defaultValue: true },
    }, {
        freezeTableName: true
    });

    rol_proyecto.associate = function (models) {
        rol_proyecto.belongsTo(models.rol_entidad, { foreignKey: 'id_rol_entidad' });
        rol_proyecto.belongsTo(models.proyecto, { foreignKey: 'id_proyecto' });
        rol_proyecto.hasMany(models.contrato, { foreignKey: 'id_rol_proyecto_asignado', as: 'contratos_asignados' });
        rol_proyecto.hasMany(models.contrato, { foreignKey: 'id_rol_proyecto_responsable', as: 'contratos_responsables' });
    };

    return rol_proyecto;
};
