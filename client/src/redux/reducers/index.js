import { combineReducers } from 'redux';
import authReducer from './authentication';
import gameReducer from './gameReducer';
import socketReducer from './socketReducer';

export default combineReducers({
  game: gameReducer,
  user: authReducer,
  socket: socketReducer,
});
