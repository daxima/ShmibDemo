var model = require('../models/config.js');
var cbuilder = require('../../util/criteria-builder.js');
var logger = require('../../logger.js');
var passport = require('passport');
var jwt = require('jsonwebtoken');
var config = require('../../config');
var gmail = require('../../app/controllers/gmail.server.controller');
var crypto = require('crypto');
var moment = require('moment');
var pageUtil = require('../../util/page-util.js');

module.exports = function (app) {

    var bearerAuth = passport.authenticate('bearer', {
        session: false
    });
    app.route('/api/auth/login').post(api_authUser);
    app.route('/api/auth/login/biz').post(api_authUser);
    app.route('/api/auth/emailcheck').get(api_emailcheck);
    app.route('/api/auth/signup').post(api_add);
    app.route('/api/auth/resetpassword').post(api_resetpassword);
    app.route('/api/auth/updatepassword').post(bearerAuth, api_updatepassword);
    app.route('/api/auth/changepassword').post(api_changepassword);
    app.route('/api/auth/changepassword/:resettoken').post(api_changepasswordWithResetToken);
    app.route('/api/auth/forgotpassword').post(api_sendForgotPassword);
    app.route('/api/auth/emailverification').get(api_emailverification);
    app.route('/api/auth/logout').get(api_authLogout);
};

var api_authUser = function (req, res, next) {
    try {
        passport.authenticate('local', function (err, user, info) {
            if (err) {
                return next(err); // will generate a 500 error
            }
            // Generate a JSON response reflecting authentication status
            if (!user) {
                var fm = req.flash('signinMessage')[0];
                return res.send({
                    success: false,
                    message: fm,
                    token: null
                });
            } else {
                if (!user.verifyemail) {
                    return res.send({
                        success: false,
                        message: 'Your account is not active. Please verify your email address.',
                        token: null
                    });
                }
            }
            req.login(user, function (err) {
                if (err) {
                    return next(err);
                }
                var hashUser = {};
                hashUser.id = user.id;
                var expiresInSeconds = 60 * 60 * 24 * 7; // 1 week.
                var expirationDate = moment().add(expiresInSeconds, 'seconds');
                var token = jwt.sign(hashUser, config.sessionSecret, {
                    expiresIn: expiresInSeconds
                });
                return res.send({
                    success: true,
                    message: 'Success',
                    userid: user.id,
                    token: token,
                    expiration: expirationDate,
                    contactType: user.contactType
                });
            });
        })(req, res, next);
    } catch (err) {
        pageUtil.responseWithError(res, err);
    }
};

var api_emailcheck = function (req, res) {

    try {
        var vmodel = new vmodel_emailcheck(req.query);
        var criteria = cbuilder.new();

        var email = null;

        if (vmodel.isContact) {
            criteria.iLike('userName', vmodel.email);
            model.contact
                .findOne(criteria.obj())
                .then(function (email) {
                    if (!email) {
                        res.json({
                            'valid': true
                        })
                    } else {
                        res.json({
                            'valid': false
                        })
                    }
                }).catch(function (err) {
                    pageUtil.responseWithError(res, err);
                });
        } else {
            criteria.iLike('email', vmodel.email);
            model.company
                .findOne(criteria.obj())
                .then(function (email) {
                    if (!email) {
                        res.json({
                            'valid': true
                        })
                    } else {
                        res.json({
                            'valid': false
                        })
                    }
                }).catch(function (err) {
                    pageUtil.responseWithError(res, err);
                });
        }
    } catch (err) {
        pageUtil.responseWithError(res, err);
    }
};

