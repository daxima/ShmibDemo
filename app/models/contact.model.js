"use strict";

var crypto = require('crypto'),
    passportLocalSequelize = require('passport-local-sequelize'),
    crypto = require('crypto'),
    jwt = require('jsonwebtoken'),
    config = require('../../config');

module.exports = function (sequelize, DataTypes) {
    var Contact = sequelize.define('contact', {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        firstName: {
            type: DataTypes.TEXT
                //            allowNull: false
        },
        lastName: {
            type: DataTypes.TEXT
                //            allowNull: false
        },
        userName: { //email will be Username
            type: DataTypes.TEXT,
            unique: true,
            allowNull: false
        },
        pwdSalt: {
            type: DataTypes.TEXT
        },
        pwdHash: {
            type: DataTypes.TEXT
        },
        contactType: {
            type: DataTypes.ENUM('COMPANY', 'REVIEWER'),
            allowNull: false
        },
        phoneNumber: {
            type: DataTypes.TEXT
                // allowNull: false
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        avatar: {
            type: DataTypes.BLOB
        },
        reviewCount:{
            type:DataTypes.BIGINT
        },
        verifyemail: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        profileImage: {
            type: DataTypes.BLOB
        },
		enableNotifications: {
			type:DataTypes.BOOLEAN,
			defaultValue: true
		}
    }, {
        classMethods: {
            associate: function (models) {
                Contact.hasMany(models.companyContact, {
                    onDelete: "CASCADE",
                    foreignKey: {
                        allowNull: false
                    }
                });
            }
        },
        instanceMethods: {
            toJSON: function () {
                var values = this.get();

                // create the authentication token
                var hashUser = {};

                hashUser.id = values.id;
                hashUser.userName = values.userName;
                hashUser.pwdHash = values.pwdHash;
                hashUser.firstName = values.firstName;
                hashUser.lastName = values.lastName;
                hashUser.contactType = values.contactType;
                hashUser.isActive = values.isActive;
                hashUser.createdAt = values.createdAt;
                hashUser.avatar = values.avatar;

                values.token = jwt.sign(hashUser, config.sessionSecret, {
                    expiresIn: 14400000
                });

                //                delete values.id;
                delete values.pwdSalt;
                delete values.pwdHash;

                return values;
            }
        },
        hooks: {
            beforeCreate: function (contact, done) {
                var saltVal = new Buffer(crypto.randomBytes(16).toString('base64'), 'base64').toString();
                contact.pwdSalt = saltVal;

                var cryptoPass = crypto.pbkdf2Sync(contact.pwdHash, saltVal, 10000, 64).toString('base64');
                contact.pwdHash = cryptoPass;
            }
        },
        freezeTableName: true, // Model tableName will be the same as the model name
        timestamps: true,
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
        deletedAt: 'destroyTime',
        paranoid: true

    });

    passportLocalSequelize.attachToUser(Contact, {
        usernameField: 'userName', // email is Username
        hashField: 'pwdHash',
        saltField: 'pwdSalt'
    });

    return Contact;
};
