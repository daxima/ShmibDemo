module.exports = function (app) {

    require('./review.server.controller.js')(app);
    require('./auth.server.controller.js')(app);
    require('./coupon.server.controller.js')(app);
    require('./business.server.controller.js')(app);
	require('./user.server.controller.js')(app);
	require('./util.server.controller.js')(app);
	require('./report.server.controller.js')(app);
};