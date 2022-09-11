const express = require('express');
router = express.Router();


// Error handling
const catchAsync = require('../utils/catchAsync');
// Middleware
const { isLoggedIn } = require('../middleware.js');
// User controller
const users = require('../controllers/users.js');
// Authentication
const passport = require('passport');

/*
======================================================================================
ROUTES FOR REGISTERING A NEW USER
======================================================================================
*/

router.route('/register')
   .get(users.createUserForm)
   .post(catchAsync(users.createUser))

/*
======================================================================================
ROUTES FOR SIGNING IN
======================================================================================
*/
router.route('/login')
   .get(users.loginUserForm)
   .post(passport.authenticate("local", { failureRedirect: "/login", failureFlash: true, keepSessionInfo: true }), users.loginUser);

/*
======================================================================================
ROUTES FOR LOGGING OUT
======================================================================================
*/

router.get('/logout', isLoggedIn, users.logoutUser)

module.exports = router;