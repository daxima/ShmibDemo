// Invoke 'strict' JavaScript mode
'use strict';

var jwt = require('jsonwebtoken'),
    async = require('async'),
    config = require('../../config'),
    passport = require('passport'),
    crypto = require('crypto'),
    models = require('../models'),
    sequelize = require('sequelize'),
    moment = require('moment'),
    cbuilder = require('../../util/criteria-builder.js'),
    pageUtil = require('../../util/page-util.js');

exports.getSignIn = function (req, res, next) {

    try {
        var company = {};
        var companyId = req.params.companyId;
        var businessList = [];

        if (req.user) {

            var criteria = cbuilder.new();
            criteria.where('contactId', req.user.id);
            criteria.where('companyId', companyId);

            models.companyContact.findAll(criteria.obj())
                .then(function (result) {
                    if (result.length == 0) {
                        if (companyId != null) {
                            return res.status(401).send('Not a valid request');
                        }
                        res.locals.isCompanyAvl = null;
                        return res.redirect('/help/signup/biz/contact');
                    } else {
                        for (var index = 0; result.length > index; index++) {
                            businessList.push(result[index].companyId);
                        }

                        models.company.findAll({
                                where: {
                                    id: businessList
                                },
                                attributes: ['id', 'name', 'urlName', 'streetAddress', 'city', 'state', 'zip'],
                                limit: 100
                            })
                            .then(function (response) {
                                if (!response) {
                                    return res.status(401).json({
                                        err: 'Company Id doesnot exist'
                                    });
                                } else {
                                    company = response;
                                    res.render('index', {
                                        user: req.user,
                                        company: company
                                    });

                                }
                            }).catch(function (err) {
                                pageUtil.responseWithError(res, err);
                            });
                    }
                }).catch(function (err) {
                    pageUtil.responseWithError(res, err);
                });
        } else {
            //return res.redirect('/auth/login/biz');
            res.send('<html><body><script>window.location.href="/auth/login/biz";</script>');
        }
    } catch (err) {
        pageUtil.responseWithError(res, err);
    }
}

//exports.startReview = function (req, res) {
//    
//
//    if (!req.user) {
//
//        res.render('reviews');
//
//    } else {
//        res.render('reviews', {
//            user: req.user
//        });
//    }
//    //}
//}

exports.getReportsPage = function (req, res) {
    try {
        var companyId = req.params.companyId;
        var company = null;

        if (!req.user) {
            return res.redirect('/auth/login/biz');

        } else {

            var criteria = cbuilder.new();
            criteria.where('contactId', req.user.id);
            criteria.where('companyId', companyId);

            models.companyContact.findOne(criteria.obj())
                .then(function (result) {
                    if (!result) {
                        return res.status(401).send('Not a valid request');
                    } else {
                        companyId = result.companyId;
                    }
                }).then(function () {
                    models.company.findOne({
                        where: {
                            id: companyId
                        }
                    }).then(function (result) {
                        company = result;
                    }).then(function () {
                        res.render('reports', {
                            title: "Reports",
                            user: req.user,
                            companyId: company.id,
                            bizType: company.bizType
                        });
                    }).catch(function (err) {
                        pageUtil.responseWithError(res, err);
                    });
                }).catch(function (err) {
                    pageUtil.responseWithError(res, err);
                });
        }
    } catch (err) {
        pageUtil.responseWithError(res, err);
    }
};

exports.getSigninPage = function (req, res) {
    try {
        if (!req.user) {
            var fm = req.flash('signinMessage')[0];
            res.render('signin', {
                title: "Login",
                flashmessage: fm != undefined ? fm : "Success"
            });
        } else if (req.user && !req.user.verifyemail) {
            req.logout();
            res.render('signin', {
                title: "Login",
                flashmessage: 'Your account is not active. Please verify your email address.'
            });
        } else {
            return res.redirect('/home/review/list');
        }

    } catch (err) {
        pageUtil.responseWithError(res, err);
    }
};

