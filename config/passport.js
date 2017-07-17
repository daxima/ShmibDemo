// Invoke 'strict' JavaScript mode
'use strict';
//PostgreSQL
// Load the module dependencies
var passport = require('passport'),
    sequelize = require('sequelize'),
    models = require('../app/models'),
    LocalStrategy = require('passport-local').Strategy,
    BearerStrategy = require('passport-http-bearer').Strategy,
    crypto = require('crypto'),
    sequelize = require('sequelize'),
    jwt = require('jsonwebtoken'),
    config = require('../config');

module.exports = function () {
    var isAnonymous = false;
    passport.use(new BearerStrategy(
        function (token, cb) {
            jwt.verify(token, config.sessionSecret, function (err, decoded) {
                if (err) {
                    models.review.findOne({
                        where: {
                            uuid: token
                        }
                    }).then(function (result) {
                        if (result) {
                            isAnonymous = true;
                            passport_user = {
                                id: null,
                                isAnonymous: true
                            };
                            return cb(null, passport_user);
                        }
                    }).then(function () {
                        if (!isAnonymous)
                            return cb(null, false);
                    });
                } else {
                    var passport_user = {
                        id: decoded.id,
                        isAnonymous: false
                    };
                    return cb(null, passport_user);
                }
            });
        }));




    var Contact = models.contact;
    // Use Passport's 'serializeUser' method to serialize the user id
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    // Use Passport's 'deserializeUser' method to load the user document
    passport.deserializeUser(function (id, done) {
        Contact.findOne({
                where: {
                    id: id
                }
            })
            .then(function (user) {
                done(null, user);
            }, function (err) {
                done(err, null);
            });

    });

    // Load Passport's strategies configuration files
    require('./strategies/local.js')();


}
