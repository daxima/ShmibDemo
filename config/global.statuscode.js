/*** Global Variables ***/
// Include in files where needed. We may split into multiple files if number of variables expand
// Usage: 
// In controller, include: var global  = require('../../app/models/global.statuscode');

// For Status Codes display System Only Codes
var ProjectStatusCodes = {
	'OPEN': 'OPEN',
	'CLOSED': 'CLOSED'
}

module.exports.ProjectStatusCode 	= ProjectStatusCodes;
