var model = require('../models/config.js');
var cbuilder = require('../../util/criteria-builder.js');
var logger = require('../../logger.js');
var jwt = require('jsonwebtoken');
var config = require('../../config');
var passport = require('passport');
var pageUtil = require('../../util/page-util.js');

module.exports = function (app) {

    var bearerAuth = passport.authenticate('bearer', {
        session: false
    });
    app.route('/api/user/update').post(bearerAuth, api_update);
    app.route('/api/user/business/list').get(api_list);
    app.route('/api/user/get').get(api_get);
    app.route('/api/user/profile').get(api_getProfile);
};

var api_update = function (req, res) {

    try {

        model.db.transaction(function (tx) {
            var pm = model.db.authenticate();

            var vmodel = new vmodel_update(req.body);
            vmodel.validate();
            if (req.user != null) {
                vmodel.contactId = req.user.id;
            }

            var userprofile = null;
            pm.then(function () {
                    return model.contact.findOne({
                        where: {
                            userName: {
                                $iLike: vmodel.userName
                            },
                            id: {
                                $ne: vmodel.id
                            }
                        }
                    });
                })
                .then(function (email) {
                    if (!email) {
                        return model.contact.update({
                            firstName: vmodel.firstName,
                            lastName: vmodel.lastName,
                            userName: vmodel.userName,
                            phoneNumber: vmodel.phoneNumber,
                            reviewCount: vmodel.reviewCount,
                            profileImage: vmodel.profileImage,
                            enableNotifications: vmodel.enableNotifications
                        }, {
                            where: {
                                id: vmodel.id
                            }
                        })
                    } else {
                        res.json({
                            status: 'Email is already in use.',
                            Id: vmodel.id
                        });
                    }
                })
                .then(function (result) {
                    userprofile = result;
                })
                .then(function () {
                    res.json({
                        status: 'update successful!',
                        Id: userprofile.id
                    });
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

var api_get = function (req, res) {

    try {
        var pm = model.db.authenticate();
        var vmodel = null;

        if (req.query.id != undefined && req.query.id != null) {
            vmodel = new vmodel_get(req.query);
        } else if (req.user != undefined && req.user != null) {
            vmodel = new vmodel_get(req.user);
        }
        vmodel.validate();

        var criteria = cbuilder.new();
        criteria.where('id', vmodel.id);

        criteria.attributes(['id', 'firstName', 'lastName', 'userName', 'contactType', 'phoneNumber', 'reviewCount', 'verifyemail', 'profileImage', 'enableNotifications']);
        model.contact.findOne(criteria.objWithAttributes())
            .then(function (result) {
                res.status(200).json(result);

            }).catch(function (err) {
                pageUtil.responseWithError(res, err);
            });
    } catch (err) {
        pageUtil.responseWithError(res, err);
    }
}

var api_getProfile = function (req, res) {

    try {
        var pm = model.db.authenticate();
        var user = null;
        var vmodel = new vmodel_profile(req.user);
        vmodel.validate();
        var criteria = cbuilder.new();
        criteria.where('id', vmodel.id);

        // Always send profile image for now for backward compatibility.
        var attr = ['id', 'firstName', 'lastName', 'userName', 'verifyemail']
            /*
            if (req.query.includeProfileImage == 'true') {
                attr.push('profileImage')
            }*/
        criteria.attributes(attr);

        pm.then(function () {
            return model.contact.findOne(criteria.objWithAttributes())
        }).then(function (result) {
            user = result;
        }).then(function () {
            if (!user.verifyemail)
                throw new pageUtil.AppError(400, 'valid user, but not verified yet', 'BusinessRuleError');
        }).then(function () {
            res.json(user);
        }).catch(function (err) {
            return pageUtil.responseWithError(res, err);
        });
        return pm;
    } catch (err) {
        pageUtil.responseWithError(res, err);
    }
};

var api_list = function (req, res) {

    try {
        var vmodel = new vmodel_list(req.user);
        var businessList = [];

        var criteria = cbuilder.new();
        criteria.where('contactId', req.user.id);

        model.companyContact
            .findAll(criteria.obj())
            .then(function (result) {
                for (var index = 0; result.length > index; index++) {
                    businessList.push(result[index].companyId);
                }

            })
            .then(function () {
                return model.company
                    .findAll({
                        where: {
                            id: businessList
                        },
                        attributes: ['id', 'name'],
                        limit: 100
                    })
                    .then(function (result) {
                        res.json(result);
                    })
            }).catch(function (err) {
                pageUtil.responseWithError(res, err);
            });
    } catch (err) {
        pageUtil.responseWithError(res, err);
    }
};

function vmodel_update(input) {
    this.id = input.id;
    this.firstName = input.firstName;
    this.lastName = input.lastName;
    this.userName = input.userName;
    this.phoneNumber = input.phoneNumber;
    this.profileImage = input.profileImage;
    this.enableNotifications = input.enableNotifications;

    this.validate = function () {
        if (this.id == null) {
            throw new Error('contact id is required.');
        }
    }

}

function vmodel_list(input) {
    this.contactId = input.id;
}

function vmodel_get(input) {
    this.id = input.id;

    this.validate = function () {
        if (this.id == null) {
            throw new Error('contact id is required.');
        }
    }
}

function vmodel_profile(input) {
    this.id = input.id;

    this.validate = function () {
        if (this.id == null) {
            throw new Error('contact id is required.');
        }
    }
}
