const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const User = require('../models/user');

const strategy = new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK,
}, (token, tokenSecret, profile, done) => {
  User.findOne({ 'google.id': profile.id }, (err, user) => {
    if (err) return done(err);
    if (user) return done(null, user);
    // create new user
    const newUser = new User({
      google: {
        id: profile.id,
        token,
        displayName: profile.displayName,
        email: profile.emails[0].value,
      },
    });
    newUser.save((saveErr) => {
      if (saveErr) throw saveErr;
      return done(null, newUser);
    });
    return false; // eslint needs return
  });
});

const configuration = (passport) => {
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });
  passport.use(strategy);
};

module.exports = configuration;
