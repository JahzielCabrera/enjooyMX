const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const morgan = require('morgan');
const multer = require('multer');
const methodOverride = require('method-override');
const util = require('util');
const eventEmiter = require('events');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const helpers = require('./helpers/validateAuth');
const { all } = require('./routes/index.routes');
const MongoStore = require('connect-mongo')(session);
const mongoose = require('mongoose');

//Initializations
const app = express();
require('./config/passport');


//Settings
app.set("port", process.env.PORT || 4000);
app.set("views", path.join(__dirname, 'views'));
app.engine(".hbs", exphbs({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get("views"),'layouts'),
    partialsDir: path.join(app.get("views"),'partials'),
    extname: '.hbs',
    helpers: require('./config/helpers')
}));

app.set("view engine", ".hbs");

//Middlewares
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(morgan('dev'));
const storage = multer.diskStorage({
    destination: path.join(__dirname, 'public/uploads'),
    filename: (req, file, cb) => {
        cb(null, new Date().getTime() + path.extname(file.originalname));
    }
});
app.use(multer({storage}).fields([{name: 'image'}, {name: 'portada'}]));
app.use(methodOverride('_method'));
app.use(session({
    secret: 'secret',
    store: new MongoStore({
        url: process.env.MENU_APP_HOST,
        ttl: 5*60*60,
        autoRemove: 'interval',
        autoRemoveInterval: 10
    }),
    resave: false,
    saveUninitialized: false
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

//Global Variables
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.alert_success = req.flash('alert_success');
    res.locals.error = req.flash('error');
    res.locals.limit_alert = req.flash('limit_alert');
    res.locals.user = req.user || null;
    next();
});

//Routes
app.use(require('./routes/index.routes'));
app.use(require('./routes/products.routes'));
app.use(require('./routes/users.routes'));
app.use(require('./routes/sucursal.routes'));
app.use(require('./routes/category.routes'));

//Static Files
app.use(express.static(path.join(__dirname, "public")));

module.exports = app;