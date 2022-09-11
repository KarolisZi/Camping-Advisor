const mongoose = require('mongoose')
const Review = require('./review');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({

   url: String,
   filename: String,

})

const opts = { toJSON: { virtuals: true } };

const CampgroundSchema = new Schema({

   title: String,
   images: [ImageSchema],
   price: Number,
   location: String,
   description: String,
   author: {
      type: Schema.Types.ObjectId,
      ref: 'User'
   },
   reviews: [
      {
         type: Schema.Types.ObjectId,
         ref: 'Review'
      }
   ],
   geometry: {
      type: {
         type: String,
         enmu: ['Point'],
         required: true,
      },
      coordinates: {
         type: [Number],
         required: true,
      }
   },
}, opts);

CampgroundSchema.post('findOneAndDelete', async function (doc) {

   if (doc) {

      await Review.deleteMany({
         _id: { $in: doc.reviews }
      })
   }

});

ImageSchema.virtual('thumbnail').get(function () {

   return this.url.replace('/upload', '/upload/w_200')
})

CampgroundSchema.virtual('properties.learnMorePopUp').get(function () {

   return (`<a href="/campgrounds/${this._id}">Learn more about "${this.title}"</a>`)
})

CampgroundSchema.virtual('properties.googleMapsUrl').get(function () {

   return (`<a href="http://maps.google.com/maps?z=12&t=m&q=loc:${this.geometry.coordinates[1]}+${this.geometry.coordinates[0]}">Open "${this.title}" in Google Maps</a>`)
})

module.exports = mongoose.model('Campground', CampgroundSchema);