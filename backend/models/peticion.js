'use strict';
const { UUIDV4 } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    const peticion = sequelize.define('peticion', {
        peticion: { type: DataTypes.STRING(300), defaultValue: "NO_DATA" },
        external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4},
        estado:{type: DataTypes.ENUM('ES', 'AC', 'RE'), defaultValue: 'ES'},
        tipo : {type: DataTypes.ENUM('RI', 'CC'), defaultValue: 'RI'}, //RI: Registro de ingreso, CC: Cambio de clave
        motivo_rechazo: { type: DataTypes.STRING(300), defaultValue: "NO_DATA" },
        id_rechazador_aceptador: { type: DataTypes.INTEGER, allowNull: true }
    }, {
        freezeTableName: true
    });
    peticion.associate = function (models){
        peticion.belongsTo(models.cuenta, {foreignKey: 'id_cuenta'});

    }
    return peticion;
};
