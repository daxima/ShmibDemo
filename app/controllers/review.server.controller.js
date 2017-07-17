var model = require('../models/config.js');
var cbuilder = require('../../util/criteria-builder.js');
var logger = require('../../logger.js');
var jwt = require('jsonwebtoken');
var uuid = require('node-uuid');
var multer = require('multer');
var async = require('async');
var fs = require('fs');
var config = require('../../config');
var gmail = require('../../app/controllers/gmail.server.controller');
var passport = require('passport');
var path = require('path');
var mkdirp = require('mkdirp');
var pageUtil = require('../../util/page-util.js');
var moment = require('../../node_modules/moment/min/moment.min.js');

var storage = null;
var uploadedfilename = '';

module.exports = function (app) {

    var bearerAuth = passport.authenticate('bearer', {
        session: false
    });

    app.route('/api/review/list').get(bearerAuth, api_list);
    app.route('/api/review/get').get(bearerAuth, api_get);
    app.route('/api/review/add').post(api_add);
    app.route('/api/review/update').post(api_update);
    app.route('/api/review/comment/add').post(bearerAuth, api_addCommentImage);
    app.route('/api/review/comment/add-img').post(bearerAuth, api_addCommentImage);
    app.route('/api/review/comment/list').get(api_commentlist);
    app.route('/api/img/:id').get(api_getimage);
};

var api_list = function (req, res) {

    var limit = 1000;
    var skip = 0;

    try {
        var vmodel = new vmodel_list(req.query);
        if (vmodel.id != 'null') {
            var criteria = cbuilder.new();
            model.review.findAll({
                    where: {
                        companyId: vmodel.id,
                        $and: [{
                            createdAt: {
                                gte: moment(new Date(vmodel.startDate))
                            }
                        }, {
                            createdAt: {
                                lte: moment(new Date(vmodel.endDate)).add(1, 'd')
                            }
                        }]
                    },
                    offset: skip,
                    limit: limit,
                    order: [['createdAt', 'DESC']],
                    include: [{
                        model: model.contact,
                        attributes: ['id', 'firstName', 'lastName', 'reviewCount']
                    }]
                })
                .then(function (result) {
                    if (result) {
                        res.json({
                            reviews: result
                        });
                    } else {
                        res.json({
                            status: 'Invalid company!'
                        });
                    }
                })
                .catch(function (err) {
                    pageUtil.responseWithError(res, err);
                });
        } else if (vmodel.userid != 'null') {

            limit = 100;
            model.db.query('select r.*, c.name from review r join company c on r."companyId"=c.id Where r."contactId"=' + vmodel.userid + '  order by r."createdAt" DESC offset   ' + skip + ' limit ' + limit, {
                    type: model.db.QueryTypes.SELECT
                })
                .then(function (result) {
                    if (result) {
                        res.json({
                            reviews: result
                        });
                    } else {
                        res.json({
                            status: 'Invalid user!'
                        });
                    }
                })
                .catch(function (err) {
                    pageUtil.responseWithError(res, err);
                });
        }
    } catch (err) {
        pageUtil.responseWithError(res, err);
    }

};

