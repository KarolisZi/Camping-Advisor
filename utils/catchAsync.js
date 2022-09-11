// ERROR CATCH FUNCTION - catches any errors
module.exports = func => {
   return function (req, res, next) {
      func(req, res, next).catch(err => next(err));
   }
}