const router = require('express').Router();
const isLoggedIn = require('../authentication/isloggedin');
const Single = require('../models/single');
const Match = require('../models/match');
const User = require('../models/user');

/* retrieves single player stats for a user */
const getSingleStats = googleId => new Promise((resolve, reject) => {
  Single.find({ googleId })
    .sort('-createdAt')
    .exec()
    .then(data => resolve(data))
    .catch(err => reject(err));
});
/* Creates an object of opponent ids/names from User collection for a set of matches */
const getOpponentNames = (googleId, data) => new Promise((resolve, reject) => {
  const userIds = [];
  data.forEach((match) => {
    if (googleId === match.winnerGoogleId) userIds.push(match.looserGoogleId);
    else userIds.push(match.winnerGoogleId);
  });
  const uniqueIds = Array.from(new Set(userIds));
  User.find()
    .where('google.id')
    .in(uniqueIds)
    .exec()
    .then((userData) => {
      const obj = {};
      userData.forEach((user) => {
        const gId = user.google.id;
        obj[gId] = user.google.displayName;
      });
      resolve(obj);
    })
    .catch(err => reject(err));
});
/* retrieves all the matches that a user has participated in */
const getMatchStats = googleId => new Promise((resolve, reject) => {
  Match.find()
    .or([{ winnerGoogleId: googleId }, { looserGoogleId: googleId }])
    .sort('-createdAt')
    .exec()
    .then(data => resolve(data))
    .catch(err => reject(err));
});
/* Add single player result to db */
router.post('/api/single', isLoggedIn, (req, res) => {
  const newSingle = req.body;
  const { id: googleId } = req.user.google;
  if (googleId !== newSingle.googleId) {
    res.json({ error: 'Unable to match Ids, Data not saved!!' });
  } else {
    Single.create(newSingle)
      .then(data => res.json(data))
      .catch(err => res.status(400).send(err));
  }
});
/* Add match result to db */
router.post('/api/multiplayer', isLoggedIn, (req, res) => {
  const newMatch = req.body;
  const { id: googleId } = req.user.google;
  if (googleId !== newMatch.winnerGoogleId && googleId !== newMatch.looserGoogleId) {
    res.json({ error: 'Unable to match Ids, Data not saved!!' });
  } else {
    Match.create(newMatch)
      .then(data => res.json(data))
      .catch(err => res.status(400).send(err));
  }
});
/* Get user data for client profile page consumption */
router.get('/api/user', isLoggedIn, async (req, res) => {
  const { id: googleId } = req.user.google;
  try {
    const singleStats = await getSingleStats(googleId);
    const matchStats = await getMatchStats(googleId);
    const opponentNames = await getOpponentNames(googleId, matchStats);
    res.json({ singleStats, matchStats, opponentNames });
  } catch (err) {
    res.status(400).send(err);
  }
});


module.exports = router;
