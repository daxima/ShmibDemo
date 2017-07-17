// Invoke 'strict' JavaScript mode
'use strict';

var signing = require('../../app/controllers/signing.server.controller'),
    passport = require('passport'),
    models = require('../models'),
    User = models.user;


module.exports = function (app) {

    // ----------------------------
    // property related apis
    // ----------------------------


    /* app.route('/api/auth/login/biz')
		.post(signing.signinBiz)*/
    /* .post(passport.authenticate('local', {
         successRedirect: '/home/review/list',
         failureRedirect: '/auth/login/biz',
         failureFlash: true
     }));*/
    /*app.route('/api/auth/login')
        .post(passport.authenticate('local', {
            successRedirect: '/me/review/list',
            failureRedirect: '/api/auth/login',
            failureFlash: true
        }));*/

    app.route('/auth/emailcheck')
        .get(signing.checkEmail);

    app.route('/api/auth/checkphone')
        .get(signing.checkPhone);

    //    app.route('/business/restaurantcheck')
    //        .get(signing.checkRestaurant);

    app.route('/api/auth/applogin')
        .post(signing.login);

    /*  app.route('/auth/logout/biz')
          .get(signing.logout);

      app.route('/auth/logout')
          .get(signing.userlogout);*/

    /* app.route('/auth/signup')
         .post(signing.createContact);*/

    //    app.route('/business/add')
    //        .post(signing.addRestaurant);

    //   app.route('/business/referenceItem/Add')
    //       .post(signing.addReferenceItem);

    //    app.route('/business/referenceItem')
    //        .get(signing.getReferenceItem);

    //    app.route('/review/get')
    //        .get(signing.getReviewById);

    //    app.route('/review/comment/add')
    //        .post(signing.sendComment);

    //    app.route('/Report/CurrentMonthReviews')
    //        .get(signing.getCurrentMonthReviews);

    //    app.route('/api/auth/forgotpassword')
    //        .post(signing.sendForgotPassword);

    app.route('/passwordreset/tuid/:tuid')
        .get(signing.getResetPage);

    app.route('/api/auth/passwordreset')
        .post(signing.sendReset);

    //    app.route('/business/update')
    //       .post(signing.updateProfile);

    //   app.route('/review/add')
    //       .post(signing.createReview);

    /*app.route('/coupon/add')
        .post(signing.createCoupon);

    app.route('/coupon/update')
        .post(signing.updateCoupon);

    app.route('/coupon/get')
        .get(signing.getCouponById);*/

    /* app.route('/user/businessList')
        .get(signing.getbusinessList);
*/
    //    app.route('/business/get')
    //        .get(signing.getBusinessDetail);

    //    app.route('/review/list')
    //        .get(signing.getReviewByUserId);

    //    app.route('/review/update')
    //        .post(signing.updateReview);

    //    app.route('/business/list')
    //        .get(signing.getAllBusiness);
    //    app.route('/user/profile')
    //        .post(signing.updateUserProfile);

    app.route('/api/user/changepassword')
        .post(signing.changeUserPassword);

    //    app.route('/api/auth/checkpassword')
    //        .get(signing.checkPassword);

};
