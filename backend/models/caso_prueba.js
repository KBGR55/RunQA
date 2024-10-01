'use strict';
module.exports = (sequelize, DataTypes) => {
    const caso_prueba = sequelize.define('caso_prueba', {
        external_id: {  type: DataTypes.UUID,  defaultValue: DataTypes.UUIDV4 },
        nombre: {  type: DataTypes.STRING(50), allowNull: false },
        estado:{type: DataTypes.EMUN('OBSOLETO','DUPLICADO','BLOQUEADO','RECHAZADO', 'APROBADO'), },
        descripcion: { type: DataTypes.STRING(255),  allowNull: true },
        resultado_esperado: {  type: DataTypes.STRING(255),   allowNull: false   },
        resultado_obtenido: {   type: DataTypes.STRING(255),  allowNull: true  },
        prioridad: {  type: DataTypes.ENUM('ALTA', 'MEDIA', 'BAJA'), allowNull: false,  defaultValue: 'MEDIA'  }
    }, {
        freezeTableName: true
    });

    caso_prueba.associate = function(models) {
        // Aquí puedes agregar asociaciones si lo necesitas
    };

    return caso_prueba;
};