exports.getSigninUserPage = function (req, res) {
    try {
        if (!req.user) {
            var fm = req.flash('signinMessage')[0];
            res.render('signinUser', {
                title: "Login",
                flashmessage: fm != undefined ? fm : "Success"
            });
        } else if (req.user && !req.user.verifyemail) {
            req.logout();
            res.render('signinUser', {
                title: "Login",
                flashmessage: 'Your account is not active. Please verify your email address.'
            });
        } else {

            return res.redirect('/me/review/list');
        }
    } catch (err) {
        pageUtil.responseWithError(res, err);
    }
};

exports.getSignUpPage = function (req, res) {
    try {
        if (req.user && res.locals.isCompanyAvl == null) {
            res.render('signup', {
                "title": "Company Signup",
                user: req.user,
                messages: req.flash(' error')
            });
        } else if (!req.user) {
            res.render('signup', {
                "title": "Company Signup",
                user: null,
                messages: req.flash(' error')
            });
        } else {
            return res.redirect('/auth/login/biz');
        }

    } catch (err) {
        pageUtil.responseWithError(res, err);
    }
};

exports.getEmailVerificationPage = function (req, res) {
    try {
        res.render('emailverification', {
            tuid: req.params.tuid
        });

    } catch (err) {
        pageUtil.responseWithError(res, err);
    }
};

exports.getProfilePage = function (req, res, next) {
    try {
        var CustomLabel = {};
        var companyId = req.params.companyId;
        if (req.user) {
            async.waterfall([
            function (callback) {
                        var criteria = cbuilder.new();
                        criteria.where('contactId', req.user.id);
                        criteria.where('companyId', companyId);

                        models.companyContact.findOne(criteria.obj())
                            .then(function (result) {
                                if (result) {
                                    callback(null, result);
                                } else {
                                    return res.status(401).send('Not a valid request');
                                }
                            }).error(function (err) {
                                callback(err, null);
                            });

            },
            function (companyContact, callback) {
                        models.customLabels
                            .findAll({
                                where: {
                                    company_id: companyContact.companyId
                                }
                            })

                            .then(function (result) {
                                if (result) {
                                    CustomLabel = result;
                                    callback(null, companyContact);
                                }
                            }).error(function (err) {
                                callback(err, null);
                            });
           },
           function (companyContact, callback) {
                        models.company
                            .findOne({
                                where: {
                                    id: companyContact.companyId
                                }
                            })

                            .then(function (company) {
                                if (company) {
                                    callback(null, company);
                                }


                            }).error(function (err) {
                                callback(err, null);
                            });
           }
          ],
                function (err, result) {
                    if (err) res.status(500).json({
                        err: err
                    });
                    if (result)
                        res.render('profile', {
                            user: req.user,
                            company: result.dataValues,
                            customLabel: CustomLabel
                        });
                });
        } else {
            return res.redirect('/auth/login/biz');
        }

    } catch (err) {
        pageUtil.responseWithError(res, err);
    }
};

exports.getCouponsPage = function (req, res) {
    try {
        if (req.user) {

            models.companyContact.findOne({
                where: {
                    contactId: req.user.id
                }
            }).then(function (result) {
                if (!result) {
                    return res.status(401).json({
                        err: 'Company Id doesnot exist'
                    });
                } else {
                    models.coupon.findAll({
                            where: {
                                companyId: result.companyId
                            },
                            limit: 100,
                            order: 'id ASC'
                        })
                        .then(function (results) {
                            res.render('coupons', {
                                user: req.user,
                                coupons: results
                            });
                        }, function (err) {
                            res.status(401).send(err);
                        });
                }
            });

        } else {
            return res.redirect('/auth/login/biz');
        }

    } catch (err) {
        pageUtil.responseWithError(res, err);
    }
};

