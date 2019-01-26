import { socket as socketConstants } from '../../constants/index';

const socketReducer = (state = {}, action) => {
  switch (action.type) {
    case socketConstants.serverEmit.LOGGED_IN_USERS:
      return Object.assign({}, state, {
        usersLoggedIn: action.payload,
      });
    case socketConstants.serverEmit.ClIENT_SOCKET_ID:
      return Object.assign({}, state, {
        mySocketId: action.payload,
      });
    default:
      return state;
  }
};

export default socketReducer;
