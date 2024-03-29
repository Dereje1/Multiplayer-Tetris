module.exports = {
  auth: {
    GET_LOGIN_STATUS: 'GET_LOGIN_STATUS',
  },
  game: {
    INITIALIZE_GAME: 'INITIALIZE_GAME',
    LEVEL_UP: 'LEVEL_UP',
    PAUSE: 'PAUSE',
    SET_NEXT_SHAPE: 'SET_NEXT_SHAPE',
    SCREEN_UPDATE: 'SCREEN_UPDATE',
    RAISE_FLOOR: 'RAISE_FLOOR',
    COLLISION: 'COLLISION',
  },
  socket: {
    clientEmit: {
      SEND_LOGGED_IN_USER: 'SEND_LOGGED_IN_USER',
      USER_LOGGED_OUT: 'USER_LOGGED_OUT',
      LOOK_FOR_OPPONENTS: 'LOOK_FOR_OPPONENTS',
      OPPONENT_UNMOUNTED: 'OPPONENT_UNMOUNTED',
      INVITATION_SENT: 'INVITATION_SENT',
      INVITATION_DECLINED: 'INVITATION_DECLINED',
      INVITATION_ACCEPTED: 'INVITATION_ACCEPTED',
      START_GAME: 'START_GAME',
      UPDATED_CLIENT_SCREEN: 'UPDATED_CLIENT_SCREEN',
      GAME_OVER: 'GAME_OVER',
    },
    serverEmit: {
      SERVER_RESET: 'SERVER_RESET',
      LOGGED_IN_USERS: 'LOGGED_IN_USERS',
      SOCKET_ID: 'SOCKET_ID',
      OPPONENT_POOL: 'OPPONENT_POOL',
      UNMOUNT_OPPONENT: 'UNMOUNT_OPPONENT',
      INVITE_SENT: 'INVITE_SENT',
      INVITE_RECIEVED: 'INVITE_RECIEVED',
      DECLINED_INVITATION: 'DECLINED_INVITATION',
      ACCEPTED_INVITATION: 'ACCEPTED_INVITATION',
      GAME_STARTED: 'GAME_STARTED',
      OPPONENT_SCREEN: 'OPPONENT_SCREEN',
      FINISH_GAME: 'FINISH_GAME',
    },
    GAME_COUNTDOWN: 'GAME_COUNTDOWN',
    CONNECTION: process.env.NODE_ENV === 'development' ? 'http://localhost:5001/' : process.env.PORT,
  },
  gameConstants: {
    CELLS_PER_ROW: 10,
  }
};
