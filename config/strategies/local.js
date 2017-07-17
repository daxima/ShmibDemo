// Invoke 'strict' JavaScript mode
'use strict';

var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    crypto = require('crypto'),
    models = require('../../app/models'),
    sequelize = require('sequelize');


module.exports = function () {

    var Contact = models.contact;
    passport.use(new LocalStrategy({
        usernameField: 'userName',
        passwordField: 'pwdHash',
        passReqToCallback: true
    }, function (req, userName, pwdHash, done) {

        // Use the 'Contact' model 'findOne' method to find a user with the current username
        Contact.findOne({
            where: {
                userName: {
                    $iLike: '%' + userName + '%'
                }
            }
        }).then(function (user) {

            if (!user) {
                return done(null, false, req.flash('signinMessage', 'Invalid Username or Password.'));
            }

            // If the passport is incorrect, continue to the next middleware with an error message
            var salt = user.pwdSalt;
            var hashpassword = crypto.pbkdf2Sync(pwdHash, salt, 10000, 64).toString('base64');


            if (hashpassword != user.pwdHash) {
                return done(null, false, req.flash('signinMessage', 'Invalid Username or Password.'));
            }

            // Otherwise, continue to the next middleware with the user object
            return done(null, user);

        }, function (err) {
            return done(err);
        });
    }));
};
