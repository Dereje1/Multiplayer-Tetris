const room = require('./room');

const master = (io) => {
  room(io);
};

module.exports = master;
