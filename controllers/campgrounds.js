const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken })

const Campground = require('../models/campground.js');
const { cloudinary } = require('../cloudinary/index.js');

module.exports.index = async (req, res) => {

   const campgrounds = await Campground.find({});
   res.render('campgrounds/index', { campgrounds });
}

module.exports.new = (req, res) => {

   res.render('campgrounds/new');
}

module.exports.create = async (req, res) => {

   const geoData = await geocoder.forwardGeocode({
      query: req.body.campground.location,
      limit: 1
   }).send()

   const newCampground = new Campground(req.body.campground);
   // Add author
   newCampground.author = req.user._id;
   // Add file urls and paths stored in the cloud
   newCampground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
   // Add geo location
   newCampground.geometry = geoData.body.features[0].geometry;
   await newCampground.save();
   req.flash('success', 'New campground created successfuly!');
   res.redirect(`/campgrounds/${newCampground._id}`);
}

module.exports.show = async (req, res) => {
   const campground = await Campground.findById(req.params.id).populate({ path: 'reviews', populate: { path: 'author' } }).populate('author');
   if (!campground) {
      req.flash('error', 'Campground not found!');
      return res.redirect('/campgrounds');
   }
   res.render('campgrounds/show', { campground });
}

module.exports.edit = async (req, res) => {

   const campground = await Campground.findById(req.params.id);
   if (!campground) {
      req.flash('error', 'Campground not found!');
      return res.redirect('/campgrounds');
   }

   res.render('campgrounds/edit', { campground });
}

module.exports.update = async (req, res) => {

   const { id } = req.params;
   // Update body (text) information
   const campground = await Campground.findByIdAndUpdate(id, req.body.campground);
   // Update (add) images
   const images = req.files.map(f => ({ url: f.path, filename: f.filename }))
   campground.images.push(...images);
   await campground.save();
   // Update (remove) images
   if (req.body.deleteImages) {
      for (let filename of req.body.deleteImages) {
         await cloudinary.uploader.destroy(filename);
      }
      await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
   }

   req.flash('success', 'Campground updated successfully!');
   res.redirect(`/campgrounds/${id}`);
}

module.exports.delete = async (req, res) => {

   await Campground.findByIdAndDelete(req.params.id);
   req.flash('success', 'Campground deleted successfully!');
   res.redirect('/campgrounds');
}
