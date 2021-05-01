import io from 'socket.io-client';
import store from './redux/store';
import { socket as socketConstants } from './constants/index';
import {
  startCountDown, socketDataAction,
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
  data => store.dispatch(socketDataAction({ type: LOGGED_IN_USERS, payload: data })),
);
// triggered by: SEND_LOGGED_IN_USER
socketConnection.on(
  SOCKET_ID,
  data => store.dispatch(socketDataAction({ type: SOCKET_ID, payload: data })),
);
// triggered by: LOOK_FOR_OPPONENTS, disconnetions
socketConnection.on(
  OPPONENT_POOL,
  data => store.dispatch(socketDataAction({ type: OPPONENT_POOL, payload: data })),
);
// triggered by: OPPONENT_UNMOUNTED
socketConnection.on(
  UNMOUNT_OPPONENT,
  () => store.dispatch(socketDataAction({ type: UNMOUNT_OPPONENT, payload: null })),
);
// triggered by: INVITATION_SENT
socketConnection.on(
  INVITE_SENT,
  reciever => store.dispatch((socketDataAction({ type: INVITE_SENT, payload: reciever }))),
);
// triggered by: INVITATION_SENT
socketConnection.on(
  INVITE_RECIEVED,
  sender => store.dispatch(socketDataAction({ type: INVITE_RECIEVED, payload: sender })),
);
// triggered by: INVITATION_DECLINED
socketConnection.on(
  DECLINED_INVITATION,
  () => store.dispatch(socketDataAction({ type: DECLINED_INVITATION, payload: null })),
);
// triggered by: INVITATION_ACCEPTED
socketConnection.on(
  ACCEPTED_INVITATION,
  async (opponentData) => {
    const acceptDispatch = await store.dispatch(socketDataAction({ type: ACCEPTED_INVITATION, payload: opponentData }));
    const timeToCountDown = acceptDispatch.payload.countdown;
    store.dispatch(startCountDown(timeToCountDown));
  },
);
// triggered by: START_GAME
socketConnection.on(
  GAME_STARTED,
  (opponentData, confirmation) => {
    store.dispatch(socketDataAction({ type: GAME_STARTED, payload: opponentData }));
    confirmation('Game Start Recieved and dispacthed by Client!!');
  },
);
// triggered by: UPDATED_CLIENT_SCREEN
socketConnection.on(
  OPPONENT_SCREEN,
  (screen) => {
    // Must only emit opponent screen if redux store is in
    // 'gameInProgress' phase, otherwise critical bug when game start is not synchronized
    // for example with background timer throttling of the countdown if page is on
    // a different tab and redux store temp state recieves multiple phases
    if (Object.keys(store.getState().socket.temp)[0] === 'gameInProgress') {
      store.dispatch(socketDataAction({ type: OPPONENT_SCREEN, payload: screen }));
    }
  },
);
// triggered by: GAME_OVER
socketConnection.on(
  FINISH_GAME,
  data => store.dispatch(socketDataAction({ type: FINISH_GAME, payload: data })),
);
