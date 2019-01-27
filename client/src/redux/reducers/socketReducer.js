import { socket as socketConstants } from '../../constants/index';

const { serverEmit: { LOGGED_IN_USERS, SOCKET_ID } } = socketConstants;

const socketReducer = (state = {}, action) => {
  switch (action.type) {
    case LOGGED_IN_USERS:
      return Object.assign({}, state, {
        usersLoggedIn: action.payload,
      });
    case SOCKET_ID:
      return Object.assign({}, state, {
        mySocketId: action.payload,
      });
    default:
      return state;
  }
};

export default socketReducer;
