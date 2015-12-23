var application = require('../application.js');

var webserver = {
    log: null,

    setup: function (logger, cb) {
        webserver.log    = logger;
        webserver.config = application.loadConfig('webserver', application.env);

        var express         = require('express');
        var bodyParser      = require('body-parser');
        var methodOverride  = require('method-override');
        var cookieParser    = require('cookie-parser');
        var session         = require('express-session');

        webserver.express = express();
        webserver.httpServer = require('http').Server(webserver.express);
        webserver.express.set('trust proxy', 1);

        webserver.express.use(bodyParser.urlencoded({
            extended: false
        }));
        webserver.express.use(bodyParser.json());
        webserver.express.use(methodOverride());
        webserver.express.use(cookieParser(webserver.config.cookieParser.secret));
        webserver.express.use(session(webserver.config.session));

        webserver.express.use(function (req, res, next) {
            res.header('Access-Control-Allow-Credentials', 'true');
            res.header('Access-Control-Allow-Origin', req.headers.origin);
            res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,HEAD,DELETE,OPTIONS');
            res.header('Access-Control-Allow-Headers', 'Content-Type,X-Requested-With');

            if (req.method == 'OPTIONS') {
                res.send(200);
            }
            else {
                next();
            }
        });

        require('../routes.js');

        cb();
    },

    start: function (cb) {
        webserver.httpServer.listen(webserver.config.port, function () {
            webserver.log.info('Webserver listening on ' + webserver.config.port);
            cb();
        });
    }
}

module.exports = exports = webserver;