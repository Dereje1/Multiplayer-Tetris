const router = require('express').Router();
const { isLoggedIn } = require('passportbundle');
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
    .where('userId')
    .in(uniqueIds)
    .exec()
    .then((userData) => {
      const obj = {};
      userData.forEach((user) => {
        const gId = user.userId;
        obj[gId] = user.displayName;
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

const saveSingleGameResults = async (req, res) => {
  try {
    const { linesCleared, levelReached, playerUserId } = req.body;
    const { _id } = req.user;
    if (_id.toString() !== playerUserId) {
      res.json({ error: 'Unable to match Ids, Data not saved!!' });
    } else {
      const user = await User.findById(_id)
      const payload = {
        linesCleared,
        levelReached,
        googleId: user.userId
      }
      const data = await Single.create(payload)
      res.json(data)
    }
  } catch (err) {
    res.status(400).send(err)
  }
}

const saveMatchGameResults = async (req, res) => {
  try {
    const { winnerUserId, looserUserId, ...rest } = req.body;
    const { _id } = req.user;
    if (_id.toString() !== winnerUserId && _id.toString() !== looserUserId) {
      res.json({ error: 'Unable to match Ids, Data not saved!!' });
    } else {
      const { userId: winnerGoogleId } = await User.findById(winnerUserId)
      const { userId: looserGoogleId } = await User.findById(looserUserId)
      const payload = {
        ...rest,
        winnerGoogleId,
        looserGoogleId
      }
      const data = await Match.create(payload)
      res.json(data)
    }
  } catch (err) {
    res.status(400).send(err)
  }
}

const fetchUserData = async (req, res) => {
  const { userId: googleId } = req.user;
  try {
    const singleStats = await getSingleStats(googleId);
    const matchStats = await getMatchStats(googleId);
    const opponentNames = await getOpponentNames(googleId, matchStats);
    res.json({ singleStats, matchStats, opponentNames, googleId });
  } catch (err) {
    res.status(400).send(err);
  }
}

const deleteSingleResult = async (req, res) => {
  try {
    const { userId: googleId } = req.user;
    const query = { _id: req.params._id };
    const idToRemove = req.params._id;
    const singleResult = await Single.findById(idToRemove).exec();
    if (googleId === singleResult.googleId) {
      const removedResult = await Single.findOneAndRemove(query).exec();
      console.log(`${googleId} deleted result ${JSON.stringify(removedResult)}`);
      res.json(removedResult);
    } else {
      console.log(`Invalid deletion by googleId: ${googleId} for _id: ${idToRemove}`)
      res.json(`Invalid deletion by googleId: ${googleId} for _id: ${idToRemove}`);
    }
  } catch (err) {
    res.status(400).send(err)
  }
};

/* Add single player result to db */
router.post('/api/single', isLoggedIn, saveSingleGameResults);
/* Add match result to db */
router.post('/api/multiplayer', isLoggedIn, saveMatchGameResults);
/* Get user data for client profile page consumption */
router.get('/api/user', isLoggedIn, fetchUserData);
// deletes a single game result if owned by user
router.delete('/api/delete_single/:_id', isLoggedIn, deleteSingleResult);

module.exports = { router, saveSingleGameResults, saveMatchGameResults, fetchUserData, deleteSingleResult };
