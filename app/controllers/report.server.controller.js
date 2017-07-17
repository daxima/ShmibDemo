var model = require('../models/config.js');
var cbuilder = require('../../util/criteria-builder.js');
var logger = require('../../logger.js');
var jwt = require('jsonwebtoken');
var config = require('../../config');
var moment = require('../../node_modules/moment/min/moment.min.js');
var pageUtil = require('../../util/page-util.js');

var async = require('async');

module.exports = function (app) {
    app.route('/api/business/report/get').get(api_getReport);
};

var api_getReport = function (req, res) {
    try {
        var reviews = {};
        var customLabels = {};

        var pm = model.db.authenticate();


        var vmodel = new vmodel_getReport(req.query);

        pm.then(function () {
            return model.review
                .findAll({
                    where: {
                        companyId: vmodel.companyId,
                        $and: [{
                            createdAt: {
                                gte: moment(new Date(vmodel.startDate))
                            }
                }, {
                            createdAt: {
                                lte: moment(new Date(vmodel.endDate))
                            }
                }]
                    },
                    limit: vmodel.limit,
                    attributes: ['scoreFood', 'scoreService', 'scoreClean', 'createdAt']
                })
                .then(function (results) {
                    reviews = results;
                })
                .then(function () {
                    var criteria = cbuilder.new();
                    criteria.where('company_id', vmodel.companyId);
                    return model.customLabels.findAll(criteria.obj())
                })
                .then(function (results) {
                    customLabels = results;
                })
                .then(function (result) {
                    res.json({
                        review: reviews,
                        customLabel: customLabels
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

function vmodel_getReport(input) {
    this.companyId = input.companyId;
    this.startDate = input.startDate;
    this.endDate = input.endDate;
    this.limit = 100;

    this.validate = function () {
        if (this.companyId == null) {
            throw new Error('business Id is required.');
        }
        if (this.startDate == null) {
            throw new Error('start date is required.');
        }
        if (this.endDate == null) {
            throw new Error('end date is required.');
        }
    }
}