exports.getUserReviewPage = function (req, res) {
    try {
        if (!req.user)
            return res.redirect('/auth/login');
        //            req.user = null;

        models.company.findOne({
            where: sequelize.where(sequelize.fn('lower', sequelize.col('urlName')), sequelize.fn('lower', req.params.company))
        }).then(function (result) {
            if (!result) {
                return res.status(401).send('Not a valid restaurant');
            } else {
                var restaurantName = result.name;
                var bizType = result.bizType;
                var streetAddress = result.streetAddress;
                var city = result.city;
                var state = result.state;
                var zip = result.zip;
                var promotionImage = result.promotionImage;
                var promotionText = result.promotionText;

                models.customLabels.findAll({
                        where: {
                            company_id: result.id
                        }
                    })
                    .then(function (result) {
                        res.render('userReview', {
                            restaurant: req.params.company,
                            user: req.user,
                            customLabel: result,
                            restaurantName: restaurantName,
                            biztype: bizType,
                            streetAddress: streetAddress,
                            city: city,
                            state: state,
                            zip: zip,
                            promotionImage: promotionImage,
                            promotionText: promotionText
                        });
                    }, function (err) {
                        return res.status(401).send(err);
                    });
            }
        });

    } catch (err) {
        pageUtil.responseWithError(res, err);
    }
};

exports.getUserReviewCompletePage = function (req, res) {
    try {
        if (!req.user) {
            var reviewObj = {};
            models.review.findOne({
                where: {
                    id: req.params.review_hash_id
                }
            }).then(function (result) {
                if (!result) {
                    return res.redirect('/auth/login');
                } else {
                    reviewObj = result;

                    models.company.findOne({
                        where: {
                            id: result.companyId
                        }
                    }).then(function (company) {
                        if (!company) {
                            return res.redirect('/auth/login');
                        } else {
                            res.render('userRegistration', {
                                review: reviewObj,
                                restaurant: company.urlName
                            });
                        }
                    }).catch(function (err) {
                        pageUtil.responseWithError(res, err);
                    });
                }
            })
        } else {
            return res.redirect('/auth/login'); //TODO: change to user login
        }
    } catch (err) {
        pageUtil.responseWithError(res, err);
    }
};

exports.getSignInUser = function (req, res, next) {
    try {
        if (req.user) {
            res.render('myReview', {
                user: req.user
            });
        } else {
            return res.redirect('/auth/login');
        }
    } catch (err) {
        pageUtil.responseWithError(res, err);
    }
}

exports.getSignUpUserPage = function (req, res) {
    try {

        if (!req.user) {
            res.render('signupUser', {
                "title": "User Signup",
                messages: req.flash(' error')
            });
        } else {
            return res.redirect('/auth/login');
        }

    } catch (err) {
        pageUtil.responseWithError(res, err);
    }
};

exports.getUserProfilePage = function (req, res) {
    try {
        if (req.user) {
            res.render('myprofile', {
                user: req.user
            });
        } else {
            return res.redirect('/auth/login');
        }
    } catch (err) {
        pageUtil.responseWithError(res, err);
    }
};

exports.getSignInUserDetail = function (req, res) {
    try {
        var user = '';
        var review = '';
        var reviewcomment = '';
        var companyname = '';
        var profileImage = '';
        var biztype = '';

        if (req.user || typeof req.query.token !== 'undefined') {
            if (typeof req.params.review_hash_id === 'undefined' || req.params.review_hash_id === null) {
                return res.status(500).json({
                    err: 'Not a valid review id'
                });
            } else {
                models.review.findOne({
                        where: {
                            id: req.params.review_hash_id
                        }
                    })
                    .then(function (result) {
                        if (!result) {
                            return res.status(500).json({
                                err: 'record does not exist'
                            });
                        } else {
                            review = JSON.parse(JSON.stringify(result));
                            return models.contact.findOne({
                                    where: {
                                        id: result.contactId
                                    }
                                })
                                .then(function (results) {

                                    var reviewDate = moment(review.createdAt);
                                    var dayDifference = moment().subtract(30, 'days');

                                    if (!results && (review.uuid != req.query.token || dayDifference.isAfter(reviewDate))) {
                                        return res.status(500).json({
                                            err: 'record has expired or does not exist'
                                        });
                                    } else {
                                        user = JSON.parse(JSON.stringify(results));
                                        return models.company.findOne({
                                                where: {
                                                    id: review.companyId
                                                }
                                            })
                                            .then(function (results) {
                                                if (!results) {
                                                    return res.status(500).json({
                                                        err: 'record does not exist'
                                                    });
                                                } else {
                                                    companyname = results.name;
                                                    profileImage = results.profileImage;
                                                    biztype = results.bizType;
                                                    return models.reviewComment.findAll({
                                                            where: {
                                                                reviewId: req.params.review_hash_id
                                                            },
                                                            limit: 100
                                                        })
                                                        .then(function (results) {
                                                            reviewcomment = JSON.parse(JSON.stringify(results));
                                                        })
                                                        .then(function () {
                                                            res.render('myReviewDetail', {
                                                                ReviewComment: reviewcomment,
                                                                User: user,
                                                                ReviewDetail: review,
                                                                CompanyName: companyname,
                                                                profileImage: profileImage,
                                                                biztype: biztype
                                                            });
                                                        }, function (err) {
                                                            res.status(500).send(err);
                                                        });
                                                }
                                            });
                                    }

                                }, function (err) {
                                    res.status(500).send(err);
                                });
                        }
                    }).catch(function (err) {
                        pageUtil.responseWithError(res, err);
                    });
            }
        } else {
            return res.redirect('/auth/login');
        }
    } catch (err) {
        pageUtil.responseWithError(res, err);
    }
}

