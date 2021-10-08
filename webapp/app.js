// Main file for this Node/Express web application.
// Chris Joakim, Microsoft, 2021/10/08

var   express    = require('express');
var   session    = require('express-session');
var   favicon    = require('express-favicon');
var   path       = require('path');
var   bodyParser = require('body-parser');
var   logger     = require('morgan');
var   cookieParser = require('cookie-parser');

const process    = require('process');
const { v4: uuidv4 } = require('uuid');
const CosmosDbDao = require('./dao/cosmosdb_dao').CosmosDbDao;
var   dao = new CosmosDbDao();

var app = express();
app.use(bodyParser.json()) 
app.use(session({secret: 'fW5knzPk', resave: false, saveUninitialized: true}));  // https://passwordsgenerator.net
app.use(favicon(__dirname + '/public/favicon.png'));  // https://www.favikon.com

var now = new Date();
var env = process.env.NODE_ENV || 'development';
app.locals.ENV = env;
app.locals.ENV_DEVELOPMENT = env == 'development';
app.locals.pid = process.pid;
app.locals.start_date = now;
app.locals.start_epoch = now.getTime();
app.locals.some_uuid = uuidv4();
app.locals.dao = dao;

console.log('app.locals.ENV: ' + app.locals.ENV);
console.log('app.locals.pid: ' + app.locals.pid);
console.log('app.locals.start_date:  ' + app.locals.start_date);
console.log('app.locals.start_epoch: ' + app.locals.start_epoch);
console.log('app.locals.some_uuid:   ' + app.locals.some_uuid);

// view engine setup
var views_dir = path.join(__dirname, 'views');
console.log('views_dir: ' + views_dir);
app.set('views', views_dir)
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Application routers
var index_router      = require('./routes/index');
var bom_router        = require('./routes/bom');
var library_router    = require('./routes/library');
var maintainer_router = require('./routes/maintainer');

// These Express Routers implement the HTTP endpoints for this app
app.use('/',      index_router);
app.use('/bom',   bom_router);
app.use('/lib',   library_router);
app.use('/maint', maintainer_router);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler, will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err,
            title: 'error'
        });
    });
}

// production error handler, no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {},
        title: 'error'
    });
});

module.exports = app;
