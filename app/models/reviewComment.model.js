"use strict";

module.exports = function (sequelize, DataTypes) {
    var ReviewComment = sequelize.define('reviewComment', {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        reviewId: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        pictureUploaded: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        createdBy: {
            type: DataTypes.BIGINT
                //            allowNull: false
        },
        uploadedImage: {
            type: DataTypes.BLOB,
            allowNull: true
        },
    }, {
        classMethods: {
            associate: function (models) {
                ReviewComment.belongsTo(models.review, {
                    foreignKey: 'reviewId'
                });
                ReviewComment.belongsTo(models.contact, {
                    foreignKey: 'createdBy'
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
    return ReviewComment;
};
