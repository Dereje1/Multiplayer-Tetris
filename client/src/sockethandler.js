import io from 'socket.io-client';
import store from './redux/store';
import { socket as socketConstants } from './constants/index';

const {
  serverEmit: {
    LOGGED_IN_USERS, SOCKET_ID, OPPONENT_POOL,
    UNMOUNT_OPPONENT, INVITE_SENT, INVITE_RECIEVED, DECLINED_INVITATION,
    ACCEPTED_INVITATION, GAME_STARTED, OPPONENT_SCREEN, FINISH_GAME,
  },
  GAME_COUNTDOWN,
} = socketConstants;

const { clientEmit: { SEND_LOGGED_IN_USER } } = socketConstants;

const { dispatch } = store;

export const socketConnection = io(socketConstants.connection);

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

const startCountDown = counter => (dispatchTimeLeft) => {
  let secondsOfTimer = counter; // linter complaing on param reassignment
  const intervalId = setInterval(() => {
    secondsOfTimer -= 1;
    if (secondsOfTimer <= 0) clearInterval(intervalId);
    dispatchTimeLeft({
      type: GAME_COUNTDOWN,
      payload: secondsOfTimer,
    });
  }, 1000);
};

// Must only emit opponent screen if redux store is in
// 'gameInProgress' phase, otherwise critical bug when game start is not synchronized
// for example with background timer throttling of the countdown if page is on
// a different tab and redux store temp state recieves multiple phases
const isGameInProgress = () => Object.keys(store.getState().socket.temp)[0] === 'gameInProgress';

/*
SERVER_RESET: triggered by: a new connection
LOGGED_IN_USERS: triggered by: SEND_LOGGED_IN_USER
SOCKET_ID: triggered by: SEND_LOGGED_IN_USER,
OPPONENT_POOL: LOOK_FOR_OPPONENTS, disconnetions
UNMOUNT_OPPONENT: triggered by: OPPONENT_UNMOUNTED
INVITE_SENT: triggered by: INVITATION_SENT
INVITE_RECIEVED: triggered by: INVITATION_SENT
DECLINED_INVITATION: triggered by: INVITATION_DECLINED
ACCEPTED_INVITATION: triggered by: INVITATION_ACCEPTED
GAME_STARTED: triggered by: START_GAME
OPPONENT_SCREEN: triggered by: UPDATED_CLIENT_SCREEN
FINISH_GAME: triggered by: GAME_OVER
*/

const socketActionMap = {
  SERVER_RESET: () => serverReset(),
  LOGGED_IN_USERS: data => dispatch({ type: LOGGED_IN_USERS, payload: data }),
  SOCKET_ID: data => dispatch({ type: SOCKET_ID, payload: data }),
  OPPONENT_POOL: data => dispatch({ type: OPPONENT_POOL, payload: data }),
  UNMOUNT_OPPONENT: () => dispatch({ type: UNMOUNT_OPPONENT, payload: null }),
  INVITE_SENT: reciever => dispatch({ type: INVITE_SENT, payload: reciever }),
  INVITE_RECIEVED: sender => dispatch({ type: INVITE_RECIEVED, payload: sender }),
  DECLINED_INVITATION: () => dispatch({ type: DECLINED_INVITATION, payload: null }),
  ACCEPTED_INVITATION: (data) => {
    const acceptDispatch = dispatch({ type: ACCEPTED_INVITATION, payload: data });
    const timeToCountDown = acceptDispatch.payload.countdown;
    dispatch(startCountDown(timeToCountDown));
  },
  GAME_STARTED: (opponentData, callback) => {
    dispatch({ type: GAME_STARTED, payload: opponentData });
    callback('Game Start Recieved and dispacthed by Client!!');
  },
  OPPONENT_SCREEN: screen => (isGameInProgress()
    ? dispatch({ type: OPPONENT_SCREEN, payload: screen })
    : null),
  FINISH_GAME: data => dispatch({ type: FINISH_GAME, payload: data }),
};

socketConnection.onAny((event, ...args) => {
  const [data, callback] = args;
  if (socketActionMap[event]) socketActionMap[event](data, callback);
  else console.log(`No action map found for event = ${event}`);
});
