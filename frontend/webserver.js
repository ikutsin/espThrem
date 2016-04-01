var connect = require('connect');
var serveStatic = require('serve-static');

//var path = __dirname+"/src";
var path = __dirname+"";
var port = 8080;

connect().use(serveStatic(path, {
    'index': ['index.html']
  }))
  .listen(port, function() {
    console.log('Server running: ' + port);
    console.log('Server serving: ' + path);
  });
