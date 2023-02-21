const utility = require('./utility');

const disconnectedUsers = (socket, callback) => {
  socket.on('disconnect', () => {
    let currentlyLoggedIn = [...utility.getUsers()];
    const indexOfDisconnected = currentlyLoggedIn.findIndex(
      l => l.socketId === socket.id,
    );
    // if inGAme is true, user just disconnected in the middle of a game disqualify first
    let disconnectionStatus = null;
    if (indexOfDisconnected !== -1) {
      // get the connection of the user the game was disconnected on
      const isPending = currentlyLoggedIn[indexOfDisconnected].pending;
      const isInGame = currentlyLoggedIn[indexOfDisconnected].oponnentId;
      const looserUserId = currentlyLoggedIn[indexOfDisconnected].userId;
      const winnerUserId = isInGame
        ? currentlyLoggedIn.filter(u => u.socketId === isInGame)[0].userId
        : '';
      // pending is when an invitation has been accepted and countdown started
      if (isPending) {
        disconnectionStatus = { pending: true, connection: isPending };
      }
      // inGame is when countdown finished.
      if (!isPending && isInGame) {
        disconnectionStatus = {
          inGame: true, connection: isInGame, looserUserId, winnerUserId,
        };
      }
      currentlyLoggedIn.forEach((user) => {
        if ((user.socketId === isPending) || (user.socketId === isInGame)) {
          user.pending = null;
          user.oponnentId = null;
        }
      });
      // remove disconnected user out of list
      currentlyLoggedIn = [
        ...currentlyLoggedIn.slice(0, indexOfDisconnected),
        ...currentlyLoggedIn.slice(indexOfDisconnected + 1)];
      // emit only if the disconneted user was already in the pool of currently LoggedIn;
      utility.setUsers(currentlyLoggedIn);
      callback(null, {
        operation: 'disconnection',
        data: currentlyLoggedIn,
        disconnectionStatus,
      });
    }
  });
};

module.exports = disconnectedUsers;
