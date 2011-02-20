/**
 * Module dependencies.
 */

var express = require('express');

var app = module.exports = express.createServer(),
RedisStore = require('connect-redis'),
store = new RedisStore;

// Configuration

app.configure(function(){
    app.use(express.staticProvider(__dirname + '/public'));
    app.set('views', __dirname + '/app/views');
    app.set('view engine', 'ejs');
    app.use(express.cookieDecoder());
    app.use(express.session({ store: store }));
    app.use(express.bodyDecoder());
    app.use(express.methodOverride());
    app.use(function (req, res, next) {
        var id = req.session && req.session.user_id;
        if (!id) {
            next();
        } else {
            User.find(id, function (err) {
                if (err) {
                    next();
                } else {
                    req.user = this;
                    next();
                }
            });
        }
    });
    app.use(app.router);
});

app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
    app.use(express.errorHandler()); 
});

require("express-on-railway").init(__dirname, app);

// Only listen on $ node app.js

if (!module.parent) {
    app.listen(8008);
    console.log("Express server listening on port %d", app.address().port)
}
