import io from 'socket.io-client';
import store from './redux/store';
import { socket as socketConstants } from './constants/index';
import {
  getLoggedInUsers, getClientSocketId, getOpponents, removeOpponents,
  sendInvite, receiveInvite, declinedInvitation, acceptedInvitation,
  startCountDown, startGame, getOpponentScreen, gameOver,
} from './redux/actions/socket';

export const socketConnection = io(socketConstants.connection);

const {
  serverEmit: {
    LOGGED_IN_USERS, SOCKET_ID, SERVER_RESET, OPPONENT_POOL,
    UNMOUNT_OPPONENT, INVITE_SENT, INVITE_RECIEVED, DECLINED_INVITATION,
    ACCEPTED_INVITATION, GAME_STARTED, OPPONENT_SCREEN, FINISH_GAME,
  },
} = socketConstants;

const { clientEmit: { SEND_LOGGED_IN_USER } } = socketConstants;

export const clientEmitter = (event, dataToEmit) => {
  socketConnection.emit(event, dataToEmit);
};

const serverReset = () => {
  // runs whenever there is a new connection.
  // If client has not refreshed then use existing user profile to update server
  const { socket: socketObject, user } = store.getState();
  if (!Object.keys(socketObject).length) return;
  const payloadToSend = user.profile.authenticated ? user.profile : null;
  clientEmitter(
    SEND_LOGGED_IN_USER,
    payloadToSend,
  );
};

// triggered by: a new connection
socketConnection.on(
  SERVER_RESET,
  () => serverReset(),
);
// triggered by: SEND_LOGGED_IN_USER
socketConnection.on(
  LOGGED_IN_USERS,
  data => store.dispatch(getLoggedInUsers(data)),
);
// triggered by: SEND_LOGGED_IN_USER
socketConnection.on(
  SOCKET_ID,
  data => store.dispatch(getClientSocketId(data)),
);
// triggered by: LOOK_FOR_OPPONENTS, disconnetions
socketConnection.on(
  OPPONENT_POOL,
  data => store.dispatch(getOpponents(data)),
);
// triggered by: OPPONENT_UNMOUNTED
socketConnection.on(
  UNMOUNT_OPPONENT,
  () => store.dispatch(removeOpponents()),
);
// triggered by: INVITATION_SENT
socketConnection.on(
  INVITE_SENT,
  reciever => store.dispatch(sendInvite(reciever)),
);
// triggered by: INVITATION_SENT
socketConnection.on(
  INVITE_RECIEVED,
  sender => store.dispatch(receiveInvite(sender)),
);
// triggered by: INVITATION_DECLINED
socketConnection.on(
  DECLINED_INVITATION,
  () => store.dispatch(declinedInvitation()),
);
// triggered by: INVITATION_ACCEPTED
socketConnection.on(
  ACCEPTED_INVITATION,
  async (opponentData) => {
    const acceptDispatch = await store.dispatch(acceptedInvitation(opponentData));
    const timeToCountDown = acceptDispatch.payload.countdown;
    store.dispatch(startCountDown(timeToCountDown));
  },
);
// triggered by: START_GAME
socketConnection.on(
  GAME_STARTED,
  async (opponentData, confirmation) => {
    await store.dispatch(startGame(opponentData));
    confirmation('Game Start Recieved and dispacthed by Client!!');
  },
);
// triggered by: UPDATED_CLIENT_SCREEN
socketConnection.on(
  OPPONENT_SCREEN,
  screen => store.dispatch(getOpponentScreen(screen)),
);
// triggered by: GAME_OVER
socketConnection.on(
  FINISH_GAME,
  data => store.dispatch(gameOver(data)),
);
