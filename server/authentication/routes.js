const isLoggedIn = require('./isloggedin');

const authRoutes = (app, passport) => {
  // login route
  app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
  // redirect from google
  app.get('/auth/google/redirect', passport.authenticate('google', { successRedirect: '/', failureRedirect: '/' }));
  // logout route
  app.get('/auth/logout', (req, res) => {
    req.logout();
    res.redirect('/');
  });
  // populates auth/profile endpoint if logged in
  app.get('/auth/profile', isLoggedIn, (req, res) => {
    res.json({
      authenticated: true,
      userip: req.userip,
      username: req.user.google.id,
      displayname: req.user.google.displayName,
    });
  });
};

module.exports = authRoutes;
