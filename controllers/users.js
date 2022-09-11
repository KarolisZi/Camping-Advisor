const ExpressError = require('../utils/ExpressError');
const User = require('../models/user')

module.exports.createUserForm = (req, res) => {

   res.render('users/register')
}

module.exports.createUser = async (req, res) => {
   try {
      const { email, password, username } = req.body;
      const user = new User({ email, username })
      const newUser = await User.register(user, password);
      req.login(newUser, (err) => {
         if (err) return new ExpressError('Something went wrong.', 500)
         req.flash('success', `Welcome ${newUser.username}. You have registered successfully!`)
         res.redirect('/campgrounds');
      });

   } catch (e) {
      req.flash('error', e.message);
      res.redirect('/register');
   }
}

module.exports.loginUserForm = (req, res) => {
   res.render('users/login')
}

module.exports.loginUser = (req, res) => {

   req.flash('success', 'Logged in successfully!');
   const redirectURL = req.session.returnTo || '/campgrounds';
   delete req.session.returnTo;
   res.redirect(redirectURL);
}

module.exports.logoutUser = (req, res) => {

   req.logout((err) => {
      if (err) return new ExpressError('Something went wrong.', 500)
      req.flash('success', 'Goodbye!')
      res.redirect('/')
   })

}