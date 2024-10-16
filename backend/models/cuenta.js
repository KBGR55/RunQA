'use strict';
module.exports = (sequelize, DataTypes) => {
    const cuenta = sequelize.define('cuenta', {
        external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4,unique: true},
        estado: { type: DataTypes.BOOLEAN, defaultValue: true },
        correo: { type: DataTypes.STRING(50), allowNull: false , unique: true},
        clave: { type: DataTypes.STRING(150), allowNull: false }
    }, {
        freezeTableName: true
    });

    cuenta.associate = function (models){
        cuenta.belongsTo(models.entidad, {foreignKey: 'id_entidad'});
    }

    return cuenta;
};