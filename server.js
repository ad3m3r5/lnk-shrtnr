// Express App
var express  = require('express');
var app      = express();
var port     = process.env.PORT || 5000;
var session  = require('express-session');
var flash    = require('connect-flash');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// Logging
var morgan     = require('morgan');
app.use(morgan('dev'));

// MongoDB
var mongoose = require('mongoose');
var configDB = require('./config/database.js');
mongoose.set('useCreateIndex', true);
mongoose.connect(configDB.url, { useNewUrlParser: true }); // connect to our database

// App Configs
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(session({
    secret: 'thatsecretthinggoeshere',
    resave: false,
    saveUninitialized: true
}));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(flash());
app.use(cookieParser());

// App GET/POST routes
require('./routes/routes.js')(app);

app.listen(port);
console.log('NodeJS Lnk-Shrtnr live on port: ' + port);
