'use strict';
module.exports = (sequelize, DataTypes) => {
    const contrato = sequelize.define('contrato', {
        external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 },
        estado: { type: DataTypes.BOOLEAN, defaultValue: true },
        fecha_inicio: { type: DataTypes.DATE },
        fecha_fin: { type: DataTypes.DATE }
    }, {
        freezeTableName: true
    });

    contrato.associate = function (models) {
        contrato.belongsTo(models.caso_prueba, { foreignKey: 'id_caso_prueba' });
        contrato.belongsTo(models.rol_proyecto, { foreignKey: 'id_rol_proyecto_asignado' });
        contrato.belongsTo(models.rol_proyecto, { foreignKey: 'id_rol_proyecto_responsable' });
    };

    return contrato;
};
