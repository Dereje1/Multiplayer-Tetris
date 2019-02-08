const express = require('express');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');

const app = express();
// load root level middleware
/* testing for heroku https redirect */

app.use(logger('dev'));
/* redirect for heoku to https */
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production'
    && req.header('x-forwarded-proto') !== 'https') {
    res.redirect(`https://${req.header('host')}${req.url}`);
  } else next();
});
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieSession({
  maxAge: 21 * 24 * 60 * 60 * 1000,
  keys: [process.env.COOKIE_KEY],
}));
// connect to db
require('./models/db');
// configure authentication
require('./authentication/index')(app);

/* Build and deployment */
app.use('/', express.static(path.join(__dirname, '../client/build')));


/* app routes */
app.get('/', (req, res) => {
  res.redirect('/auth/profile');
});

app.get('/api/test', (req, res) => {
  res.json({ proxy: 'Working!' });
});
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
