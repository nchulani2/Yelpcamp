require('dotenv').config();

// npm requires
const express = require(`express`);
const cookieSession = require('cookie-session');
const bodypars = require(`body-parser`);
const mongoose = require(`mongoose`);
const methodOverride = require(`method-override`);
const expressSanitizer = require(`express-sanitizer`);
const passport = require(`passport`);
const localStrategy = require('passport-local');
const passportLocalMongoose = require('passport-local-mongoose');
const flash = require('connect-flash');

// Model requires
const User = require('./models/user');

// Route requires
const campRoute = require('./routes/campgrounds');
const commentRoute = require('./routes/comments');
const indexRoute = require('./routes/index');
const passwordForgotRoute = require('./routes/passwordForgot');

// OAuth requires
// const passportSetupGoogle = require("./config/passportSetupGoogle")
// const passportSetupFacebook = require("./config/passportSetupFacebook")

// DATABASE SETUP
const url = process.env.DATABASEURL;
mongoose.set(`useFindAndModify`, false);
mongoose
  .connect(url, {
    useNewUrlParser: true,
    useCreateIndex: true
  })
  .then(() => {
    console.log('Database connection successfull!');
  })
  .catch(err => {
    console.log('Unsuccessfull:', err.message);
  });

var app = express();
app.use(express.static(__dirname + `/public`));
app.set(`view engine`, `ejs`);
app.use(
  bodypars.urlencoded({
    extended: true
  })
);
app.use(expressSanitizer());
app.use(methodOverride(`_method`));
// use flash messages, configure isn't needed as express sessions takes care of it
app.use(flash());
app.locals.moment = require('moment');

/* -------------------------- AUTHENTICATION SETUP -------------------------- */
app.use(
  cookieSession({
    maxAge: 24 * 60 * 60 * 100,
    keys: [process.env.COOKIE_KEY]
  })
);

// Sets passport up to be usable in the application
app.use(passport.initialize());
app.use(passport.session());

// Responsible for encoding and decoding data for sessions
// Methods come from the User model which had plugin: passportLocalMongoose
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

/* -------------------------- AUTHENTICATION END -------------------------- */

//Basically, what ever is in res.locals is passed to all templates
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash('error');
  res.locals.similar = req.flash('similar');
  res.locals.success = req.flash('success');
  next();
});

// Route initialization
// basically, /campgrounds gets appended in the front of the route defined in campRoute
app.use('/campgrounds', campRoute);
// :id is a little more difficult, must merge the routes through the express.Router()
app.use('/campgrounds/:id/comments', commentRoute);
app.use(passwordForgotRoute);
app.use(indexRoute);

// Server listening
const port = process.env.PORT || 3000;
const ip = process.env.IP || 'localhost';
app.listen(port, function() {
  console.log('Server has started .... at port ' + port + ' ip: ' + ip);
});
