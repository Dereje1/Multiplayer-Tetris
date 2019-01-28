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
    };
  },
};
