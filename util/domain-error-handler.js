var logger = require('../logger.js');

module.exports = function domainErrorHandler(req, res, next) {
    
    var domain = require('domain').create();
    
    domain.on('error', function (err) {
        logger.error('DOMAIN ERROR CAUGTH\n', err.stack);
        try {
            // Failsafe shutdown.
            setTimeout(function () {
                logger.error('Failsafe shutdown');
                process.exit(1);
            }, 5000);
            
            // Disconnect from the cluster.
            var worker = require('cluster').worker;
            if (worker) { worker.disconnect(); }
            
            // Stop taking new request.
            //server.close();
            
            try {
                // Attempt to use Express error route.
                next(err);
            } catch (err) {
                logger.error('Express error failed.\n', err.stack);
                res.statusCode = 500;
                res.setHeader('content-type', 'text/plain');
                res.end('Server error.');
            }
        }
        catch (err) {
            logger.error('Unable to send 500 respond.\n', err.stack);
        }
    });
    
    domain.add(req);
    domain.add(res);
    domain.run(next); // Execute the rest of the request chain in the domain.
};