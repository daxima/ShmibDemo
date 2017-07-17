var model = require('../models/config.js');
var cbuilder = require('../../util/criteria-builder.js');
var logger = require('../../logger.js');
var jwt = require('jsonwebtoken');
var config = require('../../config');
var pageUtil = require('../../util/page-util.js');
var NearBySearch = require("googleplaces/lib/NearBySearch");
//var TextSearch = require("googleplaces/lib/TextSearch");
var PlaceSearch = require("googleplaces/lib/PlaceSearch");
var PlaceAutocomplete = require("googleplaces/lib/PlaceAutocomplete");
var PlaceDetailsRequest = require("googleplaces/lib/PlaceDetailsRequest");

var GoogleLocations = require('google-locations');

var async = require('async');
var passport = require('passport');


module.exports = function (app) {

    var bearerAuth = passport.authenticate('bearer', {
        session: false
    });
    app.route('/api/business/checkbusinessname').get(api_checkbusinessname);
    app.route('/api/business/list').get(api_list);
    app.route('/api/business/get').get(api_get);
    app.route('/api/business/add').post(api_add);
    app.route('/api/business/google/add').post(api_addBizGoogle);
    app.route('/api/business/update').post(bearerAuth, api_update);
    app.route('/api/business/search').get(api_bizSearch);
    app.route('/api/business/user/list').get(api_bizuserlist);
    app.route('/api/business/googlesearch').get(api_bizGoogleSearch);
    app.route('/api/business/googlesearchdetail').get(api_bizGoogleSearchDetail);
    app.route('/api/business/googlesearchcities').get(api_bizGoogleSearchCities);

};

