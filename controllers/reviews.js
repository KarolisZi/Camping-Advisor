const Review = require('../models/review');
const Campground = require('../models/campground');

module.exports.create = async (req, res) => {

   const campground = await Campground.findById(req.params.id)
   const newReview = new Review(req.body.review);
   newReview.author = req.user._id

   campground.reviews.push(newReview)

   await Promise.all([newReview.save(), campground.save()]);
   req.flash('success', 'Review created successfully!')

   res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.delete = async (req, res) => {
   const { id, reviewId } = req.params;
   await Promise.all([Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }), Review.findByIdAndDelete(reviewId)]);
   req.flash('success', 'Review deleted successfully!!')
   res.redirect(`/campgrounds/${id}`)
}