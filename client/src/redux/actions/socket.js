import { socket as socketConstants } from '../../constants/index';

const {
  serverEmit: {
    LOGGED_IN_USERS, SOCKET_ID, OPPONENT_POOL, UNMOUNT_OPPONENT,
  },
} = socketConstants;

export const getLoggedInUsers = data => (
  {
    type: LOGGED_IN_USERS,
    payload: data,
  }
);

export const getClientSocketId = data => (
  {
    type: SOCKET_ID,
    payload: data,
  }
);

export const getOpponents = data => (
  {
    type: OPPONENT_POOL,
    payload: data,
  }
);

export const removeOpponents = () => (
  {
    type: UNMOUNT_OPPONENT,
    payload: null,
  }
);