exports.getchangeUserPasswordPage = function (req, res) {
    try {
        if (req.user) {
            res.render('changeUserPassword', {
                user: req.user,
                "title": " Change password",
                messages: req.flash(' error')
            });
        } else {
            return res.redirect('/auth/login');
        }

    } catch (err) {
        pageUtil.responseWithError(res, err);
    }
};

exports.logout = function (req, res) {

    try {
        req.logout();
        if (typeof req.query.redirect != 'undefined') {
            res.redirect('/?redirect=' + req.query.redirect);
        } else {
            res.redirect('/home/review/list');
        }

    } catch (err) {
        pageUtil.responseWithError(res, err);
    }
};

exports.userlogout = function (req, res) {
    try {
        req.logout();
        if (typeof req.query.redirect != 'undefined') {
            res.redirect('/?redirect=' + req.query.redirect);
        } else {
            res.redirect('/me/review/list');
        }
    } catch (err) {
        pageUtil.responseWithError(res, err);
    }
};

exports.getBizSearchPage = function (req, res) {
    try {
        if (req.user) {
            res.render('bizSearch', {
                user: req.user,
                "title": "Biz Search"
            });
        } else {
            return res.redirect('/auth/login');
        }
        /* else if (!req.user) {
                    res.render('bizSearch', {
                        user: null,
                        "title": "Biz Search"
                    });
                }*/
    } catch (err) {
        pageUtil.responseWithError(res, err);
    }
};

exports.getTermsPage = function (req, res) {
    try {
        res.render('terms', {
            "title": "Shmib Terms and Conditions"
        });
    } catch (err) {
        pageUtil.responseWithError(res, err);
    }
};

exports.getResetPasswordPage = function (req, res) {
    try {
        var user = null;
        var token = req.params.token;
        var resErr = null;

        if (req.params) {
            async.waterfall([
            function (callback) {
                        jwt.verify(req.params.token, config.sessionSecret, function (err, decoded) {
                            if (err) {
                                resErr = err.name;
                                if (err.name == 'TokenExpiredError') {
                                    resErr = 'LinkExpired';
                                }
                                callback(err, null);
                            } else {
                                callback(null, decoded);
                            }
                        });
            },
            function (decoded, callback) {
                        models.contact
                            .findOne({
                                where: {
                                    id: decoded.id
                                }
                            })
                            .then(function (result) {
                                if (result) {
                                    user = result;
                                    callback(null, user);
                                }
                            }).error(function (err) {
                                callback(err, null);
                            });
           }
          ],
                function (err, result) {
                    res.render('resetpassword', {
                        user: user,
                        token: token,
                        err: resErr
                    });
                });
        }
    } catch (err) {
        pageUtil.responseWithError(res, err);
    }
};
