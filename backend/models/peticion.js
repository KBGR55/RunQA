'use strict';
const { UUIDV4 } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    const peticion = sequelize.define('peticion', {
        peticion: { type: DataTypes.STRING(300), defaultValue: "NO_DATA" },
        external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4},
        estado:{type: DataTypes.ENUM('ES', 'AC', 'RE'), defaultValue: 'ES'}
    }, {
        freezeTableName: true
    });
    peticion.associate = function (models){
        peticion.belongsTo(models.cuenta, {foreignKey: 'id_cuenta'});

    }
    return peticion;
};
