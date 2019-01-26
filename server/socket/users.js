const CONSTANTS = require('../../client/src/constants/index').socket
// recieves emits from the header component in client
// when users login and logut
const authorizedUsers = (socket, callback) => {
  socket.on(CONSTANTS.clientEmit.SEND_LOGGED_IN_USER, (userProfile) => {
    callback(null, userProfile);
  });
  socket.on(CONSTANTS.clientEmit.USER_LOGGED_OUT, (userProfile) => {
    callback(null, userProfile);
  });
};

module.exports = authorizedUsers;
