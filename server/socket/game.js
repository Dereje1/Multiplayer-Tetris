const CONSTANTS = require('../../client/src/constants/index').socket;
const utility = require('./utility');

const {
  clientEmit: {
    LOOK_FOR_OPPONENTS,
    OPPONENT_UNMOUNTED,
    INVITATION_SENT,
    INVITATION_DECLINED,
    INVITATION_ACCEPTED,
  },
} = CONSTANTS;
const { serverEmit: { UNMOUNT_OPPONENT } } = CONSTANTS;

const gamePlay = (socket, callback) => {
  socket.on(LOOK_FOR_OPPONENTS, () => {
    console.log(`${socket.id} is looking for opponents`);
    const currentlyLoggedIn = [...utility.getUsers()];

    const opponentPool = currentlyLoggedIn.filter(
      users => users.socketId !== socket.id && !users.oponnentId,
    );

    const clientOpponentPool = opponentPool.map((user) => {
      const { displayname, socketId } = user;
      return { displayname, socketId };
    });
    callback(null, { operation: 'generateOpponentPool', data: clientOpponentPool.slice(0, 4) });
  });
  socket.on(OPPONENT_UNMOUNTED, () => {
    socket.emit(UNMOUNT_OPPONENT, null);
    callback(null, null);
  });
  socket.on(INVITATION_SENT, (data) => {
    const currentlyLoggedIn = [...utility.getUsers()];
    const { sentTo, difficulty } = data;
    const invitationSender = currentlyLoggedIn.filter(user => user.socketId === socket.id)[0];
    const invitationReciever = currentlyLoggedIn.filter(user => user.socketId === sentTo)[0];
    const { displayname, socketId } = invitationSender;
    const { displayname: displaynameReciever, socketId: socketIdReciever } = invitationReciever;
    callback(null, {
      operation: 'recieveInvite',
      data: {
        sender: { displayname, socketId, difficulty },
        reciever: { displaynameReciever, socketIdReciever },
      },
    });
  });
  socket.on(INVITATION_DECLINED, (data) => {
    const { invitationFrom: { socketId } } = data;
    callback(null, {
      operation: 'declinedInvite',
      data: {
        sender: socketId,
      },
    });
  });
  socket.on(INVITATION_ACCEPTED, (data) => {
    const currentlyLoggedIn = [...utility.getUsers()];
    const { invitationFrom: { socketId: invitationSenderId } } = data;
    const sender = {};
    const reciever = {};
    currentlyLoggedIn.forEach(
      (user) => {
        const { displayname, username } = user;
        // send opponent data to respective players.
        if (user.socketId === invitationSenderId) { // user that sent the invite
          user.oponnentId = socket.id;
          reciever.opponnetDisplayname = displayname;
          reciever.opponnetusername = username;
          sender.opponentSID = socket.id;
        }
        if (user.socketId === socket.id) { // user that accepted the invite
          user.oponnentId = invitationSenderId;
          sender.opponnetDisplayname = displayname;
          sender.opponnetusername = username;
          reciever.opponentSID = invitationSenderId;
        }
      },
    );
    utility.setUsers(currentlyLoggedIn);
    callback(null, {
      operation: 'acceptedInvite',
      data: {
        sender,
        reciever,
      },
    });
  });
};

module.exports = gamePlay;
