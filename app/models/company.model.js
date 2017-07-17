"use strict";

module.exports = function (sequelize, DataTypes) {
    var Company = sequelize.define('company', {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        bizType: { // RESTAURANT
            type: DataTypes.TEXT
        },
        bizSubtype: { // FOOD
            type: DataTypes.TEXT
        },
        urlName: {
            type: DataTypes.TEXT,
            unique: true
        },
        streetAddress: {
            type: DataTypes.TEXT
        },
        city: {
            type: DataTypes.TEXT
        },
        state: {
            type: DataTypes.TEXT
        },
        zip: {
            type: DataTypes.TEXT
        },
        email: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        phoneNumber: {
            type: DataTypes.TEXT
        },
        priceLevel: {
            type: DataTypes.NUMERIC(2, 1)
        },
        profileImage: {
            type: DataTypes.BLOB
        },
        bizPlacesId: {
            type: DataTypes.TEXT
        },
        averageRating: {
            type: DataTypes.NUMERIC(2, 1)
        },
        bizLat: {
            type: DataTypes.TEXT
        },
        bizLng: {
            type: DataTypes.TEXT
        },
        fromGooglePlaces: {
            type: DataTypes.BOOLEAN
        },
        enableNotifications: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        promotionImage: {
            type: DataTypes.BLOB
        },
        promotionText: {
            type: DataTypes.TEXT
        }
    }, {
        classMethods: {
            associate: function (models) {
                Company.hasMany(models.companyContact, {
                    onDelete: "CASCADE",
                    foreignKey: {
                        allowNull: false
                    }
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

    return Company;
};