var api_add = function (req, res) {
    try {
        var token = null;
        model.db.transaction(function (tx) {
            var pm = model.db.authenticate();

            var vmodel = new vmodel_add(req.body);

            var criteria = cbuilder.new();
            criteria.iLike('userName', vmodel.userName);

            //vmodel.validate();

            vmodel.contactInfoType = 'EMAIL';
            var contact = null;
            var contactObj = {};

            if (req.user != null) {
                vmodel.contactId = req.user.id;
            }


            pm.then(function () {
                    return model.contact.findOne(criteria.obj())
                })
                .then(function (email) {
                    if (!email) {
                        return model.contact.create(vmodel);
                    } else {
                        res.json({
                            status: 'Email is already in use.',
                            contact: null
                        });

                    }
                })
                .then(function (result) {
                    contact = result;
                })
                .then(function () {

                    contactObj = model.contact.build({
                        id: contact.id,
                        firstName: contact.firstName,
                        lastName: contact.lastName,
                        userName: contact.userName,
                        pwdHash: contact.pwdHash,
                        phoneNumber: contact.phoneNumber,
                        contactType: contact.contactType,
                        isActive: contact.isActive,
                        createdAt: contact.createdAt
                    }).toJSON();

                    var hashUser = {};
                    hashUser.id = contact.id;
                    var expiresInSeconds = 60 * 60 * 24 * 7; // 1 week.
                    var expirationDate = moment().add(expiresInSeconds, 'seconds');

                    token = jwt.sign(hashUser, config.sessionSecret, {
                        expiresIn: expiresInSeconds
                    });

                    res.json({
                        status: 'Registration successful!',
                        contact: contactObj,
                        token: token,
                        expiration: expirationDate
                    });

                    var mailInfo = {
                        to: contact.userName,
                        subject: "Shmib Email Verification",
                        message: "Thanks for Signup! <br><br> Please click the link below to verify your email. <br>",
                        urllink: config.siteProtocol + req.headers.host + "/auth/emailverification/" + token,
                        siteURL: config.siteProtocol + req.headers.host
                    }
                    gmail.SendEmail(mailInfo.to, mailInfo.subject, mailInfo.siteURL, mailInfo.message + "<a href='" + mailInfo.urllink + "'>Verify Email</a>");
                }).catch(function (err) {
                    pageUtil.responseWithError(res, err);
                });
            return pm;
        }).catch(function (err) {
            pageUtil.responseWithError(res, err);
        });
    } catch (err) {
        pageUtil.responseWithError(res, err);
    }
};

var api_resetpassword = function (req, res) {

    try {
        var username = req.body.userName;

        if ((username == undefined || username == null)) {
            res.status(200).json({
                success: "false",
                message: "Email is required."
            });
        } else {
            var criteria = cbuilder.new();
            criteria.where("userName", username);

            model.contact.findOne(criteria.obj())
                .then(function (contact) {

                    var hashUser = {};
                    hashUser.id = contact.id;
                    var token = jwt.sign(hashUser, config.sessionSecret, {
                        expiresIn: 10000
                    });

                    var mailInfo = {
                        to: contact.userName,
                        subject: "Shmib Reset Password",
                        message: "Hi, Customer <br><br> You requested to reset password. Please click the link to reset the password <br>",
                        urllink: config.siteProtocol + req.headers.host + "/auth/resetpassword/" + token,
                        siteURL: config.siteProtocol + req.headers.host
                    }

                    gmail.SendEmail(mailInfo.to, mailInfo.subject, mailInfo.siteURL, mailInfo.message + "<a href='" + mailInfo.urllink + "'>Reset Password</a>");

                    res.status(200).json({
                        success: 'true'
                    });

                })
                .error(function () {
                    res.status(200).json({
                        success: "false",
                        message: "Email does not exist."
                    });
                }).catch(function (err) {
                    pageUtil.responseWithError(res, err);
                });
        }
    } catch (err) {
        pageUtil.responseWithError(res, err);
    }
};

var api_changepassword = function (req, res) {

    try {
        jwt.verify(req.body.token, config.sessionSecret, function (err, decoded) {
            if (err) {
                res.json({
                    status: 'Invalid user!'
                });
            }
        });

        model.db.transaction(function (tx) {
            var pm = model.db.authenticate();

            var contact = '';
            if (typeof req.user !== undefined && req.user !== null) {
                var userid = req.body.uid;
                var oldPassword = req.body.oldpwd;
                var password = req.body.pwd;

                pm.then(function () {
                        return model.contact.findOne({
                            where: {
                                id: userid
                            }
                        });
                    })
                    .then(function (result) {
                        if (result) {
                            contact = result;
                        } else {
                            throw new pageUtil.AppError(403, 'Forbidden.');
                        }
                    })
                    .then(function () {
                        var salt = contact.pwdSalt;
                        var hashpassword = crypto.pbkdf2Sync(oldPassword, salt, 10000, 64).toString('base64');

                        if (contact.pwdHash != hashpassword) {
                            throw new pageUtil.AppError(400, 'Password did not match with current password.');
                        }
                    })
                    .then(function () {
                        var cryptoPass = crypto.pbkdf2Sync(password, contact.pwdSalt, 10000, 64).toString('base64');

                        return model.contact.update({
                            pwdHash: cryptoPass,
                            pwdSalt: contact.salt
                        }, {
                            where: {
                                id: contact.id
                            }
                        })
                    })
                    .then(function () {
                        res.status(200).json({
                            success: true,
                            message: 'Password updated successfully.'
                        });
                    }).catch(function (err) {
                        pageUtil.responseWithError(res, err);
                    });
            }

            return pm;
        }).catch(function (err) {
            pageUtil.responseWithError(res, err);
        });
    } catch (err) {
        pageUtil.responseWithError(res, err);
    }
};

