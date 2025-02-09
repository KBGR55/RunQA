'use strict';
module.exports = (sequelize, DataTypes) => {
    const caso_prueba = sequelize.define('caso_prueba', {
        external_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4, unique: true
        },
        nombre: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        estado: {
            type: DataTypes.ENUM('DISENADO',
                'REVISADO',
                'PENDIENTE',
                'EN PROGRESO',
                'BLOQUEADO',
                'DUPLICADO',
                'OBSOLETO',
                'NO APLICABLE',
                'FALLIDO',
                'EXITOSO',
                'CERRADO',
                'REABIERTO'),
            allowNull: false,
            defaultValue: 'DISENADO'
        },
        estadoAsignacion: {
            type: DataTypes.ENUM('ASIGNADO', 'NO ASIGNADO', 'REASIGNADO'),
            allowNull: false,
            defaultValue: 'NO ASIGNADO'
        },
        descripcion: {
            type: DataTypes.STRING(350),
            allowNull: true
        },
        precondiciones: {
            type: DataTypes.STRING(350),
            allowNull: true
        },
        datos_entrada: {
            type: DataTypes.STRING(350),
            allowNull: true
        },
        pasos: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        resultado_esperado: {
            type: DataTypes.STRING(350),
            allowNull: false
        },
        resultado_obtenido: {
            type: DataTypes.STRING(350),
            allowNull: true
        },
        clasificacion: {
            type: DataTypes.ENUM('ALTA', 'MEDIA', 'BAJA'),
            allowNull: false,
            defaultValue: 'MEDIA'
        },
        tipo_prueba: {
            type: DataTypes.ENUM(
                'FUNCIONAL',
                'INTEGRACION',
                'SISTEMA',
                'REGRESION',
                'EXPLORATORIA',
                'ACEPTACION USUARIO',
                'RENDIMIENTO',
                'SEGURIDAD'
            ),
            allowNull: false
        },
        fecha_disenio: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        fecha_ejecucion_prueba: {
            type: DataTypes.DATE
        },
        fecha_limite_ejecucion: {
            type: DataTypes.DATE
        }
    }, {
        freezeTableName: true
    });

    caso_prueba.associate = function (models) {
        caso_prueba.belongsTo(models.proyecto, { foreignKey: 'id_proyecto' });
        caso_prueba.hasMany(models.error, { foreignKey: 'id_caso_prueba', as: 'error' });
        caso_prueba.hasOne(models.contrato, { foreignKey: 'id_caso_prueba', as: 'contrato' });
        caso_prueba.belongsTo(models.funcionalidad, { foreignKey: 'id_funcionalidad'});

    };

    return caso_prueba;
};