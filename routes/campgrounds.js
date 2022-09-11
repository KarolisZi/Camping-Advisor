const express = require('express');
router = express.Router();
// Enable to submit images in forms
const multer = require('multer');

// Error handling
const catchAsync = require('../utils/catchAsync');
// Middleware
const { isLoggedIn, validateCampground, isAuthor } = require('../middleware.js');
// Controllers for the routes
const campgrounds = require('../controllers/campgrounds.js');

// Import clopudinary as a place to store images
const { storage } = require('../cloudinary');

// Specify multer (images) storage location
const upload = multer({ storage })

/*
======================================================================================
RESTful ROUTES FOR CAMPGROUNDS
======================================================================================
*/

// NEW ROUTE - display a form to create a new campground
router.get('/new', isLoggedIn, campgrounds.new);

router.route('/')
   // INDEX ROUTE - display a list of all campground
   .get(catchAsync(campgrounds.index))
   // CREATE ROUTE - create records in the database
   .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.create));

router.route('/:id')
   // SHOW ROUTE - display information about specific campground
   .get(catchAsync(campgrounds.show))
   // UPDATE ROUTE - update the infromation in database
   .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.update))
   // DELETE ROUTE - remove the entry from the database
   .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.delete));

// EDIT ROUTE - display a form to edit a specific campground
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.edit))


module.exports = router;
