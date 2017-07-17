"use strict"
module.exports = function (sequelize, DataTypes) {
    var ReferenceItem = sequelize.define('referenceItem', {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        refGroup: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        refCode: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT
                //            allowNull:false
        }
    }, {
        freezeTableName: true, // Model tableName will be the same as the model name
        timestamps: true,
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
        deletedAt: 'destroyTime',
        paranoid: true

    });

    return ReferenceItem;
}
