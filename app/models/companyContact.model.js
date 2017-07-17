"use strict";

module.exports = function (sequelize, DataTypes) {
    var CompanyContact = sequelize.define('companyContact', {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        companyId: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        contactId: {
            type: DataTypes.BIGINT,
            allowNull: false
        }
    }, {
        classMethods: {
            associate: function (models) {
                CompanyContact.belongsTo(models.company, {
                    foreignKey: 'companyId'
                });
                CompanyContact.belongsTo(models.contact, {
                    foreignKey: 'contactId'
                });
            }
        },
        freezeTableName: true, // Model tableName will be the same as the model name
        timestamps: true,
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
        deletedAt: 'destroyTime',
        paranoid: true
    });
    return CompanyContact;
};
