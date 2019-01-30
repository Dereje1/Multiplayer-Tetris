import { socket as socketConstants } from '../../constants/index';

const {
  serverEmit: {
    LOGGED_IN_USERS, SOCKET_ID, OPPONENT_POOL,
    UNMOUNT_OPPONENT, INVITE_SENT, INVITE_RECIEVED,
    DECLINED_INVITATION, ACCEPTED_INVITATION, GAME_STARTED,
  },
  GAME_COUNTDOWN,
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

export const startCountDown = counter => (dispatch) => {
  let secondsOfTimer = counter; // linter complaing on param reassignment
  const intervalId = setInterval(() => {
    secondsOfTimer -= 1;
    if (secondsOfTimer <= 0) clearInterval(intervalId);
    dispatch({
      type: GAME_COUNTDOWN,
      payload: secondsOfTimer,
    });
  }, 1000);
};

export const startGame = data => (
  {
    type: GAME_STARTED,
    payload: data,
  }
);