var api_get = function (req, res) {

    try {
        var user = null;
        var review = null;
        var reviewcomment = null;
        var reviewResult = {};
        var vmodel = new vmodel_get(req.query);
        vmodel.validate();
        var criteria = cbuilder.new();
        criteria.where('id', vmodel.id);
        criteria.include([{
            model: model.company,
            attributes: ['id', 'name']
            }, {
            model: model.contact,
            attributes: ['id', 'firstName', 'lastName', 'userName', 'contactType', 'phoneNumber', 'reviewCount']
            }])
        // ===== Include related data. =====
        if (vmodel.with != null) {
            var withs = vmodel.with.split(',');
            for (var i = 0; i < withs.length; i++) {
                var wt = withs[i].trim().toLowerCase();
                if (wt == 'comment') {
                    criteria.include([{
                        model: model.reviewComment,
                        attributes: ['id', 'reviewId', 'description', 'pictureUploaded', 'uploadedImage', 'createdBy', 'createdAt'],
                    }, {
                        model: model.company,
                        attributes: ['id', 'name', 'bizType', 'profileImage']
                    }, {
                        model: model.contact,
                        attributes: ['id', 'firstName', 'lastName', 'userName', 'contactType', 'phoneNumber', 'reviewCount']
                    }]);
                }

            }
        }
        // =================================

        var hasPermission = false;
        var p1 = {
            p_review_id: vmodel.id,
            p_contact_id: req.user.id
        };
        model.db.query('select fn_contact_has_review_access(:p_review_id, :p_contact_id)', {
            replacements: p1
        }).spread(function (result, metadata) {
            if (result.length > 0 && result[0].fn_contact_has_review_access == true) {
                hasPermission = true;
            }
            if (hasPermission != true) {
                throw new pageUtil.AppError(403, 'Forbidden.');
            }
        }).then(function () {
            return model.review.findAll(criteria.obj());
        }).then(function (result) {
            reviewResult = result;
        }).then(function (result) {
            var criteria2 = cbuilder.new();
            if (reviewResult[0].contactId != null) {
                criteria2.where('contactId', reviewResult[0].contactId);
            } else {
                criteria2.where('email', reviewResult[0].email);
            }
            criteria2.where('companyId', reviewResult[0].companyId);
            return model.review.count(criteria2.obj());
        }).then(function (result) {
            res.json({
                review: reviewResult,
                reviewCount: result
            });
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

            if (vmodel.contactId == null) {
                vmodel.uuid = uuid.v1();
            }

            var company = null;
            var review = null;
            var contact = null;
            var reviewcontact = null;
            var companycontact = null;
            var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            pm.then(function (result) {
                    return model.contact.findOne({
                        where: {
                            id: vmodel.contactId
                        }

                    });
                }).then(function (result) {
                    reviewcontact = result
                    if (result != null) {
                        return model.contact.update({
                            reviewCount: result.reviewCount + 1
                        }, {
                            where: {
                                id: result.id
                            }
                        })
                    }
                })
                .then(function (result) {
                    return model.company.findOne({
                        where: {
                            urlName: {
                                $iLike: vmodel.company.trim()
                            }
                        }
                    });
                })
                .then(function (result) {
                    company = result;
                    if (company.id != null) {
                        return model.companyContact.findOne({
                            where: {
                                companyId: company.id
                            }
                        });
                    }
                })
                .then(function (result) {
                    companycontact = result;
                    if (companycontact != null) {
                        return model.contact.findOne({
                            where: {
                                id: companycontact.contactId
                            }
                        });
                    }
                })
                .then(function (result) {
                    contact = result;
                    vmodel.companyId = company.id;
                    return model.review.create(vmodel);
                })
                .then(function (result) {
                    review = result;
                })
                .then(function () {
                    if (vmodel.description != null && vmodel.description != '')
                        return model.reviewComment.create({
                            reviewId: review.id,
                            description: vmodel.description,
                            createdBy: vmodel.contactId
                        });
                })
                .then(function () {
                    //Update AverageRating by calling the function in Postgres
                    var query = "SELECT updateAverageRating_Company('" + vmodel.companyId + "');";
                    return model.db.query(query, {
                        bind: {
                            status: 'active'
                        },
                        type: model.db.QueryTypes.SELECT
                    });
                })
                .then(function () {
                    return model.appSetting.findOne({
                        where: {
                            appSettingId: 'EnableEmailNotification'
                        },
                        attributes: ['appSettingId', 'value']
                    });
                })
                .then(function (result) {
                    var today = new Date();
                    var d = today.getDate();
                    var m = monthNames[today.getMonth()];
                    var y = today.getFullYear();
                    var cDay = d + " " + m + " " + y;

                    if (company != null && result != null) {
                        if (company.enableNotifications == true && contact != null && result.value == '1') {
                            var mailInfo = {
                                to: contact.userName,
                                subject: "New Shmib for " + company.name,
                                companyname: company.name,
                                firstname: (contact.firstName != null) ? contact.firstName : contact.userName,
                                currentday: cDay,
                                pageUrl: config.siteProtocol + req.headers.host + "/home/review/list/" + company.id + "#/item/" + review.id,
                                pageLink: config.siteProtocol + req.headers.host + "/home/review/list/" + company.id + "#/item/" + review.id,
                                siteURL: config.siteProtocol + req.headers.host
                            }

                            gmail.SendReviewerEmailTemplate(mailInfo, "bizowner");
                        }
                    }
                    if (result != null && result.value == '1' && vmodel.email != null && (reviewcontact == null || reviewcontact.enableNotifications == true)) {

                        var link = config.siteProtocol + req.headers.host + "/me/review/item/" + review.id;

                        if (vmodel.uuid != null) {
                            link = link + "?token=" + vmodel.uuid;
                        }

                        var mailInfo = {
                            to: vmodel.email,
                            subject: "New Shmib for " + company.name,
                            companyname: company.name,
                            currentday: cDay,
                            pageUrl: link,
                            pageLink: link,
                            siteURL: config.siteProtocol + req.headers.host
                        }

                        gmail.SendReviewerEmailTemplate(mailInfo, "Anonymous_reviewer");
                    }
                    res.json({
                        status: 'Review added successfully!',
                        reviewId: review.id,
                        uuid: review.uuid,
                        bizId: company.id
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
        jwt.verify(req.body.token, config.sessionSecret, function (err, decoded) {
            if (err) {

                res.json({
                    status: 'Invalid user!'
                });
            }
        });
        model.db.transaction(function (tx) {
            var pm = model.db.authenticate();
            var vmodel = new vmodel_update(req.body);
            if (req.user != null) {
                vmodel.contactId = req.user.id;
            }
            pm.then(function () {
                    return model.contact.findOne({
                        where: {
                            id: vmodel.contactId
                        }

                    });
                }).then(function (result) {
                    if (result != null) {
                        return model.contact.update({
                            reviewCount: result.reviewCount + 1
                        }, {
                            where: {
                                id: result.id
                            }
                        })
                    }
                }).then(function () {
                    return model.review.update(vmodel, {
                        where: {
                            id: vmodel.id
                        }
                    })
                }).then(function () {
                    return model.review.findOne({
                        where: {
                            id: vmodel.id
                        }
                    })
                }).then(function (result) {
                    //Update AverageRating by calling the function in Postgres
                    var query = "SELECT updateAverageRating_Company('" + result.companyId + "');";
                    return model.db.query(query, {
                        bind: {
                            status: 'active'
                        },
                        type: model.db.QueryTypes.SELECT
                    });

                }).then(function () {
                    return model.reviewComment.update({
                        createdBy: vmodel.contactId
                    }, {
                        where: {
                            reviewId: vmodel.id
                        }
                    })
                })
                .then(function () {
                    res.json({
                        status: 'record updated'
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

var api_addCommentImage = function (req, res) {

    try {
        model.db.transaction(function (tx) {
            var pm = model.db.authenticate();
            var vmodel = new vmodel_addCommentImage(req.body);
            vmodel.validate();

            var criteria = cbuilder.new();
            criteria.where('reviewId', vmodel.reviewId);

            var contactId = vmodel.createdBy;

            var review = null;
            var comment = null;
            var filename = null;
            var company = null;
            var companyContact = null;
            var bizOwner = null;
            var reviewer = null;
            var reviewComment = null;
            var isNotificationEnabled = false;
            var file_extension = path.extname(vmodel.file_name).toLowerCase().substring(1);
            var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

            pm.then(function () {
                    return model.review.findOne({
                        where: {
                            id: vmodel.reviewId
                        },
                        attributes: ['contactId', 'companyId', 'email', 'uuid']
                    });
                }).then(function (result) {
                    review = result;
                }).then(function () {
                    return model.reviewComment.create({
                        reviewId: vmodel.reviewId,
                        createdBy: contactId,
                        description: vmodel.description,
                        uploadedImage: vmodel.file_data
                    });
                }).then(function (result) {
                    comment = result;
                }).then(function () {
                    return model.contact.findOne({
                        where: {
                            id: review.contactId
                        },
                        attributes: ['enableNotifications']
                    });
                }).then(function (result) {
                    reviewer = result;
                }).then(function () {
                    return model.companyContact.findOne({
                        where: {
                            companyId: review.companyId
                        },
                        attributes: ['contactId']
                    });
                }).then(function (result) {
                    companyContact = result;
                }).then(function (result) {
                    if (companyContact)
                        return model.contact.findOne({
                            where: {
                                id: companyContact.contactId
                            },
                            attributes: ['userName', 'firstName']
                        });
                }).then(function (result) {
                    bizOwner = result;
                }).then(function (result) {
                    return model.company.findOne({
                        where: {
                            id: review.companyId
                        },
                        attributes: ['id', 'name', 'enableNotifications']
                    });
                }).then(function (result) {
                    company = result;
                }).then(function () {
                    return model.appSetting.findOne({
                        where: {
                            appSettingId: 'EnableEmailNotification'
                        },
                        attributes: ['appSettingId', 'value']
                    });
                }).then(function (result) {
                    isNotificationEnabled = result.value == '1' ? true : false;
                }).then(function () {
                    return model.reviewComment.findAll(criteria.obj());
                })
                .then(function (result) {
                    reviewComment = result;
                }).then(function () {
                    var today = new Date();
                    var d = today.getDate();
                    var m = monthNames[today.getMonth()];
                    var y = today.getFullYear();
                    var cDay = d + " " + m + " " + y;
                    var templateName = "";

                    var email = review.email;
                    var sendToOwner = false;
                    var sendToReviewer = false;

                    if (email != null)
                        sendToReviewer = reviewer != null ? reviewer.enableNotifications : false;

                    sendToOwner = company.enableNotifications;

                    if (bizOwner != null && sendToOwner && isNotificationEnabled && vmodel.sendNotification) {
                        var mailInfo = {
                            to: bizOwner.userName,
                            subject: "New Comment for " + company.name,
                            companyname: company.name,
                            firstname: (bizOwner.firstName != null) ? bizOwner.firstName : bizOwner.userName,
                            currentday: cDay,
                            pageUrl: config.siteProtocol + req.headers.host + "/home/review/list/" + company.id + "#/item/" + vmodel.reviewId,
                            pageLink: config.siteProtocol + req.headers.host + "/home/review/list/" + company.id + "#/item/" + vmodel.reviewId,
                            siteURL: config.siteProtocol + req.headers.host
                        }

                        templateName = vmodel.isBizComment ? "comment_submitted" : "comment_received";
                        gmail.SendReviewerEmailTemplate(mailInfo, templateName);
                    }

                    var link = config.siteProtocol + req.headers.host + "/me/review/item/" + vmodel.reviewId;

                    if (review.contactId == null) { //anonymous review
                        sendToReviewer = true;

                        link = config.siteProtocol + req.headers.host + "/me/review/item/" + vmodel.reviewId + "?token=" + review.uuid;
                    }

                    if (sendToReviewer && isNotificationEnabled && vmodel.sendNotification) {
                        var mailInfo = {
                            to: email,
                            subject: "New Comment for " + company.name,
                            companyname: company.name,
                            currentday: cDay,
                            pageUrl: link,
                            pageLink: link,
                            siteURL: config.siteProtocol + req.headers.host
                        }
                        templateName = !vmodel.isBizComment ? "comment_submitted" : "comment_received";
                        gmail.SendReviewerEmailTemplate(mailInfo, templateName);
                    }
                    res.json({
                        success: true,
                        reviewComment: reviewComment
                    });
                }).catch(function (err) {
                    pageUtil.responseWithError(res, err);
                })
            return pm;
        }).catch(function (err) {
            pageUtil.responseWithError(res, err);
        });
    } catch (err) {
        pageUtil.responseWithError(res, err);
    }
};

var api_commentlist = function (req, res) {

    try {
        var user = '';
        var review = '';
        var reviewcomment = '';
        var companyname = '';

        var reviewId = req.query.id;

        var criteria;

        if (reviewId == 'undefined' || reviewId == null) {
            res.json({
                status: 'review id is not provided.'
            });
        } else {
            criteria = cbuilder.new()
            criteria.where('reviewId', reviewId);

            model.reviewComment
                .findAll(criteria.obj())
                .then(function (result) {
                    res.json(result);
                }).catch(function (err) {
                    pageUtil.responseWithError(res, err);
                });
        }
    } catch (err) {
        pageUtil.responseWithError(res, err);
    }
}

var api_getimage = function (req, res) {

    try {
        var contactId = null;
        var createdBy = null;
        var token = null;
        var isReview = false;
        var userForSameCompany = false;
        var reviewComment = null;

        model.db.transaction(function (tx) {
            var pm = model.db.authenticate();
            var vmodel = new vmodel_getImageId(req.params);
            vmodel.validate();

            if (req.user != null) {
                contactId = req.user.id;
            }

            token = req.query.token;

            pm.then(function (result) {
                return model.review.findOne({
                    where: {
                        uuid: token
                    },
                    attributes: ['id']

                });
            }).then(function (result) {
                if (result) {
                    isReview = true;
                } else {
                    if (token != null && token.trim().length > 0) {
                        jwt.verify(token, config.sessionSecret, function (err, decoded) {
                            if (err) {
                                res.json({
                                    status: 'Unauthorized.'
                                });
                            } else {
                                contactId = decoded.id;
                            }
                        });
                    }
                }
            }).then(function () {
                if (!isReview && contactId == null) {
                    res.json({
                        status: 'Unauthorized.'
                    });
                }
            }).then(function () {
                criteria = cbuilder.new();
                criteria.iLike('pictureUploaded', vmodel.id.split('.')[0]);
                criteria.include([{
                    model: model.review,
                    attributes: ['id', 'companyId'],
            }]);

                model.reviewComment
                    .findOne(criteria.obj())
                    .then(function (result) {
                        reviewComment = result;
                        createdBy = reviewComment.createdBy;
                        if (!isReview) {
                            model.companyContact
                                .findAndCountAll({
                                    where: {
                                        companyId: result.review.companyId,
                                        $and: {
                                            contactId: contactId
                                        }
                                    }
                                })
                                .then(function (rslt) {
                                    if (rslt.count > 0) {
                                        userForSameCompany = true;
                                    }
                                });
                        }
                    }).then(function () {
                        if (isReview && contactId != createdBy && userForSameCompany !== true) {
                            res.json({
                                status: 'Unauthorized.'
                            });
                        } else {
                            var reviewId = reviewComment.reviewId;
                            var j = 0;
                            var k = 0;

                            j = parseInt(reviewId) / 1000;

                            if (parseInt(reviewId) % 1000 != 0)
                                k = 1;

                            j = Math.floor(j)

                            var reviewToRange = j + k + '000';
                            var reviewFromRange = parseInt(reviewToRange) - 999;
                            var reviewRange = reviewFromRange + '-' + reviewToRange;

                            var filePath = './upload_files/' + reviewComment.review.companyId + '/' + reviewRange + '/' + reviewId + '/' + reviewComment.pictureUploaded;

                            res.sendFile(path.resolve(filePath));
                        }
                    }).catch(function (err) {
                        pageUtil.responseWithError(res, err);
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

    this.id = input.id;
    this.userid = input.userid;
    this.startDate = input.startDate;
    this.endDate = input.endDate;
}

function vmodel_get(input) {

    this.id = input.reviewId;
    this.with = input.with;

    this.validate = function () {
        if (this.id == null) {
            throw new Error('review id is required.');
        }
    }
}

function vmodel_getImageId(input) {
    this.id = input.id;

    this.validate = function () {
        if (this.id == null) {
            throw new Error('image is required.');
        }
    }
}

function vmodel_add(input) {

    this.contactId = input.contactId;
    this.company = input.company;
    this.contactInfoType = input.contactInfoType;
    this.scoreFood = input.scoreFood;
    this.scoreService = input.scoreService;
    this.scoreClean = input.scoreClean;
    this.email = input.email;
    this.description = input.description;
    this.question1 = input.question1;
    this.question2 = input.question2;
    this.question3 = input.question3;
    this.uuid = null;

    this.validate = function () {
        if (this.company == null) {
            throw new Error('company is required.');
        }
    }

}

function vmodel_update(input) {
    this.id = input.id;
    this.email = input.email;
    this.contactId = input.contactId;
}

function vmodel_addCommentImage(input) {

    this.supportedImageFormats = ['jpg', 'gif', 'png', 'jpeg'];

    this.reviewId = input.reviewId;
    this.file_data = input.file_data;
    this.file_name = input.file_name;
    this.description = input.description;
    this.isBizComment = input.isBizComment;
    this.sendNotification = input.sendNotification;
    this.createdBy = input.createdBy;

    this.validate = function () {
        if (this.reviewId == null) {
            throw new Error('review id is required.');
        }
        if (this.description == null && this.file_name == null) {
            throw new Error('filename or comment is required.')
        } else if (this.description == null) {
            if (this.file_data == null) {
                throw new Error('file is required.');
            }
            if (this.file_name == null) {
                throw new Error('file name is required.');
            }
            var file_extension = path.extname(this.file_name);
            if (file_extension == null || file_extension == '.' ||
                file_extension.trim().length == 0) {
                throw new Error('file name extension is required.');
            }
            file_extension = file_extension.trim().toLowerCase().substring(1);
            if (this.supportedImageFormats.indexOf(file_extension) == -1) {
                throw new Error('Unsupported file type [' + file_extension + '].');
            }
        }
    }
}
