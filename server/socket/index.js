// handles all socket transactions
const authUsers = require('./users');
const CONSTANTS = require('../../client/src/constants/index').socket

let currentlyLoggedIn = [];
const modifyProfile = (profile, sockId) => {
  const { username, displayname, userip } = profile;
  return {
    username,
    displayname,
    userip,
    socketId: sockId,
  };
};

const master = (io) => {
  // establish initial connection and get socket on callback
  io.on('connection', (socket) => {
    console.log('A User has connected');
    // call auth users to listen to client emits on user login / logout, recieves a callback
    authUsers(socket, (err, userProfile) => {
      if (err) throw err;
      if (userProfile) { // null if client is not logged in
        if (userProfile.remove) { // client is logging out
          const indexOfDeletion = currentlyLoggedIn.findIndex(
            l => l.username === userProfile.username,
          );
          // remove from main array
          currentlyLoggedIn = [
            ...currentlyLoggedIn.slice(0, indexOfDeletion),
            ...currentlyLoggedIn.slice(indexOfDeletion + 1)];
        } else { // client has just logged in or has been logged in but refreshed app
          // If the google Id is already in main array disregard otherwise add
          const googleIdFilter = currentlyLoggedIn.filter(
            l => l.username === userProfile.username,
          );
          currentlyLoggedIn = !googleIdFilter.length
            ? [...currentlyLoggedIn, modifyProfile(userProfile, socket.id)]
            : [...currentlyLoggedIn];
        }
      }
      console.log(currentlyLoggedIn);
      // send back to client the number of logged in users.
      io.emit(CONSTANTS.serverEmit.LOGGED_IN_USERS, currentlyLoggedIn.length);
    });
  });
};

module.exports = master;
