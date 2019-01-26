// handles all socket transactions
const connectedUsers = require('./connectedusers');
const disconnectedUsers = require('./disconnectedusers');
const CONSTANTS = require('../../client/src/constants/index').socket;

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
    connectedUsers(socket, (err, userProfile) => {
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
      // send back to specific client ONLY it's socket ID
      socket.emit(CONSTANTS.serverEmit.ClIENT_SOCKET_ID, socket.id);
    });
    disconnectedUsers(socket, (err, discUser) => {
      if (err) throw err;
      const indexOfDisconnected = currentlyLoggedIn.findIndex(
        l => l.socketId === discUser,
      );
      if (indexOfDisconnected !== -1) {
        currentlyLoggedIn = [
          ...currentlyLoggedIn.slice(0, indexOfDisconnected),
          ...currentlyLoggedIn.slice(indexOfDisconnected + 1)];
        // emit only if the disconneted user was already in the pool of currently LoggedIn
        io.emit(CONSTANTS.serverEmit.LOGGED_IN_USERS, currentlyLoggedIn.length);
      }
      console.log('A User has disconnected', discUser);
    });
  });
};

module.exports = master;
