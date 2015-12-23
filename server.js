var stage = process.env.STAGE ? process.env.STAGE : 'production';
var async = require("async");
var app	  = require(__dirname + "/app/application.js");

/*
 * Set application basic options
 */
app.rootDir = __dirname;

/*
 * Bootstrap application
 */
async.series([
    function (next) {
        app.setupApplication(next);
    },
    function (next) {
        app.setupDatabase(next);
    },
    function (next) {
        app.setupWebserver(next);
    },
    function (next) {
        app.loadModules(next);
    },
    function (next) {
        app.start(next);
    }
], function (err) {
    if (err) {
        app.log.error(err);
    } else {
        app.log.info('Application running')
    }
});