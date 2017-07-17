"use strict";

module.exports = function (sequelize, DataTypes) {
    var Review = sequelize.define('review', {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        companyId: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        email: {
            type: DataTypes.TEXT
                //            allowNull: false
        },
        contactId: {
            type: DataTypes.BIGINT
                //            allowNull: false
        },
        scoreFood: {
            type: DataTypes.NUMERIC(2, 1)
        },
        scoreService: {
            type: DataTypes.NUMERIC(2, 1)
        },
        scoreClean: {
            type: DataTypes.NUMERIC(2, 1)
        },
        contactInfo: {
            type: DataTypes.TEXT
        },
        contactInfoType: {
            type: DataTypes.ENUM('EMAIL', 'PHONE', 'OTHER'),
            allowNull: false
        },
        question1: {
            type: DataTypes.TEXT
        },
        question2: {
            type: DataTypes.TEXT
        },
        question3: {
            type: DataTypes.TEXT
        },
        uuid: {
            type: DataTypes.UUID
        }
    }, {
        classMethods: {
            associate: function (models) {
                Review.belongsTo(models.company, {
                    foreignKey: 'companyId'
                });
                Review.belongsTo(models.contact, {
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

    return Review;
};