var api_checkbusinessname = function (req, res) {

    try {
        var vmodel = new vmodel_checkbusinessname(req.query);
        vmodel.validate();
        var criteria = cbuilder.new();

        criteria.where('name', vmodel.businessname);

        model.company
            .findOne(criteria.obj())
            .then(function (result) {
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
    } catch (err) {
        pageUtil.responseWithError(res, err);
    }
};

var api_list = function (req, res) {

    try {
        model.company
            .findAll({
                attributes: ['id', 'name', 'urlName']
            })
            .then(function (result) {
                res.json(result);
            }).catch(function (err) {
                pageUtil.responseWithError(res, err);
            });
    } catch (err) {
        pageUtil.responseWithError(res, err);
    }
};

var api_get = function (req, res) {
    try {
        var vmodel = new vmodel_get(req.query);

        var criteria = cbuilder.new();

        var bizAttributes = ['id', 'name', 'isActive', 'bizType', 'bizSubtype', 'urlName', 'streetAddress', 'city', 'state', 'zip', 'email', 'phoneNumber', 'bizPlacesId', 'bizLat', 'bizLng', 'averageRating', 'enableNotifications', 'promotionText'];

        if (vmodel.includeProfileImage != undefined &&
            vmodel.includeProfileImage.toLowerCase() == 'true')
            bizAttributes.push('profileImage');

        if (vmodel.includePromotionImage != undefined &&
            vmodel.includePromotionImage.toLowerCase() == 'true')
            bizAttributes.push('promotionImage');

        criteria.iLike('urlName', vmodel.name);
        criteria.where('id', vmodel.id);
        criteria.attributes(bizAttributes);

        criteria.include([{
            model: model.customLabels
    }]);

        model.company
            .findOne(criteria.objWithAttributes())
            .then(function (result) {
                res.json(result);
            }).catch(function (err) {
                pageUtil.responseWithError(res, err);
            });
    } catch (err) {
        pageUtil.responseWithError(res, err);
    }
};

var api_add = function (req, res) {

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

            var vmodel = new vmodel_add(req.body);
            vmodel.validate();

            var criteria = cbuilder.new();
            criteria.where('id', vmodel.contactId);

            var criteriaBiz = cbuilder.new();
            criteriaBiz.where('bizPlacesId', vmodel.bizPlacesId);
            criteriaBiz.attributes(['id']);

            var contact = null;
            var company = null;
            var cmp = null;
            var cmpId = null;
            var companyContacts = null;
            var contactObj = {
                contactType: 'COMPANY'
            }

            pm.then(function () {
                    return model.contact.findOne(criteria.obj());
                })
                .then(function (result) {

                    contact = result;

                })
                .then(function () {
                    if (contact.contactType == 'REVIEWER') {
                        return model.contact.update(contactObj, {
                            where: {
                                id: contact.id
                            }
                        });
                    }
                })
                .then(function () {
                    return model.company.findOne(criteriaBiz.objWithAttributes());
                })
                .then(function (result) {
                    company = result;
                })
                .then(function () {
                    if (company != null) {
                        var c1 = cbuilder.new();
                        c1.where('companyId', company.id);
                        return model.companyContact.findAll(c1.objWithAttributes());
                    }
                })
                .then(function (result) {
                    companyContacts = result;
                })
                .then(function () {
                    // If this company was already registered, throw an exception.
                    if (company != null && companyContacts != null && companyContacts.length > 0) {
                        throw new pageUtil.AppError(400, 'This Business is already registered. Please select a different business from the list or contact support@shmib.com for help.', 'BusinessRuleError');
                    }
                })
                .then(function () {
                    if (company != null && company.id > 0) {
                        return model.company.update(vmodel, {
                            where: {
                                id: company.id
                            }
                        });
                    } else {
                        return model.company.create(vmodel);
                    }
                })
                .then(function (result) {
                    cmp = result;
                })
                .then(function () {

                    if (cmp.id != null) {
                        cmpId = cmp.id;
                    } else if (company.id != null) {
                        cmpId = company.id;
                    } else if (vmodel.companyId != null) {
                        cmpId = vmodel.companyId;
                    }

                    return model.companyContact.create({
                        companyId: cmpId,
                        contactId: vmodel.contactId
                    });
                })
                .then(function () {
                    res.json({
                        status: 'Business added successfully!',
                        company: cmpId
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

var api_addBizGoogle = function (req, res) {

    try {

        model.db.transaction(function (tx) {
            var pm = model.db.authenticate();

            var vmodel = new vmodel_add(req.body);
            vmodel.validateGoogleBiz();

            var company = null;
            var status = 'Business added successfully!';

            var criteria = cbuilder.new();
            criteria.where('bizPlacesId', vmodel.bizPlacesId);

            pm.then(function () {
                    return model.company.findOne(criteria.obj());
                })
                .then(function (result) {
                    company = result;
                }).then(function () {
                    if (!company) {
                        return model.company.create(vmodel);
                    } else {
                        status = 'Business already existing, returning from DB.';
                    }
                })
                .then(function (result) {
                    if (result)
                        company = result;
                })
                .then(function () {
                    res.json({
                        status: status,
                        company: company
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
            vmodel.validateContact();
            vmodel.validateBusiness();

            if (req.user != null) {
                vmodel.contactId = req.user.id;
            }

            var company = null;
            var companyContact = null;
            vmodel.customLabelObj = req.body.customLabel;

            pm.then(function () {
                return model.contact.findOne({
                    where: {
                        userName: {
                            $iLike: vmodel.userName
                        },
                        id: {
                            $ne: req.body.id
                        }
                    }
                });
            })

            .then(function (email) {
                    if (!email) {
                        return model.contact.update(vmodel.contactObj, {
                            where: {
                                id: req.body.id
                            }
                        });
                    } else {
                        res.json({
                            status: 'Email is already in use.',
                            company: req.body.companyId
                        });
                    }
                })
                .then(function () {
                    return model.company.update(vmodel.businessObj, {
                        where: {
                            id: req.body.companyId
                        }
                    });
                })
                .then(function () {
                    return model.customLabels.findAll({
                        where: {
                            company_id: req.body.companyId
                        },
                        attributes: ['company_id', 'Q_id', 'Q_text', 'Q_active']
                    });
                })
                .then(function (result) {
                    if (result.length > 0) {
                        model.customLabels.destroy({
                            where: {
                                company_id: req.body.companyId
                            }
                        })
                    }
                })
                .then(function () {
                    model.customLabels.bulkCreate(vmodel.customLabelObj, {
                        returning: true
                    })
                })
                .then(function () {
                    res.json({
                        status: 'Profile updated successfully.',
                        company: req.body.companyId
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

var api_bizSearch = function (req, res) {
    try {
        var vmodel = new vmodel_getBizSearch(req.query);
        vmodel.validate();
        var businessList = [];
        var CompanyList = {};
        var criteria = cbuilder.new();
        criteria.iLike('name', vmodel.searchtext);
        criteria.orderBy('name', 'ASC');

        model.company
            .findAll(criteria.obj())
            .then(function (result) {
                CompanyList = result;
                res.status(200).json({
                    company: CompanyList
                });
            }).catch(function (err) {
                pageUtil.responseWithError(res, err);
            });
    } catch (err) {
        pageUtil.responseWithError(res, err);
    }
};

var api_bizuserlist = function (req, res) {

    try {
        var companyId = req.query.id;


        if (companyId == undefined || companyId == null) {
            res.status(200).json({
                status: "company id is not provided."
            }).catch(function (err) {
                pageUtil.responseWithError(res, err);
            });
        } else {
            var criteria = cbuilder.new();
            criteria.where('companyId', companyId);

            criteria.include([{
                model: model.contact,
                attributes: ['id', 'firstName', 'lastName', 'userName', 'contactType', 'phoneNumber']
        }, {
                model: model.company,
                attributes: ['id', 'name', 'bizType', 'bizSubtype', 'urlName']
        }]);
            model.companyContact.findAll(criteria.obj()).then(function (companyContact) {
                res.status(200).json(companyContact)
            }).catch(function (err) {
                pageUtil.responseWithError(res, err);
            });
        }
    } catch (err) {
        pageUtil.responseWithError(res, err);
    }
}

var api_bizGoogleSearch = function (req, res) {
    try {
        var vmodel = new vmodel_getBizGoogleSearch(req.query);
        var googleList = [];
        var googleCompObjTrim = [];
        var status = "";
        var resultArrayLength = config.googlePlacesResultLimit;
        var googlePlacesResIsZero = false;
        var parameters = {};
        var criteria = cbuilder.new();
        criteria.iLike('name', vmodel.searchtext);
        //    criteria.orderBy('name', 'ASC');

        // var nearBySearch = new TextSearch(config.googlePlacesKey, config.googlePlacesResponseType);
        //var nearBySearch = new PlaceSearch(config.googlePlacesKey, config.googlePlacesResponseType);
        var nearBySearch = new NearBySearch(config.googlePlacesKey, config.googlePlacesResponseType);

        if (vmodel.searchtext) {
            parameters = {
                location: [vmodel.bizlat, vmodel.bizlng],
                //radius: '500',
                //  rankby: "distance",
                //type: ['restaurant'],
                //keyword: vmodel.searchtext
                //radius: 20000,
                rankby: 'distance',
                //name: vmodel.searchtext
                name: 'chevron'
            };
        } else {

            parameters = {
                location: [vmodel.bizlat, vmodel.bizlng],
                //radius: 1000,
                rankby: 'distance',
                //name: 'restaurant'
                name: 'chevron'
            };
        }
        //  parameters = {
        //     location: [vmodel.bizlat, vmodel.bizlng],
        //     //radius: '500',
        //     //type: ['restaurant'],
        //     //keyword: vmodel.searchtext
        //     name: vmodel.searchtext
        // };

        async.waterfall([
        function (callback) {
                nearBySearch(parameters, function (error, respose) {
                    if (error) throw error;
                    callback(null, error, respose);
                });
        },
        function (error, respose, callback) {

                if (respose.results.length === 0 && respose.status === 'OVER_QUERY_LIMIT') {
                    googlePlacesResIsZero = true;
                    resultArrayLength = config.googlePlacesResultLimit;
                    status = "Gsearch returned 0 results: " + respose.status;
                } else if (respose.results.length === 0 && respose.status !== 'OVER_QUERY_LIMIT') {
                    googlePlacesResIsZero = true;
                    resultArrayLength = config.googlePlacesResultLimit;
                    status = "Gsearch returned 0 results for " + vmodel.searchtext + ", hence showing biz from DB";
                } else if (respose.results.length < config.googlePlacesResultLimit) {
                    resultArrayLength = respose.results.length;
                    status = "Gsearch returned " + respose.results.length + " results for " + vmodel.searchtext + ".";
                }
                if (!googlePlacesResIsZero) {
                    for (var index = 0; resultArrayLength > index; index++) {
                        googleList.push(respose.results[index].place_id);
                        googleCompObjTrim.push({
                            id: 0,
                            name: respose.results[index].name,
                            urlName: null,
                            fullStreetAddress: respose.results[index].vicinity,
                            priceLevel: respose.results[index].price_level,
                            averageRating: respose.results[index].rating,
                            bizPlacesId: respose.results[index].place_id,
                            bizLat: respose.results[index].geometry.location.lat,
                            bizLng: respose.results[index].geometry.location.lng
                        });
                    }
                }
                callback(null, googleCompObjTrim, respose);
        }

    ], function (err, result, respose) {

            if (err) return res.status(500).json({
                err: err
            });
            if (result) {
                // var googleCompObjTrim = JSON.parse(JSON.stringify(googleCompObjTrim));
                return res.status(200).json({
                    status: status,
                    googleCompObjTrim: result
                        // ,
                        // dbBizList: dbBizList,
                        //origResponse: respose
                });
            }

        });
    } catch (err) {
        pageUtil.responseWithError(res, err);
    }
};

var api_bizGoogleSearchDetail = function (req, res) {
    try {
        var vmodel = new vmodel_getBizGoogleSearchDetail(req.query);
        var placeDetailsRequest = new PlaceDetailsRequest(config.googlePlacesKey, config.googlePlacesResponseType);
        var placeId = vmodel.place_id;
        var businessObj = {};
        placeDetailsRequest({
            placeid: placeId
        }, function (error, response) {
            if (response.status === "OK") {

                var bObj_biztype = "";
                if (response.result.types.length > 0 && response.result.types.indexOf("restaurant") > -1) {
                    bObj_biztype = "Restaurant";
                }

                var address = response.result.address_components;
                var street = "";
                var street1 = "";
                var city = "";
                var state = "";
                var zip = "";

                for (items in address) {
                    var item = address[items];

                    if (item["types"].indexOf("street_number") > -1) {
                        street = item["long_name"];
                    } else if (item["types"].indexOf("route") > -1) {
                        street1 = item["long_name"];
                    } else if (item["types"].indexOf("locality") > -1) {
                        city = item["long_name"];
                    } else if (item["types"].indexOf("administrative_area_level_1") > -1) {
                        state = item["long_name"];
                    } else if (item["types"].indexOf("postal_code") > -1) {
                        zip = item["long_name"];
                    }
                }

                businessObj = {
                    contactId: null,
                    name: response.result.name,
                    email: "",
                    phoneNumber: response.result.formatted_phone_number ? response.result.formatted_phone_number : "",
                    bizType: bObj_biztype,
                    bizSubtype: null,
                    priceLevel: response.result.price_level,
                    urlName: response.result.place_id,
                    streetAddress: response.result.formatted_address,
                    street: street + ' ' + street1,
                    city: city,
                    state: state,
                    zip: zip,
                    token: null,
                    averageRating: response.result.rating,
                    bizPlacesId: response.result.place_id,
                    bizLat: response.result.geometry.location.lat,
                    bizLng: response.result.geometry.location.lng,
                    fromGooglePlaces: true
                }
            }
            return res.status(200).json({
                status: response.status,
                googleBusinessObj: businessObj
                    //,response: response
            });
        });
    } catch (err) {
        pageUtil.responseWithError(res, err);
    }
};

//cities
var api_bizGoogleSearchCities = function (req, res) {
    try {
        var vmodel = new vmodel_getBizGoogleSearch(req.query);
        var googleCityObjTrim = [];
        var status = "";
        var resultArrayLength = config.googlePlacesResultLimit;
        var googlePlacesResIsZero = false;

        var criteria = cbuilder.new();
        criteria.iLike('name', vmodel.searchtext);

        //var locations = new GoogleLocations(config.googlePlacesKey);
        var placeAutocomplete = new PlaceAutocomplete(config.googlePlacesKey, config.googlePlacesResponseType);
        var placeDetailsRequest = new PlaceDetailsRequest(config.googlePlacesKey, config.googlePlacesResponseType);

        var parameters = {
            //location: ['37.1', '-95.7' ],
            componentRestrictions: {
                country: 'us'
            },
            region: "us",
            //       components: {country: 'fr'},
            //radius: 5000,
            types: ['(cities)'],
            input: vmodel.searchtext
        };


        async.waterfall([
        function (callback) {
                placeAutocomplete(parameters, function (error, respose) {

                    //to find map key error use below

                    if (error) throw error;
                    if (respose.predictions.length === 0) {
                        googlePlacesResIsZero = true;
                        resultArrayLength = config.googlePlacesResultLimit;
                        status = "Gsearch returned 0 results for " + vmodel.searchtext;
                    } else if (respose.predictions.length < config.googlePlacesResultLimit) {
                        resultArrayLength = respose.predictions.length;
                        status = "Gsearch returned " + respose.predictions.length + " results for " + vmodel.searchtext + ".";
                    }

                    if (!googlePlacesResIsZero) {
                        for (var index = 0; resultArrayLength > index; index++) {

                            googleCityObjTrim.push({
                                place_id: respose.predictions[index].place_id,
                                description: respose.predictions[index].description,
                                reference: respose.predictions[index].reference,
                                lng: null, //result.result[index].geometry.location.lng,
                                lat: null //result.result[index].geometry.location.lat
                            });
                        }
                    }

                    callback(null, error, googleCityObjTrim, respose);
                });
        },
        function (error, googleCityObjTrim, respose, callback) {
                var detailsDone = 0;


                if (googleCityObjTrim.length == 0)
                    callback(null, googleCityObjTrim, respose);

                function callbacks(error, indexResults) {
                    detailsDone += 1;

                    if (error) throw error;
                    //if (status == google.maps.places.PlacesServiceStatus.OK) {

                    for (var j = 0; j < googleCityObjTrim.length; j++) {
                        if (googleCityObjTrim[j].place_id == indexResults.result.place_id) {
                            googleCityObjTrim[j].lng = indexResults.result.geometry.location.lng;
                            googleCityObjTrim[j].lat = indexResults.result.geometry.location.lat;
                        }
                    }
                    if (detailsDone >= googleCityObjTrim.length) {

                        callback(null, googleCityObjTrim, respose);
                    }
                }

                for (var i = 0; i < googleCityObjTrim.length; i++) {
                    placeDetailsRequest({
                        reference: googleCityObjTrim[i].reference
                    }, callbacks);
                }
        }


    ], function (err, result, respose) {
            if (err) return res.status(500).json({
                err: err
            });
            if (result) {
                // var googleCompObjTrim = JSON.parse(JSON.stringify(googleCompObjTrim));
                return res.status(200).json({
                    status: status,
                    googleCityObjTrim: result,
                    origResponse: respose
                });
            }

        });
    } catch (err) {
        pageUtil.responseWithError(res, err);
    }
};

function vmodel_checkbusinessname(input) {
    this.businessname = input.businessname;
    this.validate = function () {
        if (this.businessname == null) {
            throw new Error('business name is required.');
        }
    }
}

function vmodel_get(input) {
    this.id = input.id;
    this.name = input.company;
    this.includeProfileImage = input.includeProfileImage;
    this.includePromotionImage = input.includePromotionImage;
}

function vmodel_add(input) {

    this.companyId = input.id;
    this.contactId = input.contactId;
    this.name = input.name;
    this.phoneNumber = input.phoneNumber;
    this.email = input.email;
    this.bizType = input.bizType;
    this.bizSubtype = input.bizSubtype;
    this.priceLevel = input.priceLevel;
    this.urlName = input.urlName;
    this.streetAddress = input.streetAddress;
    this.city = input.city;
    this.state = input.state;
    this.zip = input.zip;
    this.bizPlacesId = input.bizPlacesId;
    this.bizLat = input.bizLat;
    this.bizLng = input.bizLng;
    this.averageRating = input.averageRating;
    this.fromGooglePlaces = input.fromGooglePlaces;

    this.validate = function () {
        if (this.contactId == null) {
            throw new Error('business contact is required.');
        }
        if (this.name == null) {
            throw new Error('name is required.');
        }
        if (this.email == null) {
            throw new Error('email is required.');
        }
        if (this.urlName == null) {
            throw new Error('business web address is required.');
        }
        /*if (this.phoneNumber == null) {
            throw new Error('business phone number is required.');
        }*/
    }

    this.validateGoogleBiz = function () {

        if (this.name == null) {
            throw new Error('name is required.');
        }
        if (this.email == null) {
            throw new Error('email is required.');
        }
        if (this.urlName == null) {
            throw new Error('business web address is required.');
        }
        /*if (this.phoneNumber == null) {
            throw new Error('business phone number is required.');
        }*/
        if (this.bizPlacesId == null) {
            throw new Error('biz Places Id is required.');
        }
    }
}


function vmodel_update(input) {

    this.contactObj = {
        firstName: input.firstName,
        lastName: input.lastName,
        userName: input.userName,
        phoneNumber: input.cellNumber,
        //    pwdHash : input.pwdHash,
        contactType: input.contactType,
        token: input.token,
    }

    this.businessObj = {
        name: input.name,
        phoneNumber: input.phoneNumber,
        email: input.email,
        bizType: input.bizType,
        bizSubtype: input.bizSubtype,
        priceLevel: input.pricelevel,
        streetAddress: input.streetAddress,
        city: input.city,
        state: input.state,
        zip: input.zip,
        profileImage: input.profileImage,
        enableNotifications: input.enableNotifications,
        bizPlacesId: input.bizPlacesId,
        bizLat: input.bizLat,
        bizLng: input.bizLng,
        promotionImage: input.promotionImage,
        promotionText: input.promotionText
    }

    this.customLabelObj = {
        company_id: null,
        Q_id: null,
        Q_text: null,
        Q_active: null
    }

    this.validateContact = function () {

        if (this.contactObj.userName == null) {
            throw new Error('contact email is required.');
        }
    }

    this.validateBusiness = function () {

        if (this.businessObj.name == null) {
            throw new Error('business name is required.');
        }
        if (this.businessObj.email == null) {
            throw new Error('contact email is required.');
        }
    }


}

function vmodel_getBizSearch(input) {
    this.searchtext = input.searchtext;
    this.validate = function () {
        if (this.searchtext == null) {
            throw new Error('search text is required.');
        }
    }
    this.limit = 100;
}

function vmodel_getBizGoogleSearch(input) {
    this.searchtext = input.searchtext;
    this.bizlat = input.bizlat;
    this.bizlng = input.bizlng;
}

function vmodel_getBizGoogleSearchDetail(input) {
    this.place_id = input.place_id;

}
