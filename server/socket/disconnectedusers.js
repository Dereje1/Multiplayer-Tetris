const utility = require('./utility');

const disconnectedUsers = (socket, callback) => {
  socket.on('disconnect', () => {
    let currentlyLoggedIn = [...utility.getUsers()];
    const indexOfDisconnected = currentlyLoggedIn.findIndex(
      l => l.socketId === socket.id,
    );

    if (indexOfDisconnected !== -1) {
      currentlyLoggedIn = [
        ...currentlyLoggedIn.slice(0, indexOfDisconnected),
        ...currentlyLoggedIn.slice(indexOfDisconnected + 1)];
      // emit only if the disconneted user was already in the pool of currently LoggedIn
      callback(null, currentlyLoggedIn);
    }
  });
};

module.exports = disconnectedUsers;
