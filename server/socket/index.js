// handles all socket transactions
const connectedUsers = require('./connectedusers');
const disconnectedUsers = require('./disconnectedusers');
const game = require('./game');
const {
  handleConnectedUsersCallBack,
  handleDisconnectedUsersCallBack,
  handleGameCallBack
} = require('./callBackHandlers')
const CONSTANTS = require('../../client/src/constants/index').socket;
const utility = require('./utility');

const master = (io) => {
  // establish initial connection and get socket on callback
  io.on('connection', (socket) => {
    console.log(`SocketID ${socket.id} has connected`);
    socket.on('pool', () => {
      console.log(utility.getUsers());
    });
    // when a user connects search for existing logged in clients
    socket.emit(CONSTANTS.serverEmit.SERVER_RESET, 'get users');
    // call auth users to listen to client emits on user login / logout, recieves a callback
    connectedUsers(socket, (err, updatedUsers) => handleConnectedUsersCallBack(err, updatedUsers, io, socket));
    // Handle disconnections and emit new user list length to all clients
    disconnectedUsers(socket, (err, returnedData) => handleDisconnectedUsersCallBack(err, returnedData, io, socket));
    // Handles Game Play;
    game(socket, (err, returnedData) => handleGameCallBack(err, returnedData, io, socket));
  });
};

module.exports = master;
