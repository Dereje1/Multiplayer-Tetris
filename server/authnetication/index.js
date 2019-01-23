const passport = require('passport');
const configurePassport = require('./configurepassport');
const authRoutes = require('./routes');

const authenticationConfig = (app) => {
  // pass passport for configuration
  configurePassport(passport);
  // initialize passport
  app.use(passport.initialize());
  // persist session and deserialize user
  app.use(passport.session());
  // pass app and passport for routes to use
  authRoutes(app, passport);
};

module.exports = authenticationConfig;
