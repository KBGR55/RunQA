'use strict';
module.exports = (sequelize, DataTypes) => {
    const contrato = sequelize.define('contrato', {
        external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 ,unique: true},
        estado: { type: DataTypes.BOOLEAN, defaultValue: true },
        fecha_inicio: { type: DataTypes.DATE },
        fecha_fin: { type: DataTypes.DATE },
        tipo_contrato:{type: DataTypes.ENUM('CASO_PRUEBA', 'ERROR'),   allowNull: false  }
    }, {
        freezeTableName: true
    });

    contrato.associate = function (models) {
        contrato.belongsTo(models.rol_proyecto, { foreignKey: 'id_rol_proyecto_asignado' });
        contrato.belongsTo(models.rol_proyecto, { foreignKey: 'id_rol_proyecto_responsable' });
    };
    return contrato;
};
