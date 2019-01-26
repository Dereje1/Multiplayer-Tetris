import { socket as socketConstants } from '../../constants/index';

export const getLoggedInUsers = data => dispatch => (
  dispatch({
    type: socketConstants.serverEmit.LOGGED_IN_USERS,
    payload: data,
  })
);

export const getClientSocketId = data => dispatch => (
  dispatch({
    type: socketConstants.serverEmit.ClIENT_SOCKET_ID,
    payload: data,
  })
);
