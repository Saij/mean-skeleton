var winston = require('winston');
var merge 	= require('merge');

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

app._loadModule = function (module) {
    app.log.info('Loading module ' + module);
    var obj = require(app.rootDir + '/app/modules/' + module + '.js');
    var logger = app.setupLogger(module);
    app[module] = obj
    app[module].setup(logger);
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

app.isProd = function () {
    return app.env === 'production';
}

app.isDev = function () {
    return app.env === 'development';
}

app.setup = function (cb) {
	app.env = process.env.STAGE ? process.env.STAGE : 'production';

    app.log = app.setupLogger(app.name);
    app.config = app.loadConfig('app', app.env, cb);

    cb();
}

app.loadModules = function (cb) {
	cb();
}

app.start = function (cb) {

	if (!app.webserver) {
		app._loadModule('webserver');
	}

	app.webserver.start(cb);
}

module.exports = exports = app;