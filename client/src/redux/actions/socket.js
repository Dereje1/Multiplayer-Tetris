import { socket as socketConstants } from '../../constants/index';

const { serverEmit: { LOGGED_IN_USERS, SOCKET_ID } } = socketConstants;

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
