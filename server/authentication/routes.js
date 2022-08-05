const ip = require('ip');
const isLoggedIn = require('./isloggedin');

const getProfile = (req, res) => {
  const { user } = req;
  const [service] = ['google', 'twitter'].filter(s => user[s] && Boolean(user[s].id));
  res.json({
    authenticated: true,
    userIp: ip.address(),
    username: user[service].id,
    userId: user[service].id,
    displayname: user[service].displayName,
    service,
  });
};


const logOut = (req, res) => {
  req.logout();
  res.redirect('/');
};

const setAuthRoutes = (app, passport) => {
  app.get('/auth/profile', isLoggedIn, getProfile);
  app.get('/auth/logout', logOut);
  app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
  app.get('/auth/google/redirect', passport.authenticate('google', {
    successRedirect: '/',
    failureRedirect: '/',
  }));
};

module.exports = {
  setAuthRoutes, getProfile, logOut,
};