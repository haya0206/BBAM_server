const passport = require('passport');

router.post('/login', passport.authenticate('local', {
  failureRedirect: '/'
}), (req, res) => {
  res.redirect('/');
});