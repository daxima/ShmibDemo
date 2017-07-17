var logger = require('../logger.js');

var getHttpCode = function(err) {
    if (err.httpCode != null) { return err.httpCode; }
    else if (err.name == 'BusinessRuleError') { return 400; }
    else if (err.name == 'UnautorizedError') { return 401; }
    else if (err.name == 'ForbiddenError') { return 403; }
    return 500;
}
module.exports.httpCode = getHttpCode;

var AppError = function (httpCode, message, name) {
    this.name = (name != null) ? name : "AppError";
    this.httpCode = httpCode;
    this.message = message;
}
AppError.prototype = Error.prototype;
module.exports.AppError = AppError;

module.exports.responseWithError = function (res, err) {
    var key = Math.ceil(Math.random() * 10000000000000000);
    logger.error('[KEY:' + key + '] ' + err.stack);
    var errorCode = getHttpCode(err);
    // If the error is not our custom error, that means this error is unexpected.
    // We will not return the internal error message to the user, since it can be
    // a security issue.
    var errorMessage = (errorCode == 500)
        ? 'An error occured while processing the request.'
        : err.message;
    // Return error response.
    res.status(errorCode).json({ 
        key: key,
        success: false, 
        message: errorMessage 
    });
}