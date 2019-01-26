const disconnectedUsers = (socket, callback) => {
  socket.on('disconnect', () => {
    callback(null, socket.id);
  });
};

module.exports = disconnectedUsers;
