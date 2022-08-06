const utility = require('./utility');
const CONSTANTS = require('../../client/src/constants/index').socket;

const {
    serverEmit: {
        LOGGED_IN_USERS, SOCKET_ID, OPPONENT_POOL,
        INVITE_SENT, INVITE_RECIEVED, DECLINED_INVITATION, ACCEPTED_INVITATION,
        GAME_STARTED, OPPONENT_SCREEN, FINISH_GAME, UNMOUNT_OPPONENT,
    },
} = CONSTANTS;

const handleConnectedUsersCallBack = (err, updatedUsers, io, socket) => {
    if (err) throw err;
    utility.setUsers(updatedUsers);
    // send back to client the number of logged in users
    io.emit(LOGGED_IN_USERS, updatedUsers.length);
    // send back to specific client ONLY it's socket ID
    socket.emit(SOCKET_ID, socket.id);
}

const handleDisconnectedUsersCallBack = (err, returnedData, io, socket) => {
    if (err) throw err;
    utility.setUsers(returnedData.data);
    // disqualify player if disconneted while in a game
    if (returnedData.disconnectionStatus && returnedData.disconnectionStatus.inGame) {
        io.to(returnedData.disconnectionStatus.connection)
            .emit(FINISH_GAME, {
                winnerSID: returnedData.disconnectionStatus.connection,
                loosingSID: socket.id,
                looserGoogleID: returnedData.disconnectionStatus.looserGoogleID,
                winnerGoogleID: returnedData.disconnectionStatus.winnerGoogleID,
                disqualified: true,
            });
    }
    // if pending, i.e. invitation/ countdown just send empty users back to client
    if (returnedData.disconnectionStatus && returnedData.disconnectionStatus.pending) {
        io.to(returnedData.disconnectionStatus.connection)
            .emit(OPPONENT_POOL, []);
    }
    io.emit(LOGGED_IN_USERS, returnedData.data.length);
    console.log('A User has disconnected', socket.id);
}

const handleGameCallBack = (err, returnedData, io, socket) => {
    if (err) throw err;
    if (!returnedData) return;
    if (returnedData.operation === 'generateOpponentPool') socket.emit(OPPONENT_POOL, returnedData.data);
    if (returnedData.operation === 'recieveInvite') {
        io.to(returnedData.data.reciever.socketIdReciever)
            .emit(INVITE_RECIEVED, returnedData.data.sender);
        socket.emit(INVITE_SENT, returnedData.data.reciever);
    }
    if (returnedData.operation === 'declinedInvite') {
        io.to(returnedData.data.sender)
            .emit(DECLINED_INVITATION, null);
    }
    if (returnedData.operation === 'acceptedInvite') {
        io.to(returnedData.data.reciever.opponentSID)
            .emit(ACCEPTED_INVITATION, returnedData.data.sender);
        socket.emit(ACCEPTED_INVITATION, returnedData.data.reciever);
    }
    if (returnedData.operation === 'gamestart') {
        socket.emit(GAME_STARTED,
            { info: returnedData.data.opponentInfo },
            (confirmation) => {
                console.log(confirmation);
                io.to(returnedData.data.opponentInfo.opponentSID)
                    .emit(OPPONENT_SCREEN, returnedData.data.clientScreen);
            });
    }
    if (returnedData.operation === 'gameinprogress') {
        if (!returnedData.data) return; // stop residual transmissions on gameover
        io.to(returnedData.data.opponentSID)
            .emit(OPPONENT_SCREEN, returnedData.data.clientScreen);
    }
    if (returnedData.operation === 'gameFinished') {
        io.to(returnedData.data.winnerSID)
            .emit(FINISH_GAME, returnedData.data);
        socket.emit(FINISH_GAME, returnedData.data);
    }
    if (returnedData.operation === 'revokeInvite') {
        io.to(returnedData.recieverId)
            .emit(UNMOUNT_OPPONENT, null);
        socket.emit(UNMOUNT_OPPONENT, null);
    }
}

module.exports = { handleConnectedUsersCallBack, handleDisconnectedUsersCallBack, handleGameCallBack }