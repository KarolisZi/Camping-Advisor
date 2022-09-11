const ExpressError = require('./utils/ExpressError');
const { campgroundSchema, reviewsSchema } = require('./schemas.js');
const Campground = require('./models/campground');
const Review = require('./models/review');

/*
======================================================================================
AUTHENTICATION MIDDLEWARE
======================================================================================
*/
module.exports.isLoggedIn = (req, res, next) => {
   if (!req.isAuthenticated()) {
      if (!req.originalUrl == '/logout') {
         req.session.returnTo = req.originalUrl;
      }
      req.flash('error', 'You must be signed in to perform this action!');
      return res.redirect('/login');
   }
   next();
}

/*
======================================================================================
AUTHORIZATION MIDDLEWARE FOR NEW CAMPGROUND AND NEW REVIEW
======================================================================================
*/

module.exports.isAuthor = async (req, res, next) => {

   const { id } = req.params;
   const campground = await Campground.findById(id);

   if (!campground.author.equals(req.user._id)) {
      req.flash('error', 'You do not have permission to access this page!')
      return res.redirect(`/campgrounds/${id}`)
   }
   next();
}

module.exports.isReviewAuthor = async (req, res, next) => {

   const { id, reviewId } = req.params;
   const review = await Review.findById(reviewId);
   if (!review.author.equals(req.user._id)) {
      req.flash('error', 'You do not have permission to access this page!')
      return res.redirect(`/campgrounds/${id}`)
   }
   next();

}

/*
======================================================================================
FORM VALIDATION FUNCTION
======================================================================================
*/

module.exports.validateReviews = (req, res, next) => {
   const { error } = reviewsSchema.validate(req.body)
   if (error) {
      const msg = error.details.map(el => el.message).join(',')
      throw new ExpressError(msg, 400)
   } else {
      next();
   }
}

module.exports.validateCampground = (req, res, next) => {
   const { error } = campgroundSchema.validate(req.body)
   if (error) {
      const msg = error.details.map(el => el.message).join(',')
      throw new ExpressError(msg, 400)
   } else {
      next();
   }
}