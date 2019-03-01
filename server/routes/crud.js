const router = require('express').Router();
const isLoggedIn = require('../authentication/isloggedin');
const Single = require('../models/single');
const Match = require('../models/match');

router.post('/api/single', isLoggedIn, (req, res) => {
  const newSingle = req.body;
  Single.create(newSingle, (err, data) => {
    if (err) throw err;
    res.json(data);
  });
});

router.post('/api/multiplayer', isLoggedIn, (req, res) => {
  const newMatch = req.body;
  Match.create(newMatch, (err, data) => {
    if (err) throw err;
    res.json(data);
  });
});

router.get('/api/test', (req, res) => {
  res.json({ proxy: 'Working!' });
});

module.exports = router;
