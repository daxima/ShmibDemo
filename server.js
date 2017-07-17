'use strict';

process.env.NODE_ENV = 'development';

var appConfig = require('./config.js'),
    express = require('express'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    session = require('express-session'),
    exphbs = require('express-handlebars'),
    flash = require('connect-flash'),
    passport = require('passport'),
    compression = require('compression'),
    models = require('./app/models'),
    logger = require('./logger.js'),
    areas = require('./areas.js'),
    appInsights = require("applicationinsights");


var server = null;
var app = express();

// Start Azure AppInsight
appInsights.setup(appConfig.azure.instrumentationKey)
    .setAutoCollectRequests(true)
    .setAutoCollectPerformance(false)
    .setAutoCollectExceptions(true)
    .start();

require('./config/passport')();

app.use(require('./util/domain-error-handler.js'));

app.use(morgan('combined', {
    'stream': logger.stream
}));

app.use(compression());

app.use(require('cookie-parser')(appConfig.sessionSecret));
app.use(session({
    saveUninitialized: true,
    resave: true,
    secret: appConfig.sessionSecret
}));

app.use(bodyParser.raw({
    limit: '20mb'
}));
app.use(bodyParser.json({
    limit: "20mb"
}));
app.use(bodyParser.urlencoded({
    limit: "20mb",
    extended: true
}));

app.use(methodOverride());

app.use(function (req, res, next) {
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    next();
});

// Initialize global variables for all page view.
app.use(function (req, res, next) {
    res.locals.azure = appConfig.azure;
    res.locals.version = appConfig.version;
    res.locals.siteProtocol = appConfig.siteProtocol;
    next();
});

// ################################################################################
// ## CORS middleware
// see: http://stackoverflow.com/questions/7067966/how-to-allow-cors-in-express-nodejs
// ################################################################################
var allowCrossDomain = function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
        res.status(200).end();
    } else {
        next();
    }
};
app.use(allowCrossDomain);
// ################################################################################

var webRootPath = '/Public';

app.use(express.static(__dirname + webRootPath));

// All Angular routes.
app.get(areas, function (req, res) {
    //    res.sendFile(__dirname + webRootPath + '/angular.html');
    res.sendFile(__dirname + webRootPath + '/angular/index.html');
});

// Set the application view engine and 'views' folder
app.set('views', './app/views');
//app.engine('handlebars', exphbs({defaultLayout: 'main', layoutsDir:'app/views/layouts'}));
app.set('view engine', 'ejs');
app.enable('view cache');

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// Load the 'index' routing file
require('./app/routes/website.routes.js')(app);
require('./app/routes/api.server.routes.js')(app);

require('./app/controllers/config.js')(app);

app.set('port', process.env.PORT || 9010);

// Handle uncaught exceptions.
app.use(function (err, req, res, next) {
    logger.error(err.stack);
    next();
});

// ################################################################################
// Start the server.
// ################################################################################
if (require.main === module) {
    // Start up stand alone server instance.
    server = startServer();
} else {
    // Start up instance in a cluster.
    module.exports = startServer;
}
// ################################################################################

function startServer() {
    var worker_name = '';
    var worker = require('cluster').worker;
    if (worker) {
        worker_name = '[Worker-' + worker.id + '] ';
    }

    return app.listen(app.get('port'), function () {
        console.log(worker_name + 'Server started in ' + app.get('env') + ' mode' + ' on port ' + app.get('port') + '; press Ctrl-C to terminate.');
    });
};
