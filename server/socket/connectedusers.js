// recieves emits from the header component in client
// when users login and logut
const CONSTANTS = require('../../client/src/constants/index').socket;
const utility = require('./utility');

const { clientEmit: { SEND_LOGGED_IN_USER, USER_LOGGED_OUT } } = CONSTANTS;


const authorizedUsers = (socket, callback) => {
  socket.on(SEND_LOGGED_IN_USER, (userProfile) => {
    let currentlyLoggedIn = [...utility.getUsers()];
    if (userProfile) { // null if client is not logged in
      // client has just logged in or has been logged in but refreshed app
      // If the google Id is already in main array disregard otherwise add
      const existsInPool = currentlyLoggedIn.some(
        l => l.username === userProfile.username,
      );
      currentlyLoggedIn = !existsInPool
        ? [...currentlyLoggedIn, utility.modifyProfile(userProfile, socket.id)]
        : [...currentlyLoggedIn];
    }
    callback(null, currentlyLoggedIn);
  });
  socket.on(USER_LOGGED_OUT, (userProfile) => {
    // client is logging out
    let currentlyLoggedIn = [...utility.getUsers()];
    const indexOfDeletion = currentlyLoggedIn.findIndex(
      l => l.username === userProfile.username,
    );
      // remove from main array
    currentlyLoggedIn = [
      ...currentlyLoggedIn.slice(0, indexOfDeletion),
      ...currentlyLoggedIn.slice(indexOfDeletion + 1)];

    callback(null, currentlyLoggedIn);
  });
};

module.exports = authorizedUsers;
