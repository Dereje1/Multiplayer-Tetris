
module.exports = {
  userArr: [],
  getUsers() { return [...this.userArr]; },
  setUsers(newUsers) {
    this.userArr = [...newUsers];
  },
  modifyProfile: (profile, socketId) => {
    const { username, displayname, userip } = profile;
    return {
      username,
      displayname,
      userip,
      socketId,
      oponnentId: null,
      pending: null,
    };
  },
  createPool(socket) {
    console.log(`${socket.id} is looking for opponents`);
    const currentlyLoggedIn = [...this.userArr];

    return currentlyLoggedIn
      .filter(users => users.socketId !== socket.id && !users.oponnentId && !users.pending)
      .map(({ displayname, socketId }) => ({ displayname, socketId }))
      .slice(0, 4);
  },
  findUserBySocketId(socketID) {
    const [user] = this.userArr.filter(u => u.socketId === socketID);
    return user || null;
  },
};
