// Invoke 'strict' JavaScript mode
'use strict';

var site = require('../../app/controllers/site.server.controller');


module.exports = function (app) {

    app.route('/home')
        .get(function (req, res) {
            res.redirect('/home/review/list');
        });

    app.route('/home/review/list/:companyId?')
        .get(site.getSignIn);

    app.route('/biz')
        .get(site.getSigninPage);
    
    app.route('/auth/login/biz')
        .get(site.getSigninPage);

    app.route('/auth/login')
        .get(site.getSigninUserPage);

    app.route('/auth/emailverification/:tuid')
        .get(site.getEmailVerificationPage);

    app.route('/help/signup/biz')
        .get(function (req, res) {
            res.redirect('/help/signup/biz/contact');
        });

    app.route('/help/signup/biz/contact')
        .get(site.getSignUpPage);

    app.route('/home/reports/:companyId?')
        .get(site.getReportsPage);

    app.route('/home/profile/:companyId?')
        .get(site.getProfilePage);

    app.route('/home/coupons')
        .get(site.getCouponsPage);

    app.route('/biz/:company')
        .get(function (req, res) {
            res.redirect('/biz/' + req.params.company + '/review ');
        });

    app.route('/biz/:company/review')
        .get(site.getUserReviewPage);

    app.route('/help/signup/review/:review_hash_id')
        .get(site.getUserReviewCompletePage);

    app.route('/me')
        .get(function (req, res) {
            res.redirect('/me/review/list');
        });

    app.route('/me/review/list')
        .get(site.getSignInUser);

    app.route('/help/signup')
        .get(site.getSignUpUserPage);

    app.route('/me/profile')
        .get(site.getUserProfilePage);

    app.route('/me/review/item/:review_hash_id')
        .get(site.getSignInUserDetail);

    app.route('/me/changepassword')
        .get(site.getchangeUserPasswordPage);

    app.route('/auth/logout/biz')
        .get(site.logout);

    app.route('/auth/logout')
        .get(site.userlogout);

    app.route('/home/changepassword')
        .get(site.getchangeUserPasswordPage);

    /*app.route('/help/biz')
    	.get(function(req,res){
    		res.redirect('/help/biz/search');
    });*/

    app.route('/me/biz/search')
        .get(site.getBizSearchPage);

    app.route('/terms')
        .get(site.getTermsPage);

    /*app.route('/help/biz/search')
    	.get(site.getBizSearchPage);*/

    app.route('/auth/resetpassword/:token')
        .get(site.getResetPasswordPage);
};
