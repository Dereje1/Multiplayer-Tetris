import { socket as socketConstants } from '../../constants/index';

const {
  serverEmit: {
    LOGGED_IN_USERS, SOCKET_ID, OPPONENT_POOL, UNMOUNT_OPPONENT,
  },
} = socketConstants;

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
    case OPPONENT_POOL:
      return Object.assign({}, state, {
        opponents: action.payload,
      });
    case UNMOUNT_OPPONENT: {
      const currentState = Object.assign({}, state);
      delete currentState.opponents;
      return currentState;
    }
    default:
      return state;
  }
};

export default socketReducer;
