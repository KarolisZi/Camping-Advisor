const express = require('express');
router = express.Router({ mergeParams: true });

// Error handling
const catchAsync = require('../utils/catchAsync');
// Middleware
const { isLoggedIn, validateReviews, isReviewAuthor } = require('../middleware.js');
// Controllers for the routes
const reviews = require('../controllers/reviews.js');

/*
======================================================================================
ROUTES FOR REVIEWS
======================================================================================
*/

// CREATE ROUTE - create new review in the database
router.post('/', isLoggedIn, validateReviews, catchAsync(reviews.create))

// DELETE ROUTE - remove a review from the database
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.delete));

module.exports = router;