"use strict";

module.exports = function (sequelize, DataTypes) {
    var customLabels = sequelize.define('customLabels', {
         id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        company_id: {
            type: DataTypes.BIGINT
            
        },
        Q_id: {
            type: DataTypes.BIGINT
            
        },
        Q_text: {
            type: DataTypes.TEXT
           
        },
        Q_active: {
            type: DataTypes.BOOLEAN
        }
    }, {
        
        freezeTableName: true,// Model tableName will be the same as the model name
        timestamps: true,
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
        deletedAt: 'destroyTime'
      
    });
    return customLabels;
};
