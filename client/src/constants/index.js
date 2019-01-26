module.exports = {
  auth:{
    GET_LOGIN_STATUS: 'GET_LOGIN_STATUS',
  },
  game:{
    INITIALIZE_GAME: 'INITIALIZE_GAME',
    LEVEL_UP: 'LEVEL_UP',
    PAUSE: 'PAUSE',
    SET_NEXT_SHAPE: 'SET_NEXT_SHAPE',
    SCREEN_UPDATE: 'SCREEN_UPDATE',
    RAISE_FLOOR: 'RAISE_FLOOR',
    COLLISION: 'COLLISION',
  },
  socket:{
    clientEmit:{
      SEND_LOGGED_IN_USER: 'SEND_LOGGED_IN_USER',
      USER_LOGGED_OUT: 'USER_LOGGED_OUT',
    },
    serverEmit:{
      LOGGED_IN_USERS: 'LOGGED_IN_USERS',
    },
    connection:'http://localhost:5000/',
  }
};
