var application = require('./application.js');
var serveStatic = require('serve-static');

application.webserver.use('/', serveStatic(application.rootDir + '/public/', {
    maxAge: 1000 * 60 * 60 * 24 * 30, // 5 months,
    lastModified: true,
    etag: true,
    dotfiles: 'ignore' // ignore folders starting with .
}));

application.webserver.get('/*', function (req, res) {
    res.sendFile(application.rootDir + '/public/index.html');
});
