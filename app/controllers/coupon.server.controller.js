var model = require('../models/config.js');
var cbuilder = require('../../util/criteria-builder.js');
var logger = require('../../logger.js');
var jwt = require('jsonwebtoken');
var config = require('../../config');
var pageUtil = require('../../util/page-util.js');

module.exports = function (app) {

    app.route('/api/coupon/list').get(api_list);
    app.route('/api/coupon/get').get(api_get);
    app.route('/api/coupon/add').post(api_add);
    app.route('/api/coupon/update').post(api_update);

};

var api_list = function (req, res) {

    try {
        var coupons = null;
        var companyContact = null;

        model.db.transaction(function (tx) {
            var pm = model.db.authenticate();

            pm.then(function () {
                    return model.companyContact.findOne({
                        where: {
                            contactId: req.user.id
                        }
                    });
                })
                .then(function (result) {
                    companyContact = result;
                })
                .then(function () {
                    return model.coupon.findAll({
                        where: {
                            companyId: companyContact.companyId
                        },
                        limit: 100,
                        order: 'id ASC'
                    })
                })
                .then(function (result) {
                    res.json({
                        status: 'Coupons retrieved successfully!',
                        user: req.user,
                        coupons: result
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
        if (typeof req.query.couponId === 'undefined' || req.query.couponId === null) {
            return res.status(401).json({
                err: 'Not a valid coupon id'
            });
        }

        var user = null;
        var coupon = null;

        model.db.transaction(function (tx) {
            var pm = model.db.authenticate();

            var vmodel = new vmodel_get(req.query);
            var criteria = cbuilder.new();
            criteria.where('id', vmodel.id);

            pm.then(function () {
                    return model.coupon.findOne(criteria.obj());
                })
                .then(function (result) {
                    coupon = result;
                })
                .then(function () {
                    return model.contact.findOne({
                        where: {
                            id: coupon.contactId
                        }
                    });
                })
                .then(function (result) {
                    user = result;
                })
                .then(function (result) {
                    res.json({
                        status: 'Coupon retrieved successfully!',
                        User: user,
                        Coupon: coupon
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

var api_add = function (req, res) {

    try {
        model.db.transaction(function (tx) {
            var pm = model.db.authenticate();

            var vmodel = new vmodel_add(req.body);
            vmodel.validate();

            if (req.user != null) {
                vmodel.contactId = req.user.id;
            }

            var companyContact = null;
            var coupon = null;

            pm.then(function () {
                    return jwt.verify(req.body.token, config.sessionSecret);
                })
                .then(function () {
                    return model.companyContact.findOne({
                        where: {
                            contactId: req.user.id
                        }
                    });
                })
                .then(function (result) {
                    companyContact = result;
                })
                .then(function () {
                    vmodel.companyId = companyContact.companyId;
                    vmodel.contactId = companyContact.contactId;
                    return model.coupon.create(vmodel);
                })
                .then(function (result) {
                    res.json({
                        status: 'Coupon created successfully!',
                        coupon: result
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

var api_update = function (req, res) {

    try {
        model.db.transaction(function (tx) {
            var pm = model.db.authenticate();

            var vmodel = new vmodel_update(req.body);
            vmodel.validate();

            if (req.user != null) {
                vmodel.contactId = req.user.id;
            }

            var companyContact = null;
            var coupon = null;

            pm.then(function () {
                    return jwt.verify(req.body.token, config.sessionSecret);
                })
                .then(function () {
                    return model.companyContact.findOne({
                        where: {
                            contactId: req.user.id
                        }
                    });
                })
                .then(function (result) {
                    companyContact = result;
                })
                .then(function () {
                    vmodel.companyId = companyContact.companyId;
                    vmodel.contactId = companyContact.contactId;

                    return model.coupon.update(vmodel, {
                        where: {
                            id: vmodel.id
                        }
                    });
                })
                .then(function (result) {
                    res.json({
                        status: 'Coupon Updated successfully!',
                        coupon: result
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

function vmodel_list(input) {
    this.companyId = input.companyId;
}

function vmodel_get(input) {

    this.id = input.couponId;
}

function vmodel_add(input) {

    this.couponType = input.couponType;
    this.couponHeader = input.couponHeader;
    this.couponShortDesc = input.couponShortDesc;
    this.couponLongDesc = input.couponLongDesc;
    this.validityDays = input.validityDays;
    this.couponCode = input.couponCode;
    this.timesUsed = input.timesUsed;
    this.isActive = input.isActive;

    this.validate = function () {
        if (this.couponHeader === null || this.couponHeader === '') {
            throw new Error('Coupon Header is required.');
        }
        if (this.validityDays === null || this.validityDays === '') {
            throw new Error('Coupon Validity is required.');
        }
    }

}

function vmodel_update(input) {

    this.id = input.id;
    this.couponType = input.couponType;
    this.couponHeader = input.couponHeader;
    this.couponShortDesc = input.couponShortDesc;
    this.couponLongDesc = input.couponLongDesc;
    this.validityDays = input.validityDays;
    this.couponCode = input.couponCode;
    this.isActive = input.isActive;

    this.validate = function () {


        if (this.id === 'undefined' || this.id === null || this.id === '') {
            throw new Error('Not a valid coupon id.');
        }
        if (this.couponHeader === null || this.couponHeader === '') {
            throw new Error('Coupon Header is required.');
        }
        if (this.validityDays === null || this.validityDays === '') {
            throw new Error('Coupon Validity is required.');
        }
    }

}
