if (process.env.NODE_ENV !== 'production') {
   require('dotenv').config();
}
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate'); // Enables to use partials
const methodOverride = require('method-override'); // Enables to use other methods than POST and GET
const session = require('express-session'); // Enables to store session information about user in backend
const flash = require('connect-flash'); // Enables to add content based on what happened previously
const passport = require('passport'); // Authentication package
const LocalStrategy = require('passport-local');
const mongoSanitize = require('express-mongo-sanitize'); // Prevent Mongo injections
const helmet = require('helmet');
const MongoDBStore = require('connect-mongo');

const campgroundRoutes = require('./routes/campgrounds')
const reviewRoutes = require('./routes/reviews')
const userRoutes = require('./routes/users')
const ExpressError = require('./utils/ExpressError');
const User = require('./models/user');

/*
======================================================================================
CONNECT TO MONGO DATABASE
======================================================================================
*/

const dbURL = process.env.DB_URL || 'mongodb://localhost:2717/CampgroundAdvisor';
async function mongoConnect() {

   await mongoose.connect(dbURL);
   console.log('Connection to MongoDB open');

}
mongoConnect().catch((err) => console.log('Caught an error:', err))

/*
======================================================================================
INTIALIZE EXPRESS APP OBJECT, CONFIGURE VIEW ENGINE AND STATIC VIEWS DIRECTORY
======================================================================================
*/

const app = express();
app.set('view engine', 'ejs');
app.engine('ejs', ejsMate)
app.set('views', path.join(__dirname, '/views'))

/*
======================================================================================
METHODS TO USE ON EVERY REQUEST
======================================================================================
*/
const secret = process.env.SECRET_2 || 'thissecretisadevelopmentbackup!'

const options = {
   mongoUrl: dbURL,
   secret,
   touchAfter: 24 * 60 * 60,
}

// Configure and set up session
const sessionConfig = {
   store: MongoDBStore.create(options),
   name: 'session',
   secret,
   resave: false,
   saveUninitialized: true,
   cookie: {
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
      maxAge: 1000 * 60 * 60 * 24 * 7,
      httpOnly: true,
      // secure: true,
   }
}
app.use(session(sessionConfig));

// Passport authentication methods
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Set up flash
app.use(flash());
// Set up middlerware to server flashes
app.use((req, res, next) => {
   res.locals.currentUser = req.user;
   res.locals.success = req.flash('success');
   res.locals.error = req.flash('error');
   next();
})

// HELMET security policies
// These two break the app without SSL (HTTPS)
// app.use(helmet.contentSecurityPolicy());
// app.use(helmet.crossOriginEmbedderPolicy());
app.use(helmet.crossOriginOpenerPolicy());
app.use(helmet.crossOriginResourcePolicy());
app.use(helmet.dnsPrefetchControl());
app.use(helmet.expectCt());
app.use(helmet.frameguard());
app.use(helmet.hidePoweredBy());
app.use(helmet.hsts());
app.use(helmet.ieNoOpen());
app.use(helmet.noSniff());
app.use(helmet.originAgentCluster());
app.use(helmet.permittedCrossDomainPolicies());
app.use(helmet.referrerPolicy());
app.use(helmet.xssFilter());

app.use(mongoSanitize());
// Use the /public directory for static assets
app.use(express.static(path.join(__dirname, '/public')));
// Enable parsing POST requests so body would contain the submitted data
app.use(express.urlencoded({ extended: true }));
// Enable Overriding POST requests with custom headers (PUT, PATCH, DELETE, ...)
app.use(methodOverride('_method'));
// Website routes
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);
app.use('/', userRoutes);

/*
======================================================================================
EXPRESS SERVER LISTENING FOR INCMOING REQUESTS
======================================================================================
*/

const port = process.env.PORT || 3000;
app.listen(port, () => {
   console.log(`Listening on port ${port}`);
})

/*
======================================================================================
HOME ROUTE
======================================================================================
*/

app.get('/', (req, res) => {

   res.render('home');
})

/*
======================================================================================
ROUTES FOR ALL UNCAPTURED REQUESTS (404 Page not found) AND ERROR HANDLING
======================================================================================
*/

// ALL OTHER ROUTES - catch all requests on all other routes
app.all('*', (req, res, next) => {

   next(new ExpressError('Page not found', 404))

})

// ERROR HANDLING ROUTE  - catch all errors
app.use((err, req, res, next) => {

   const { statusCode = 500 } = err
   if (!err.message) err.message = 'Oh no! Something went wrong'

   res.status(statusCode).render('./partials/error', { err })

});
