const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieSession = require('cookie-session');

const app = express();
// load root level middleware
app.use(logger('dev'));
/* redirection for heroku to https from http */
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production'
    && req.header('x-forwarded-proto') !== 'https') {
    res.redirect(`https://${req.header('host')}${req.url}`);
  } else next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieSession({
  maxAge: 21 * 24 * 60 * 60 * 1000,
  keys: [process.env.COOKIE_KEY],
}));
/* Build and deployment */
app.use('/', express.static(path.join(__dirname, '../client/build')));
// connect to db
require('./models/db');
// configure authentication
require('./authentication/index')(app);

// use crud routes
app.use(require('./routes/crud').router);
/* Build and deployment */
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});
// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json(err);
});

module.exports = app;
