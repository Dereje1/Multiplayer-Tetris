import { socket as socketConstants } from '../../constants/index';

const {
  serverEmit: {
    LOGGED_IN_USERS, SOCKET_ID, OPPONENT_POOL,
    UNMOUNT_OPPONENT, INVITE_SENT, INVITE_RECIEVED,
    DECLINED_INVITATION, ACCEPTED_INVITATION,
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
        temp: {
          opponents: action.payload,
        },
      });
    case UNMOUNT_OPPONENT: {
      const currentState = Object.assign({}, state);
      delete currentState.temp;
      return currentState;
    }
    case INVITE_SENT: {
      const currentState = Object.assign({}, state);
      delete currentState.temp;
      return Object.assign({}, currentState, {
        temp: {
          invitationTo: action.payload,
        },
      });
    }
    case INVITE_RECIEVED: {
      const currentState = Object.assign({}, state);
      delete currentState.temp;
      return Object.assign({}, currentState, {
        temp: {
          invitationFrom: action.payload,
        },
      });
    }
    case DECLINED_INVITATION: {
      const currentState = Object.assign({}, state);
      delete currentState.temp;
      return Object.assign({}, currentState, {
        temp: {
          declinedInvitation: true,
        },
      });
    }
    case ACCEPTED_INVITATION: {
      const currentState = Object.assign({}, state);
      delete currentState.temp;
      return Object.assign({}, currentState, {
        temp: {
          acceptedInvitation: action.payload,
        },
      });
    }
    default:
      return state;
  }
};

export default socketReducer;