var api_changepasswordWithResetToken = function (req, res) {

    try {
        var tuid = req.params.resettoken;
        var newpwd = req.body.newpwd;

        if ((tuid == undefined || tuid == null) || (newpwd == undefined || newpwd == null)) {
            res.status(400), json({
                status: 'token or new password are not provided.'
            }).catch(function (err) {
                pageUtil.responseWithError(res, err);
            });
        } else {
            jwt.verify(tuid, config.sessionSecret, function (err, decoded) {
                if (decoded) {
                    var contactid = decoded.id;

                    model.db.transaction(function (tx) {
                        var pm = model.db.authenticate();

                        var contact = '';
                        if (typeof req.user !== undefined && req.user !== null) {
                            var userid = contactid;
                            var password = newpwd;

                            pm.then(function () {
                                    return model.contact.findOne({
                                        where: {
                                            id: userid
                                        }
                                    });
                                })
                                .then(function (result) {
                                    if (result) {
                                        contact = result;
                                    } else {
                                        res.status(401).json({
                                            result: 'Not a valid user'
                                        });
                                    }
                                })
                                .then(function () {
                                    var cryptoPass = crypto.pbkdf2Sync(newpwd, contact.pwdSalt, 10000, 64).toString('base64');
                                    return model.contact.update({
                                        pwdHash: cryptoPass,
                                        pwdSalt: contact.salt
                                    }, {
                                        where: {
                                            id: contact.id
                                        }
                                    })
                                })
                                .then(function () {
                                    res.status(200).json({
                                        result: 'Success'
                                    });
                                }).catch(function (err) {
                                    pageUtil.responseWithError(res, err);
                                });
                        }
                        return pm;
                    }).catch(function (err) {
                        pageUtil.responseWithError(res, err);
                    });
                } else {
                    res.status(200).json({
                        status: 'failed'
                    });
                }
            });
        }
    } catch (err) {
        pageUtil.responseWithError(res, err);
    }
};

var api_sendForgotPassword = function (req, res) {

    try {
        model.db.transaction(function (tx) {
            var pm = model.db.authenticate();

            var vmodel = new vmodel_forgotPassword(req.body);
            vmodel.validate();

            var criteria = cbuilder.new();
            criteria.iLike('userName', vmodel.userEmail);
            criteria.attributes(['id', 'userName', 'verifyemail']);
            // check parameters
            model.contact.findOne(criteria.objWithAttributes()).then(function (contact) {
                if (contact) {
                    if (!contact.verifyemail) {
                        throw new pageUtil.AppError(400, 'Your account is not active. Please verify your email.');
                    }
                    var hashUser = {};
                    hashUser.id = contact.id;
                    var token = jwt.sign(hashUser, config.sessionSecret, {
                        expiresIn: 10000
                    });

                    var mailInfo = {
                        to: contact.userName,
                        subject: "Shmib Reset Password",
                        message: "Hi, Customer <br><br> You requested to reset password. Please click the link to reset the password <br>",
                        urllink: config.siteProtocol + req.headers.host + "/auth/resetpassword/" + token,
                        siteURL: config.siteProtocol + req.headers.host
                    }

                    gmail.SendEmail(mailInfo.to, mailInfo.subject, mailInfo.siteURL, mailInfo.message + "<a href='" + mailInfo.urllink + "'>Reset Password</a><br>");
                    res.status(200).json({
                        success: true,
                        message: 'Forgot password link successfully send!'
                    });
                } else {
                    throw new pageUtil.AppError(400, 'Email does not exist.');
                }
            }).catch(function (err) {
                pageUtil.responseWithError(res, err);
            });
            return pm;
        }).catch(function (err) {
            pageUtil.responseWithError(res, err);
        });
    } catch (err) {
        pageUtil.responseWithError(res, err);
    }
};

