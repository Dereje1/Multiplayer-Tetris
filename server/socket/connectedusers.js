// recieves emits from the header component in client
// when users login and logut
const CONSTANTS = require('../../client/src/constants/index').socket;

const { clientEmit: { SEND_LOGGED_IN_USER, USER_LOGGED_OUT } } = CONSTANTS;
const utility = require('./utility');

const authorizedUsers = (socket, callback) => {
  socket.on(SEND_LOGGED_IN_USER, (userProfile) => {
    let currentlyLoggedIn = [...utility.getUsers()];
    if (userProfile) { // null if client is not logged in
      // client has just logged in or has been logged in but refreshed app
      // If the google Id is already in main array disregard otherwise add
      const googleIdFilter = currentlyLoggedIn.filter(
        l => l.username === userProfile.username,
      );
      currentlyLoggedIn = !googleIdFilter.length
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
