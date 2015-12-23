var winston = require('winston');
var merge 	= require('merge');
var async 	= require('async');

var app = {
	name: 'mean-skeleton',
    env: 'production',
    configDir: '/config/',
    rootDir: null,
    logger: new winston.Logger()
};

app.loadConfig = function (file, section) {
    var configFile = require(app.rootDir + app.configDir + '/' + file + '.json');

    try {
        var localConfigFile = require(app.rootDir + app.configDir + '/' + file + '.local.json');
        configFile = merge.recursive(true, configFile, localConfigFile);
    } catch (e) {

    }
    
    if (!configFile[section]) {
    	// Section not found - return empty object
    	return {};
    }

    var config = configFile[section];
    if (configFile[section]['_extends'] && configFile[configFile[section]['_extends']]) {
    	config = merge.recursive(true, configFile[configFile[section]['_extends']], configFile[section])
    } else if (configFile[section]['_extends']) {
    	throw new Error('Could not find section "' + configFile[section]['_extends'] + '" in file "' + file + '.json"')
    }

    return config;
}

app._loadModule = function (module, cb) {
    app.log.info('Loading module ' + module);
    var obj = require(app.rootDir + '/app/modules/' + module + '.js');
    var logger = app.setupLogger(module);
    app[module] = obj
    app[module].setup(logger, cb);
}

app.setupLogger = function (name) {
    winston.loggers.add(name, {
        console: {
            level: 'silly',
            colorize: true,
            label: name
        }
    });

    return winston.loggers.get(name);
}

app.setup = function (cb) {
	app.env = process.env.STAGE ? process.env.STAGE : 'production';

    app.log = app.setupLogger(app.name);
    app.config = app.loadConfig('app', app.env, cb);

    cb();
}

app.loadModules = function (cb) {
	var moduleLoader = [];
	for (var i = 0; i < app.config.modules.length; i++) {
		var module = app.config.modules[i];
		
		// Load webserver as last module
		if (module === 'webserver') {
			continue;
		}

		moduleLoader.push(function (next) {
			app._loadModule(module, next);
		});
	}

	async.series(moduleLoader, cb);
}

app.setupWebserver = function (cb) {
    var express         = require('express');
    var bodyParser      = require('body-parser');
    var methodOverride  = require('method-override');
    var cookieParser    = require('cookie-parser');
    var session         = require('express-session');

    app.webserver = express();
    app.httpServer = require('http').Server(app.webserver);
    app.webserver.set('trust proxy', 1);

    app.webserver.use(bodyParser.urlencoded({
        extended: false
    }));
    app.webserver.use(bodyParser.json());
    app.webserver.use(methodOverride());
    app.webserver.use(cookieParser(app.config.cookieParser.secret));
    app.webserver.use(session(app.config.session));

    app.webserver.use(function (req, res, next) {
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

    require('./routes.js');

    cb();
}

app.start = function (cb) {
    app.httpServer.listen(app.config.port, function () {
        app.log.info('Webserver listening on ' + app.config.port);
        cb();
    });
}

module.exports = exports = app;