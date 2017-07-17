// Invoke 'strict' JavaScript mode
'use strict';


var jwt = require('jsonwebtoken'),
    async = require('async'),
    config = require('../../config'),
    cbuilder = require('../../util/criteria-builder.js'),
    gmail = require('../../app/controllers/gmail.server.controller'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    crypto = require('crypto'),
    models = require('../models'),
    Company = models.company,
    Contact = models.contact,
    CompanyContact = models.companyContact,
    sequelize = require('sequelize'),
    pageUtil = require('../../util/page-util.js');

// =============================================
// Check if email is unique
// =============================================

exports.checkEmail = function (req, res) {
    try {
        var isContact = req.query.isContact == 'true' ? true : false;
        if (isContact) {
            Contact.findOne({
                where: {
                    userName: req.query.email
                }
            }).then(function (result) {
                if (!result) {
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
            Company.findOne({
                where: {
                    email: req.query.email
                }
            }).then(function (result) {
                if (!result) {
                    res.json({
                        'valid': true
                    })
                } else {
                    res.json({
                        'valid': false
                    })
                }
            }).catch(function (err) {
                pageUtil.responseWithError(res, err)
            });
        }
    } catch (err) {
        pageUtil.responseWithError(res, err);
    }
};

// =============================================
// Check if phone is unique
// =============================================

exports.checkPhone = function (req, res, next) {
    try {
        var isContact = req.query.isContact == 'true' ? true : false;
        var email = null;
        var companyList = [];
        var criteria = cbuilder.new();

        criteria.where('phoneNumber', req.query.phone);

        if (isContact) {
            if (req.user)
                criteria.not('id', req.user.id);

            Contact.findOne(criteria.obj())
                .then(function (result) {
                    email = result;
                })
                .then(function () {
                    if (!email) {
                        res.json({
                            'valid': true
                        });
                    } else {
                        res.json({
                            'valid': false
                        });
                    }
                }).catch(function (err) {
                    pageUtil.responseWithError(res, err);
                });
        } else {
            var bizCriteria = cbuilder.new();
            if (req.user)
                bizCriteria.where('contactId', req.user.id);
            CompanyContact.findAll(bizCriteria.obj())
                .then(function (result) {
                    for (var index = 0; result.length > index; index++) {
                        companyList.push(result[index].companyId);
                    }
                })
                .then(function () {
                    criteria.notIn('id', companyList);
                    return Company.findOne(criteria.obj());
                })
                .then(function (result) {
                    email = result;
                })
                .then(function () {
                    if (!email) {
                        res.json({
                            'valid': true
                        });
                    } else {
                        res.json({
                            'valid': false
                        });
                    }
                }).catch(function (err) {
                    pageUtil.responseWithError(res, err);
                });
        }
    } catch (err) {
        pageUtil.responseWithError(res, err);
    }
};

// =============================================
// Check if restaurant is unique
// =============================================
//exports.checkRestaurant = function (req, res, next) {
//
//    //postgreSQL
//    models.company.findOne({
//        where: {
//            name: req.query.company
//        }
//    }).then(function (company) {
//        if (!company) {
//            res.json({
//                'valid': true
//            })
//        } else {
//            res.json({
//                'valid': false
//            })
//        }
//    }).catch(function (err) {
//        if (err) return next(err);
//    });
//};

exports.login = function (req, res) {
    try {
        // find the user
        models.contact.findOne({
                where: {
                    userName: req.body.userName
                }
            })
            .then(function (user) {
                if (!user) {
                    res.json({
                        success: false,
                        message: 'Authentication failed. User not found.'
                    });
                } else if (user) {

                    var salt = user.pwdSalt;
                    var hashpassword = crypto.pbkdf2Sync(req.body.pwdHash, salt, 10000, 64).toString('base64');

                    if (user.pwdHash != hashpassword) {

                        res.json({
                            success: false,
                            message: 'Authentication failed. Wrong password.'
                        });
                    } else {

                        var contactObj = models.contact.build({
                            id: user.id,
                            firstName: user.firstName,
                            lastName: user.lastName,
                            userName: user.userName,
                            pwdHash: user.pwdHash,
                            contactType: user.contactType,
                            isActive: user.isActive,
                            createdAt: user.createdAt
                        }).toJSON();

                        // if user is found and password is right
                        // create a token
                        var token = jwt.sign(contactObj, config.sessionSecret, {
                            expiresIn: 14400000
                        });

                        // return the information including token as JSON
                        res.json({
                            success: true,
                            message: 'Login successful.',
                            token: token
                        }).catch(function (err) {
                            pageUtil.responseWithError(res, err);
                        });
                    }
                }
            }).catch(function (err) {
                pageUtil.responseWithError(res, err);
            });
    } catch (err) {
        pageUtil.responseWithError(res, err);
    }
};

/*
exports.createContact = function (req, res) {
    if (typeof req.body.userName === 'undefined' || req.body.userName === null) {
        return res.status(401).json({
            err: 'Not a valid request'
        });
    } else {

        async.waterfall([
		 function (callback) {
                    models.contact.create({
                        firstName: req.body.firstName,
                        lastName: req.body.lastName,
                        userName: req.body.userName, //email will be the userName, for first contact of restaurant email will be same as of restaurant
                        phoneNumber: req.body.phoneNumber,
                        pwdHash: req.body.pwdHash,
                        contactType: req.body.contactType
                    }, {
                        fields: ["firstName", "lastName", "userName", "phoneNumber", "pwdHash", "contactType", "pwdSalt"]
                    }).then(
                        function (businessContact) {
                            if (businessContact) {
                                callback(null, businessContact)
                            }
                        },
                        function (err) {
                            callback(err)
                        })
		 }
 ],
            function (err, businessContact) {
                if (err) res.status(500).json({
                    err: err
                });

                else {
                    var mailInfo = {
                        to: req.body.userName, //'rakesh.k@daxima.com',
                        subject: "Successfully Registered on Shmib.",
                        companyName: null,
                        invitee_firstname: req.body.firstName,
                        invitee_lastname: req.body.lastName,
                        firstname: req.body.firstName,
                        lastname: req.body.lastName
                    }

                    //gmail.SendEmailTemplate(mailInfo, "invitation_newuser");

                    var contactObj = models.contact.build({
                        id: businessContact.dataValues.id,
                        firstName: businessContact.dataValues.firstName,
                        lastName: businessContact.dataValues.lastName,
                        userName: businessContact.dataValues.userName,
                        pwdHash: businessContact.dataValues.pwdHash,
                        contactType: businessContact.dataValues.contactType,
                        isActive: businessContact.dataValues.isActive,
                        createdAt: businessContact.dataValues.createdAt
                    }).toJSON();
                    passport.authenticate('local')(req, res, function () {
                        return res.status(200).json({
                            status: 'Registration successful!',
                            contact: contactObj
                        });
                    });
                }
            });
    }
};

exports.addRestaurant = function (req, res) {

    if (typeof req.body.contactId === 'undefined' || req.body.contactId === null) {
        return res.status(401).json({
            err: 'Not a valid request'
        });
    } else {

        async.waterfall([
            function (callback) {
                    jwt.verify(req.body.token, config.sessionSecret, function (err, decoded) {
                        if (err) {
                            callback({
                                error: 'Invalid token'
                            })
                        } else {
                            callback(null, decoded)
                        }
                    });
      },
		 function (decoded, callback) {
                    models.company.create({
                        name: req.body.name,
                        phoneNumber: req.body.phoneNumber,
                        email: req.body.email,
                        bizType: req.body.bizType,
                        bizSubtype: req.body.bizSubtype,
                        priceLevel: req.body.priceLevel,
                        urlName: req.body.urlName,
                        streetAddress: req.body.streetAddress,
                        city: req.body.city,
                        state: req.body.state,
                        zip: req.body.zip

                    }).then(function (company) {
                            if (company) {
                                callback(null, company)
                            }
                        },
                        function (err) {
                            callback(err)
                        });
 },
		 function (company, callback) {
                    models.companyContact.create({
                        companyId: company.id,
                        contactId: req.body.contactId
                    }).then(function (companycontact) {
                            if (companycontact) {
                                callback(null, companycontact)
                            }
                        },
                        function (err) {
                            callback(err)
                        });
 }
 ],
            function (err, result) {
                if (err) res.status(500).json({
                    err: err
                });
                if (result) res.status(200).json({
                    status: 'Business added successfully!',
                    company: result.dataValues
                });

            });
    }
};

exports.addReferenceItem = function (req, res) {
    var group = req.body.refGroup;
    var code = req.body.refCode;

    if ((typeof group === 'undefined' || group === null || group === '') ||
        (typeof code === 'undefined' || code === null || code === '')) {
        return res.status(401).json({
            err: 'Not a valid request'
        });
    } else {

        async.waterfall([function (callback) {
            models.referenceItem.create({
                    refGroup: group,
                    refCode: code,
                    description: req.body.description
                })
                .then(function (item) {
                        if (item) {
                            callback(null, item)
                        }
                    },
                    function (err) {
                        callback(err)
                    });
 }], function (err, result) {
            if (err) res.status(500).json({
                err: err
            });
            if (result) res.status(200).json({
                status: 'Reference Item added successfully!',
                user: result.dataValues
            });
        })
    }
};

exports.getReferenceItem = function (req, res) {
    var group = req.query.group;
    if (typeof group === 'undefined' || group === null || group === '') {
        return res.status(401).json({
            err: 'Not a valid request'
        });
    } else {

        models.referenceItem.findAll({
                where: {
                    refGroup: group
                },
                attributes: ['id', 'refCode']
            })
            .then(function (result) {
                res.json(result);
            }, function (err) {
                res.status(401).send(err);
            });
    }
};

exports.getCurrentMonthReviews = function (req, res) {
    var companyId = req.query.companyId;
    var startDate = req.query.startDate;
    var endDate = req.query.endDate;


    if ((typeof companyId === 'undefined' || companyId === null || companyId === '') ||
        (typeof startDate === 'undefined' || startDate === null || startDate === '') ||
        (typeof endDate === 'undefined' || endDate === null || endDate === '')) {


        return res.status(401).json({
            err: 'Not a valid request'
        });
    } else {

        models.review.findAll({
                where: {
                    companyId: companyId,
                    $and: [
                        {
                            createdAt: {
                                gte: startDate
                            }
                                }
                                , {
                            createdAt: {
                                lte: endDate
                            }
                                }
                    ]
                },
				limit:100,
                attributes: ['scoreFood', 'scoreService', 'scoreClean', 'createdAt']
            })
            .then(function (result) {
                res.json(result);
            }, function (err) {

                res.status(401).send(err);
            });
    }
};
*/
//exports.logout = function (req, res) {
//    req.logout();
//    if (typeof req.query.redirect != 'undefined') {
//        res.redirect('/?redirect=' + req.query.redirect);
//    } else {
//        res.redirect('/home/review/list');
//    }
//};
//
//exports.userlogout = function (req, res) {
//    req.logout();
//    if (typeof req.query.redirect != 'undefined') {
//        res.redirect('/?redirect=' + req.query.redirect);
//    } else {
//        res.redirect('/me/review/list');
//    }
//};
/*
exports.getReviewById = function (req, res) {
    var user = '';
    var review = '';
    var reviewcomment = '';
    if (typeof req.query.reviewId === 'undefined' || req.query.reviewId === null) {
        return res.status(401).json({
            err: 'Not a valid review id'
        });
    } else {
        models.review.findOne({
                where: {
                    id: req.query.reviewId
                }
            })
            .then(function (result) {
                if (!result) {
                    return res.status(401).json({
                        err: 'record does not exist'
                    });
                } else {
                    review = JSON.parse(JSON.stringify(result));
                    models.contact.findOne({
                            where: {
                                id: result.contactId
                            }
                        })
                        .then(function (results) {
                            if (!results) {
                                return res.status(401).json({
                                    err: 'record does not exist'
                                });
                            } else {
                                user = JSON.parse(JSON.stringify(results));
                                models.reviewComment.findAll({
                                        where: {
                                            reviewId: req.query.reviewId
                                        },
										limit:100
                                    })
                                    .then(function (results) {
                                        reviewcomment = JSON.parse(JSON.stringify(results));

                                        res.json({
                                            reviewComment: reviewcomment,
                                            User: user,
                                            Review: review
                                        });
                                    }, function (err) {
                                        res.status(401).send(err);
                                    });
                            }

                        }, function (err) {
                            res.status(401).send(err);
                        });
                }
            })
    }
};

exports.getCouponById = function (req, res) {
    var user = '';
    var coupon = '';

    if (typeof req.query.couponId === 'undefined' || req.query.couponId === null) {
        return res.status(401).json({
            err: 'Not a valid coupon id'
        });
    } else {
        models.coupon.findOne({
                where: {
                    id: req.query.couponId
                }
            })
            .then(function (result) {
                if (!result) {
                    return res.status(401).json({
                        err: 'record doesnot exist'
                    });
                } else {
                    coupon = JSON.parse(JSON.stringify(result));
                    models.contact.findOne({
                            where: {
                                id: result.contactId
                            }
                        })
                        .then(function (results) {
                            if (!results) {
                                return res.status(401).json({
                                    err: 'record doesnot exist'
                                });
                            } else {
                                user = JSON.parse(JSON.stringify(results));
                                res.json({
                                    User: user,
                                    Coupon: coupon
                                });
                            }

                        }, function (err) {
                            res.status(401).send(err);
                        });
                }
            })
    }
};


exports.sendComment = function (req, res) {
    if (typeof req.body.reviewId === 'undefined' || req.body.reviewId === null) {
        return res.status(401).json({
            err: 'Not a valid request'
        });
    } else {
        async.waterfall([
              function (callback) {
                jwt.verify(req.body.token, config.sessionSecret, function (err, decoded) {
                    if (err) {
                        callback({
                            error: 'Invalid token'
                        })
                    } else {
                        callback(null, decoded)
                    }
                });
      },
		 function (decoded, callback) {
                models.reviewComment.create({
                    reviewId: req.body.reviewId,
                    description: req.body.description,
                    createdBy: req.body.createdBy
                }).
                then(function (reviewComment) {
                        if (reviewComment) {
                            callback(null, reviewComment)
                        }
                    },
                    function (err) {
                        callback(err)
                    });
		 },
            function (reviewComment, callback) {
                models.reviewComment.findAll({
                    where: {
                        reviewId: req.body.reviewId
                    },
					limit:100
                }).then(function (results) {
                        if (results) {
                            callback(null, results)
                        }
                    },
                    function (err) {
                        callback(err)
                    });
 	}], function (err, result) {
            if (err) res.status(500).json({
                err: err
            });
            if (result) {
                var review = JSON.parse(JSON.stringify(result));
                res.status(200).json({
                    status: 'Comments added successfully!',
                    reviewComment: review
                });
            }

        });
    }
};

exports.sendForgotPassword = function (req, res) {
    var email = req.body.EmailAddress;
    // check parameters
    if (!email) {} else {
        Contact.findOne({
            where: {
                userName: email
            }
        }).then(function (contact) {
            if (contact) {
                var hashUser = {};
                hashUser.id = contact.id;
                var token = jwt.sign(hashUser, config.sessionSecret, {
                    expiresIn: 10000
                });
                var mailInfo = {
                        to: email,
                        subject: "Shmib password reset",
                        urllink:  "https://" + req.headers.host + "/passwordreset/tuid/" + token
                    }
                    //gmail.SendEmailTemplate(mailInfo, "forgotpassword");
                res.status(200).json({
                    status: 'Forgot password link successfully send!'
                });
            }
        });
    }
};
*/
exports.getResetPage = function (req, res, next) {
    try {
        var token = req.params.tuid;
        var resErr = '';
        var uId = '';

        jwt.verify(token, config.sessionSecret, function (err, decoded) {
            if (err) {
                if (err.name == 'TokenExpiredError') {
                    resErr = 'LinkExpired';
                }
            } else {
                uId = decoded.id;
            }

            res.render('resetpassword', {
                "title": "Reset Password",
                "pagedata": {
                    "uid": uId,
                    "err": resErr
                }
            }).catch(function (err) {
                pageUtil.responseWithError(res, err);
            });
        }).catch(function (err) {
            pageUtil.responseWithError(res, err);
        });
    } catch (err) {
        pageUtil.responseWithError(res, err);
    }
};

exports.sendReset = function (req, res, next) {
    try {
        var userid = req.body.uid;
        var password = req.body.pwd;


        if (!userid || !password) {
            return next();
        } else {
            Contact.findOne({
                where: {
                    id: userid
                }
            }).then(function (contact) {
                if (contact) {
                    var cryptoPass = crypto.pbkdf2Sync(password, contact.pwdSalt, 10000, 64).toString('base64');
                    Contact.update({
                            pwdHash: cryptoPass,
                            pwdSalt: contact.pwdSalt
                        }, {
                            where: {
                                id: contact.id
                            }
                        })
                        .then(function (result) {
                            if (result) {
                                res.status(200).json({
                                    status: 'Success'
                                });
                            }
                        }, function (rejectedPromiseError) {
                            res.status(500).json({
                                err: "could not reset password. Please contact administrator."
                            }).catch(function (err) {
                                pageUtil.responseWithError(res, err);
                            });;
                        }).catch(function (err) {
                            pageUtil.responseWithError(res, err);
                        });

                }
            }).catch(function (err) {
                res.status(500).json({
                    err: "could not found user. Please contact administrator."
                });
            });
        }
    } catch (err) {
        pageUtil.responseWithError(res, err);
    }
};

exports.updateProfile = function (req, res) {
    if (typeof req.body.id === 'undefined' || req.body.id === null) {
        return res.status(401).json({
            err: 'Not a valid request'
        });
    } else {
        async.waterfall([
		function (callback) {
                    jwt.verify(req.body.token, config.sessionSecret, function (err, decoded) {
                        if (err) {
                            callback({
                                error: 'Invalid token'
                            })
                        } else {
                            callback(null, decoded)
                        }
                    });
      },
		 function (decoded, callback) {
                    models.companyContact
                        .findOne({
                            where: {
                                contactId: req.user.id
                            }
                        })

                    .then(function (result) {
                        if (result) {
                            callback(null, result);
                        }


                    }).error(function (err) {
                        callback(err);
                    });

            },
		 	function (companyContact, callback) {
                    models.contact.update({
                            firstName: req.body.firstName,
                            lastName: req.body.lastName,
                            userName: req.body.userName,
                            phoneNumber: req.body.cellNumber,
                            pwdHash: req.body.pwdHash,
                            contactType: req.body.contactType
                        }, {
                            where: {
                                id: companyContact.contactId
                            }
                        })
                        .then(function () {
                            callback(null, companyContact);
                        });
			},

            function (companyContact, callback) {
                    models.company.update({
                            name: req.body.name,
                            bizType: req.body.bizType,
                            bizSubtype: req.body.bizSubtype,
                            priceLevel: req.body.pricelevel,
                            streetAddress: req.body.streetAddress,
                            city: req.body.city,
                            state: req.body.state,
                            zip: req.body.zip,
                            phoneNumber: req.body.phoneNumber,
                            email: req.body.email
                        }, {
                            where: {
                                id: companyContact.companyId
                            }
                        })
                        .then(function () {
                            callback(null, companyContact);
                        });

			}
 ],
            function (err, companyContact) {
                if (err) res.status(500).json({
                    err: err
                });
                //                else
                return res.status(200).json({
                    status: 'update successful!'

                });

            });
    }
};


/*
exports.createCoupon = function (req, res) {

    async.waterfall([
		function (callback) {
                jwt.verify(req.body.token, config.sessionSecret, function (err, decoded) {
                    if (err) {
                        callback({
                            error: 'Invalid token'
                        })
                    } else {
                        callback(null, decoded)
                    }
                });
      },
		 function (decoded, callback) {

                models.companyContact
                    .findOne({
                        where: {
                            contactId: req.user.id
                        }
                    })
                    .then(function (result) {
                        if (result) {
                            callback(null, result);
                        }


                    }).error(function (err) {
                        callback(err);
                    });
            },
		 	function (companyContact, callback) {
                models.coupon.create({
                        couponType: req.body.couponType,
                        couponHeader: req.body.couponHeader,
                        couponShortDesc: req.body.couponShortDesc,
                        couponLongDesc: req.body.couponLongDesc,
                        validityDays: req.body.validityDays,
                        couponCode: req.body.couponCode,
                        isActive: req.body.isActive,
                        contactId: companyContact.contactId,
                        companyId: companyContact.companyId
                    })
                    .then(function (result) {
                            if (result) {
                                callback(null, result)
                            }
                        },
                        function (err) {
                            callback(err)
                        });
			},

 ],
        function (err, result) {
            if (err) res.status(500).json({
                err: err
            });
            if (result) {
                var coupon = JSON.parse(JSON.stringify(result));
                res.status(200).json({
                    status: 'Coupon added successfully!',
                    coupon: coupon
                });
            }

        });


};
exports.updateCoupon = function (req, res) {

    if (typeof req.body.id === 'undefined' || req.body.id === null) {
        return res.status(401).json({
            err: 'Not a valid request'
        });
    } else {
        async.waterfall([
		function (callback) {
                    jwt.verify(req.body.token, config.sessionSecret, function (err, decoded) {
                        if (err) {
                            callback({
                                error: 'Invalid token'
                            })
                        } else {
                            callback(null, decoded)
                        }
                    });
      },
		 function (decoded, callback) {

                    models.companyContact
                        .findOne({
                            where: {
                                contactId: req.user.id
                            }
                        })
                        .then(function (result) {
                            if (result) {
                                callback(null, result);
                            }
                        }).error(function (err) {
                            callback(err);
                        });

            },
		 	function (companyContact, callback) {
                    models.coupon.update({
                            couponType: req.body.couponType,
                            couponHeader: req.body.couponHeader,
                            couponShortDesc: req.body.couponShortDesc,
                            couponLongDesc: req.body.couponLongDesc,
                            validityDays: req.body.validityDays,
                            couponCode: req.body.couponCode,
                            isActive: req.body.isActive,
                            contactId: companyContact.contactId
                        }, {
                            where: {
                                id: req.body.id
                            }
                        })
                        .then(function () {
                            callback(null, companyContact);
                        });
			},

 ],
            function (err, companyContact) {
                if (err) res.status(500).json({
                    err: err
                });
                return res.status(200).json({
                    status: 'update successful!'

                });

            });
    }
};




exports.createReview = function (req, res) {
    if (typeof req.body.company === 'undefined' || req.body.company === null) {
        return res.status(401).json({
            err: 'Not a valid request'
        });
    } else {
        async.waterfall([function (callback) {
                    models.company.findOne({
                        where: sequelize.where(sequelize.fn('lower', sequelize.col('urlName')), sequelize.fn('lower', req.body.company))
                    }).then(function (company) {
                        if (company) {
                            callback(null, company)
                        }
                    }, function (err) {
                        callback(err)
                    });
           }, function (company, callback) {

                    models.review.create({
                        companyId: company.id,
                        checkNumber: req.body.checkNumber,
                        contactId: req.body.contactid,
                        email: req.body.email,
                        scoreFood: req.body.scoreFood,
                        scoreService: req.body.scoreService,
                        scoreClean: req.body.scoreClean,
                        contactInfoType: 'EMAIL'
                    }).
                    then(function (review) {
                            if (review) {
                                callback(null, review)
                            }
                        },
                        function (err) {
                            callback(err)
                        });
		 }, function (review, callback) {
                    models.reviewComment.create({
                        reviewId: review.id,
                        description: req.body.description,
                        createdBy: req.body.contactid
                    }).then(function (result) {
                            if (result) {
                                callback(null, result)
                            }
                        },
                        function (err) {
                            callback(err)
                        });
 	}
 ],
            function (err, result) {
                if (err) res.status(500).json({
                    err: err
                });
                if (result) {
                    var review = JSON.parse(JSON.stringify(result));
                    res.status(200).json({
                        status: 'Review added successfully!',
                        reviewId: review.reviewId
                    });
                }

            });

    }
};



exports.getbusinessList = function (req, res, next) {
    if (typeof req.user === 'undefined' || req.user === null) {
        return res.status(401).json({
            err: 'Not a valid request'
        });
    } else {
        models.companyContact.findAll({
                where: {
                    contactId: req.user.id
                },
                attributes: ['companyId']
            })
            .then(function (result) {

                var businessList = [];
                for (var index = 0; result.length > index; index++) {
                    businessList.push(result[index].companyId);
                }

                res.status(200).json(businessList);

            }).error(function (err) {
                return res.status(401).json({
                    err: err
                });
            });
    }
};


exports.getBusinessDetail = function (req, res, next) {

    if ((typeof req.user === 'undefined' || req.user === null) ||
        (typeof req.query.id === 'undefined' || req.query.id === null || req.query.id === '')) {
        return res.status(401).json({
            err: 'Not a valid request'
        });
    } else {
        models.company.findOne({
                where: {
                    id: req.query.id
                }
            })
            .then(function (result) {

                var business = JSON.parse(JSON.stringify(result));
                res.status(200).json(business);

            }).error(function (err) {
                return res.status(401).json({
                    err: err
                });
            });
    }
};

exports.loginUser = function (req, res, next) {
    passport.authenticate('local', function (err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(401).json({
                err: info
            });
        }
        req.logIn(user, function (err) {
            if (err) {
                return res.status(500).json({
                    err: 'Could not log in user'
                });
            }
            res.status(200).json(user);
        });
    })(req, res, next);
};

exports.getReviewByUserId = function (req, res) {
    if (typeof req.query.UserId === 'undefined' || req.query.UserId === null) {
        return res.status(401).json({
            err: 'Not a valid user id'
        });
    } else {
        models.review.findAll({
                where: {
                    contactId: req.query.UserId
                }
            })
            .then(function (result) {
                if (!result) {
                    return res.status(401).json({
                        err: 'record does not exist'
                    });
                } else {
                    var review = JSON.parse(JSON.stringify(result));
                    res.status(200).json({
                        status: 'Review added successfully!',
                        reviewComment: review,
                        contactId: contactId
                    });
                }

            })
            .error(function (err) {
                return res.status(401).json({
                    err: err
                });
            });
    }
};

exports.updateReview = function (req, res) {
    if (typeof req.user == undefined || req.user == null) {
        return res.status(401).json({
            err: 'Not a valid request'
        });
    } else {
        async.waterfall([
		function (callback) {
                    jwt.verify(req.body.token, config.sessionSecret, function (err, decoded) {
                        if (err) {
                            callback({
                                error: 'Invalid token'
                            })
                        } else {
                            callback(null, decoded)
                        }
                    });
      },
		 function (decoded, callback) {
                    models.review.update({
                            contactId: req.user.id,
                            //                            checkNumber: req.body.checkNumber,
                            email: req.body.email,
                            //                            scoreFood: req.body.scoreFood,
                            //                            scoreService: req.body.scoreService,
                            //scoreClean: req.body.scoreClean
                        }, {
                            where: {
                                id: req.body.id
                            }
                        })
                        .then(function (result) {
                            if (result) {
                                callback(null, result);
                            }
                        }).error(function (err) {
                            callback(err);
                        });
            }
        ],
            function (err, result) {
                if (err) {
                    res.status(500).json({
                        err: err
                    });
                } else {
                    return res.status(200).json({
                        status: 'record updated'
                    });
                }
            });
    }
};

exports.getAllBusiness = function (req, res) {
    if (typeof req.user !== undefined && req.user !== null) {
        models.company.findAll({
                attributes: ['id', 'name']
            })
            .then(function (result) {
                res.status(200).json(result);

            }).error(function (err) {
                return res.status(401).json({
                    err: err
                });
            });
    }
};

exports.updateUserProfile = function (req, res) {
    if (typeof req.user !== undefined && req.user !== null) {
        models.contact.update({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                userName: req.body.userName,
                phoneNumber: req.body.phoneNumber
                    // pwdHash: req.body.pwdHash,
                    // contactType: req.body.contactType
            }, {
                where: {
                    id: req.user.id
                }
            })
            .then(function (result) {
                res.status(200).json(result);

            }).error(function (err) {
                return res.status(401).json({
                    err: err
                });
            });
    }
};

exports.checkPassword = function (req, res) {
    if (typeof req.query.password === 'undefined' || req.query.password === null) {
        return res.status(401).json({
            err: 'Not a valid password'
        });
    } else {
        models.contact.findOne({
                where: {
                    id: req.query.userId
                }
            })
            .then(function (result) {
                if (!result) {
                    return res.status(401).json({
                        err: 'record does not exist'
                    });
                } else {
                    var salt = result.pwdSalt;
                    var hashpassword = crypto.pbkdf2Sync(req.query.password, salt, 10000, 64).toString('base64');
                    if (hashpassword != result.pwdHash) {
                        res.json({
                            'valid': false
                        });
                    } else {
                        res.json({
                            'valid': true
                        });
                    }
                }
            })
    }
};
*/
exports.changeUserPassword = function (req, res) {
    try {
        if (typeof req.user !== undefined && req.user !== null) {
            var userid = req.body.uid;
            var password = req.body.pwd;
            models.contact.findOne({
                where: {
                    id: userid
                }
            }).then(function (user) {
                if (user) {
                    var cryptoPass = crypto.pbkdf2Sync(password, user.pwdSalt, 10000, 64).toString('base64');
                    models.contact.update({
                            pwdHash: cryptoPass,
                            pwdSalt: user.salt
                        }, {
                            where: {
                                id: user.id
                            }
                        })
                        .then(function (result) {
                            res.status(200).json({
                                result: 'Success'
                            });
                        }).catch(function (err) {
                            logger.error('err=' + err.toString());
                            logger.error('err.sql=' + err.sql);
                            res.status(500).json({
                                err: err
                            });
                        })
                }
            }).catch(function (err) {
                logger.error('err=' + err.toString());
                logger.error('err.sql=' + err.sql);
                res.status(400).json({
                    result: 'Not a valid user'
                });
            });

        }
    } catch (err) {
        pageUtil.responseWithError(res, err);
    }
};

/*exports.signinBiz = function (req, res,next) {
	passport.authenticate('local', function(err,user,info) {
    if (err) {
      return next(err); // will generate a 500 error
    }
    // Generate a JSON response reflecting authentication status
    if (! user) {
		 var fm = req.flash('signinMessage')[0];
		 return res.send({ success : false, message : fm });
    }
    req.login(user, function(err){
      if(err){
        return next(err);
      }
      return res.send({ success : true, message : 'Success' });
    });
  })(req, res, next);
}*/
