
module.exports = {
  userArr: [],
  getUsers() { return [...this.userArr]; },
  setUsers(newUsers) {
    this.userArr = [...newUsers];
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
    const currentlyLoggedIn = [...this.userArr];

    return currentlyLoggedIn
      .filter(users => users.socketId !== socket.id && !users.oponnentId && !users.pending)
      .map(({ displayname, socketId }) => ({ displayname, socketId }))
      .slice(0, 4);
  },
};
