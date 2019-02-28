const CONSTANTS = require('../../client/src/constants/index').socket;
const utility = require('./utility');

const {
  clientEmit: {
    LOOK_FOR_OPPONENTS,
    OPPONENT_UNMOUNTED,
    INVITATION_SENT,
    INVITATION_DECLINED,
    INVITATION_ACCEPTED,
    START_GAME,
    UPDATED_CLIENT_SCREEN,
    GAME_OVER,
  },
} = CONSTANTS;
const { serverEmit: { UNMOUNT_OPPONENT } } = CONSTANTS;

const gamePlay = (socket, callback) => {
  socket.on(LOOK_FOR_OPPONENTS, () => {
    callback(null, { operation: 'generateOpponentPool', data: utility.createPool(socket) });
  });

  socket.on(OPPONENT_UNMOUNTED, () => {
    socket.emit(UNMOUNT_OPPONENT, null);
    callback(null, null);
  });

  socket.on(INVITATION_SENT, (data) => {
    console.log('Invitation Sent', data);
    const currentlyLoggedIn = [...utility.getUsers()];
    const { sentTo, difficulty } = data;
    const invitationSender = currentlyLoggedIn.filter(user => user.socketId === socket.id)[0];
    const invitationReciever = currentlyLoggedIn.filter(user => user.socketId === sentTo)[0];
    const { displayname, socketId } = invitationSender;
    const { displayname: displaynameReciever, socketId: socketIdReciever } = invitationReciever;

    currentlyLoggedIn.forEach(
      (user) => {
        // set game pending status
        if (user.socketId === socketId) {
          // change status from null on server
          user.pending = socketIdReciever;
        }
        if (user.socketId === socketIdReciever) {
          user.pending = socketId;
        }
      },
    );
    utility.setUsers(currentlyLoggedIn);
    callback(null, {
      operation: 'recieveInvite',
      data: {
        sender: { displayname, socketId, difficulty },
        reciever: { displaynameReciever, socketIdReciever },
      },
    });
  });

  socket.on(INVITATION_DECLINED, (data) => {
    const { invitationFrom: { socketId: invitationSenderId } } = data;
    const currentlyLoggedIn = [...utility.getUsers()];
    currentlyLoggedIn.forEach(
      (user) => {
        // set game pending status
        if (user.socketId === socket.id) {
          // change status from null on server
          user.pending = null;
        }
        if (user.socketId === invitationSenderId) {
          user.pending = null;
        }
      },
    );
    callback(null, {
      operation: 'declinedInvite',
      data: {
        sender: invitationSenderId,
      },
    });
  });

  socket.on(INVITATION_ACCEPTED, (data) => {
    const currentlyLoggedIn = [...utility.getUsers()];
    const { invitationFrom: { socketId: invitationSenderId } } = data;
    const timeToGameStart = 10;
    // Initialize the game information objects
    const sender = { countdown: timeToGameStart, difficulty: data.invitationFrom.difficulty };
    const reciever = { countdown: timeToGameStart, difficulty: data.invitationFrom.difficulty };
    currentlyLoggedIn.forEach(
      (user) => {
        const { displayname } = user;
        // send opponent data to respective players.
        if (user.socketId === invitationSenderId) { // user that sent the invite;
          // change status from null on server
          user.oponnentId = socket.id;
          // for client usage
          reciever.opponnetDisplayname = displayname;
          sender.opponentSID = socket.id;
        }
        if (user.socketId === socket.id) { // user that accepted the invite
          user.oponnentId = invitationSenderId;
          // for client usage
          sender.opponnetDisplayname = displayname;
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

  socket.on(START_GAME, (data) => {
    const currentlyLoggedIn = [...utility.getUsers()];
    const { opponentInfo, clientScreen } = data;
    currentlyLoggedIn.forEach(
      (user) => {
        // remove game pending status
        if (user.socketId === socket.id) {
          // change pending status to null on server
          user.pending = null;
        }
        if (user.socketId === opponentInfo.opponentSID) {
          user.pending = null;
        }
      },
    );
    utility.setUsers(currentlyLoggedIn);
    callback(null, {
      operation: 'gamestart',
      data: {
        opponentInfo,
        clientScreen,
      },
    });
  });

  socket.on(UPDATED_CLIENT_SCREEN, (data) => {
    // check if user has an opponent before transmitting
    // avoids resdual transmit on a game win or a disconnect
    const currentlyLoggedIn = [...utility.getUsers()];
    const opponentStillActive = currentlyLoggedIn.filter(user => user.socketId === socket.id)[0];
    const dataToSend = opponentStillActive && opponentStillActive.oponnentId ? data : null;
    callback(null, {
      operation: 'gameinprogress',
      data: dataToSend,
    });
  });

  socket.on(GAME_OVER, (data) => {
    const currentlyLoggedIn = [...utility.getUsers()];
    const winnerSID = data.temp.gameInProgress.info.opponentSID;
    const loosingSID = data.mySocketId;
    let winnerGoogleID = '';
    let looserGoogleID = '';
    currentlyLoggedIn.forEach((user) => {
      if (user.socketId === winnerSID) {
        winnerGoogleID = user.username;
        user.oponnentId = null;
      }
      if (user.socketId === loosingSID) {
        looserGoogleID = user.username;
        user.oponnentId = null;
      }
    });
    utility.setUsers(currentlyLoggedIn);
    callback(null, {
      operation: 'gameFinished',
      data: {
        winnerSID, loosingSID, winnerGoogleID, looserGoogleID,
      },
    });
  });
};

module.exports = gamePlay;
