// handles all socket transactions
const connectedUsers = require('./connectedusers');
const disconnectedUsers = require('./disconnectedusers');
const game = require('./game');
const CONSTANTS = require('../../client/src/constants/index').socket;
const utility = require('./utility');

const {
  serverEmit: {
    LOGGED_IN_USERS, SOCKET_ID, SERVER_RESET, OPPONENT_POOL,
    INVITE_SENT, INVITE_RECIEVED, DECLINED_INVITATION, ACCEPTED_INVITATION,
    GAME_STARTED, OPPONENT_SCREEN, FINISH_GAME,
  },
} = CONSTANTS;

const master = (io) => {
  // establish initial connection and get socket on callback
  io.on('connection', (socket) => {
    console.log(`SocketID ${socket.id} has connected`);
    socket.on('pool', () => {
      console.log(utility.getUsers());
    });
    // when a user connects search for existing logged in clients
    socket.emit(SERVER_RESET, 'get users');
    // call auth users to listen to client emits on user login / logout, recieves a callback
    connectedUsers(socket, (err, updatedUsers) => {
      if (err) throw err;
      utility.setUsers(updatedUsers);
      // send back to client the number of logged in users.
      io.emit(LOGGED_IN_USERS, updatedUsers.length);
      // send back to specific client ONLY it's socket ID
      socket.emit(SOCKET_ID, socket.id);
    });
    // Handle disconnections and emit new user list length to all clients
    disconnectedUsers(socket, (err, updatedUsers) => {
      if (err) throw err;
      utility.setUsers(updatedUsers);
      io.emit(LOGGED_IN_USERS, updatedUsers.length);
      console.log('A User has disconnected', socket.id);
    });
    // Handle Game Pla
    game(socket, (err, returnedData) => {
      if (err) throw err;
      if (!returnedData) return;
      if (returnedData.operation === 'generateOpponentPool') socket.emit(OPPONENT_POOL, returnedData.data);
      if (returnedData.operation === 'recieveInvite') {
        io.to(returnedData.data.reciever.socketIdReciever)
          .emit(INVITE_RECIEVED, returnedData.data.sender);
        socket.emit(INVITE_SENT, returnedData.data.reciever);
      }
      if (returnedData.operation === 'declinedInvite') {
        io.to(returnedData.data.sender)
          .emit(DECLINED_INVITATION, null);
      }
      if (returnedData.operation === 'acceptedInvite') {
        io.to(returnedData.data.reciever.opponentSID)
          .emit(ACCEPTED_INVITATION, returnedData.data.sender);
        socket.emit(ACCEPTED_INVITATION, returnedData.data.reciever);
      }
      if (returnedData.operation === 'gamestart') {
        socket.emit(GAME_STARTED,
          { info: returnedData.data.opponentInfo },
          async (confirmation) => {
            await console.log(confirmation);
            io.to(returnedData.data.opponentInfo.opponentSID)
              .emit(OPPONENT_SCREEN, returnedData.data.clientScreen);
          });
      }
      if (returnedData.operation === 'gameinprogress') {
        io.to(returnedData.data.opponentSID)
          .emit(OPPONENT_SCREEN, returnedData.data.clientScreen);
      }
      if (returnedData.operation === 'gameFinished') {
        io.to(returnedData.data.winnerSID)
          .emit(FINISH_GAME, returnedData.data);
        socket.emit(FINISH_GAME, returnedData.data);
      }
    });
  });
};

module.exports = master;
