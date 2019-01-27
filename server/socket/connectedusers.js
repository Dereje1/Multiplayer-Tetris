// recieves emits from the header component in client
// when users login and logut
const CONSTANTS = require('../../client/src/constants/index').socket;

const { clientEmit: { SEND_LOGGED_IN_USER, USER_LOGGED_OUT } } = CONSTANTS;

const authorizedUsers = (socket, callback) => {
  socket.on(SEND_LOGGED_IN_USER, (userProfile) => {
    callback(null, userProfile);
  });
  socket.on(USER_LOGGED_OUT, (userProfile) => {
    callback(null, userProfile);
  });
};

module.exports = authorizedUsers;
