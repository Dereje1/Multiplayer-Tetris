let userArr = [];

module.exports = {
  getUsers: () => [...userArr],
  setUsers: (newUsers) => {
    userArr = [...newUsers];
  },
  modifyProfile: (profile, sockId) => {
    const { username, displayname, userip } = profile;
    return {
      username,
      displayname,
      userip,
      socketId: sockId,
      oponnentId: null,
      pending: null,
    };
  },
  createPool(socket) {
    console.log(`${socket.id} is looking for opponents`);
    const currentlyLoggedIn = [...this.getUsers()];

    const opponentPool = currentlyLoggedIn.filter(
      users => users.socketId !== socket.id && !users.oponnentId && !users.pending,
    );

    const clientOpponentPool = opponentPool.map((user) => {
      const { displayname, socketId } = user;
      return { displayname, socketId };
    });
    return clientOpponentPool.slice(0, 4);
  },
};
