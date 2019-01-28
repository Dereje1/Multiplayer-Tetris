import { socket as socketConstants } from '../../constants/index';

const {
  serverEmit: {
    LOGGED_IN_USERS, SOCKET_ID, OPPONENT_POOL,
    UNMOUNT_OPPONENT, INVITE_SENT, INVITE_RECIEVED,
    DECLINED_INVITATION, ACCEPTED_INVITATION,
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
export const sendInvite = reciever => (
  {
    type: INVITE_SENT,
    payload: reciever,
  }
);

export const receiveInvite = sender => (
  {
    type: INVITE_RECIEVED,
    payload: sender,
  }
);

export const declinedInvitation = () => (
  {
    type: DECLINED_INVITATION,
    payload: null,
  }
);

export const acceptedInvitation = data => (
  {
    type: ACCEPTED_INVITATION,
    payload: data,
  }
);