var api_emailverification = function (req, res, next) {
    //    ("------------------------------Email Verificaition by tuid--------------------------------");

    try {
        var contactid = null;
        jwt.verify(req.query.tuid, config.sessionSecret, function (err, decoded) {
            if (decoded) {
                contactid = decoded.id;
            }
        });

        model.db.transaction(function (tx) {
            var pm = model.db.authenticate();

            pm.then(function () {
                return model.contact.findOne({
                    where: {
                        id: contactid
                    }
                });
            }).then(function (contactdata) {
                if (contactdata) {
                    var contactType = contactdata.contactType;
                    var verifyemailStatus = contactdata.verifyemail;

                    if (verifyemailStatus) {
                        res.status(200).json({
                            status: 'alreadyverified',
                            contacttype: contactType
                        });
                    } else {
                        model.contact.update({
                            verifyemail: true
                        }, {
                            where: {
                                id: contactid
                            }
                        }).then(function (result) {
                            if (result) {
                                res.status(200).json({
                                    status: 'success',
                                    contacttype: contactType
                                });
                            } else {
                                res.status(200).json({
                                    status: 'failed',
                                    contacttype: ""
                                });
                            }
                        });
                    }
                } else {
                    res.status(200).json({
                        status: 'nocontact',
                        contacttype: ""
                    });
                }
            }).catch(function (err) {
                pageUtil.responseWithError(res, err);
            });
            return pm;
        }).catch(function (err) {
            pageUtil.responseWithError(res, err);
        });
    } catch (err) {
        pageUtil.responseWithError(res, err);
    }
};

var api_authLogout = function (req, res) {
    try {
        req.logout();
        res.status(200).json({
            status: 'success'
        }).catch(function (err) {
            pageUtil.responseWithError(res, err);
        });
    } catch (err) {
        pageUtil.responseWithError(res, err);
    }
}

var api_updatepassword = function (req, res) {

    try {
        model.db.transaction(function (tx) {
            var pm = model.db.authenticate();

            var vmodel = new vmodel_updatePassword(req.body);
            vmodel.validate();

            var contact = null;

            pm.then(function () {
                    return model.contact.findOne({
                        where: {
                            id: req.user.id
                        }
                    });
                })
                .then(function (result) {
                    if (result) {
                        contact = result;
                    } else {
                        res.status(401).json({
                            status: false,
                            message: 'Not a valid user.'
                        });
                    }
                })
                .then(function () {
                    var cryptoPass = crypto.pbkdf2Sync(vmodel.password, contact.pwdSalt, 10000, 64).toString('base64');
                    return model.contact.update({
                        pwdHash: cryptoPass
                    }, {
                        where: {
                            id: req.user.id
                        }
                    })
                })
                .then(function () {
                    res.status(200).json({
                        status: true,
                        message: 'Password has been updated succesfully.'
                    });
                }).catch(function (err) {
                    pageUtil.responseWithError(res, err);
                });

            return pm;
        }).catch(function (err) {
            pageUtil.responseWithError(res, err);
        });
    } catch (error) {
        pageUtil.responseWithError(res, err);
    }
};

function vmodel_add(input) {

    this.firstName = input.firstName;
    this.lastName = input.lastName;
    this.userName = input.userName;
    this.phoneNumber = input.phoneNumber;
    this.pwdHash = input.pwdHash;
    this.contactType = input.contactType;

    this.validate = function () {
        if (this.firstName == null) {
            throw new Error('first name is required.');
        }
        if (this.lastName == null) {
            throw new Error('last name is required.');
        }
        if (this.userName == null) {
            throw new Error('Email is required.');
        }
        if (this.pwdHash == null) {
            throw new Error('password is required.');
        }
    }
}

function vmodel_emailcheck(input) {
    this.isContact = input.isContact == 'true' ? true : false;
    this.email = input.email;
}

function vmodel_updatePassword(input) {
    this.password = input.pwd;

    this.validate = function () {

        if (this.password == '' || this.password == null) {
            throw new Error('password is required.');
        }

    }
}

function vmodel_forgotPassword(input) {
    this.userEmail = input.EmailAddress;

    this.validate = function () {

        if (this.userEmail == '' || this.userEmail == null) {
            throw new Error('Email is required.');
        }

    }
}
