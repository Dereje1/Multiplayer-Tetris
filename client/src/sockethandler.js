import io from 'socket.io-client';
import store from './redux/store';
import { socket as socketConstants } from './constants/index';

const {
  serverEmit: {
    SERVER_RESET, ACCEPTED_INVITATION, GAME_STARTED, OPPONENT_SCREEN,
  },
  clientEmit: { SEND_LOGGED_IN_USER },
  GAME_COUNTDOWN,
  CONNECTION,
} = socketConstants;

const { dispatch } = store;

export const socketConnection = io(CONNECTION);

export const clientEmitter = (event, dataToEmit) => {
  socketConnection.emit(event, dataToEmit);
};

const serverReset = () => {
  // runs whenever there is a new connection.
  // If client has not refreshed then use existing user profile to update server
  const { socket: socketObject, user } = store.getState();
  if (!Object.keys(socketObject).length) return null;
  const payloadToSend = user.profile.authenticated ? user.profile : null;
  clientEmitter(
    SEND_LOGGED_IN_USER,
    payloadToSend,
  );
  return true;
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
};

export const handleServerSocketResponses = (event, ...args) => {
  if (!Object.keys(socketConstants.serverEmit).includes(event)) {
    console.log(`No action map found for event = ${event}`);
    return;
  }
  const [data, callback] = args;
  const specialEvents = [SERVER_RESET, ACCEPTED_INVITATION, GAME_STARTED, OPPONENT_SCREEN]

  if (specialEvents.includes(event)) {
    return socketActionMap[event](data, callback);
  } else {
    dispatch({ type: event, payload: data });
  }
}

socketConnection.onAny((event, ...args) => handleServerSocketResponses(event, ...args));
