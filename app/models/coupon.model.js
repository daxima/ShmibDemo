"use strict";

module.exports = function (sequelize, DataTypes) {
    var Coupon = sequelize.define('coupon', {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        companyId: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        couponType: {
            type: DataTypes.TEXT
        },
        couponHeader: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        couponShortDesc: {
            type: DataTypes.TEXT
        },
        couponLongDesc: {
            type: DataTypes.TEXT
        },
        validityDays: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        timesUsed: {
            type: DataTypes.BIGINT
        },
        couponCode: {
            type: DataTypes.TEXT
        },
         isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        contactId: {
            type: DataTypes.BIGINT
        }

    }, {
        classMethods: {
            associate: function (models) {
                Coupon.belongsTo(models.company, {
                    foreignKey: 'companyId'
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

    return Coupon;
};