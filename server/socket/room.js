const roomTest = (io) => {
  io.on('connection', () => {
    console.log('user connected in room');
  });
};

module.exports = roomTest;
