var mongoose 	= require('mongoose');
var application = require('../application.js');

var database = {
    log: null,

    setup: function (logger, cb) {
    	database.log = logger;
    	database.config = application.loadConfig('database', application.env);

	    var authString = '';
	    if (database.config.username) {
	        authString = database.config.username + ':' + database.config.password + '@';
	    }

	    var connectionString = 'mongodb://' + authString + database.config.host + ':' + database.config.port + '/' + database.config.database;

	    mongoose.connect(connectionString, function (err) {
	        if (!err) {
	            database.log.info('Connected to database');
	        }
	        cb(err);
	    });
    }
};

module.exports = exports = database;