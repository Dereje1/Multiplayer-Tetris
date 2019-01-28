const CONSTANTS = require('../../client/src/constants/index').socket;
const utility = require('./utility');

const { clientEmit: { LOOK_FOR_OPPONENTS, OPPONENT_UNMOUNTED } } = CONSTANTS;
const { serverEmit: { UNMOUNT_OPPONENT } } = CONSTANTS;

const gamePlay = (socket, callback) => {
  socket.on(LOOK_FOR_OPPONENTS, () => {
    console.log(`${socket.id} is looking for opponents`);
    const currentlyLoggedIn = [...utility.getUsers()];

    const opponentPool = currentlyLoggedIn.filter(
      users => users.socketId !== socket.id && !users.oponnentId,
    );

    const clientOpponentPool = opponentPool.map((user) => {
      const { displayname, socketId } = user;
      return { displayname, socketId };
    });
    callback(null, { operation: 'generateOpponentPool', data: clientOpponentPool.slice(0, 4) });
  });
  socket.on(OPPONENT_UNMOUNTED, () => {
    socket.emit(UNMOUNT_OPPONENT, null);
    callback(null, null);
  });
};

module.exports = gamePlay;
