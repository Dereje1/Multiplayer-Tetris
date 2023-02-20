
module.exports = {
  userArr: [],
  getUsers() { return [...this.userArr]; },
  setUsers(newUsers) {
    this.userArr = [...newUsers];
  },
  modifyProfile: (profile, socketId) => {
    const { userId, displayName, userIp } = profile;
    return {
      userId,
      displayName,
      userIp,
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
      .map(({ displayName, socketId }) => ({ displayName, socketId }))
      .slice(0, 4);
  },
  findUserBySocketId(socketID) {
    const [user] = this.userArr.filter(u => u.socketId === socketID);
    return user || null;
  },
};
