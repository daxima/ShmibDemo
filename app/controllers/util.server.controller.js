var model = require('../models/config.js');
var cbuilder = require('../../util/criteria-builder.js');
var logger = require('../../logger.js');
var jwt = require('jsonwebtoken');
var config = require('../../config');
var pageUtil = require('../../util/page-util.js');

module.exports = function (app) {
    app.route('/api/referenceItem/get').get(api_getReferenceItem);
};

var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

var api_getReferenceItem = function (req, res) {

    try {
        var vmodel = new vmodel_getReferenceItem(req.query);
        vmodel.validate();
        var criteria = cbuilder.new();
        criteria.where('refGroup', vmodel.group);

        model.referenceItem.findAll(criteria.obj())
            .then(function (result) {
                res.json(result);
            }).catch(function (err) {
                pageUtil.responseWithError(res, err);
            });
    } catch (err) {
        pageUtil.responseWithError(res, err);
    }
};



function vmodel_addReferenceItem(input) {

    this.refGroup = input.refGroup;
    this.refCode = input.refCode;
    this.description = input.description;

    this.validate = function () {
        if (this.refGroup == null) {
            throw new Error('reference group is required.');
        }
        if (this.refCode == null) {
            throw new Error('reference code is required.');
        }
    }
}

function vmodel_getReferenceItem(input) {
    this.group = input.group;
    this.validate = function () {
        if (this.group == null) {
            throw new Error('group is required.');
        }
    }
}
