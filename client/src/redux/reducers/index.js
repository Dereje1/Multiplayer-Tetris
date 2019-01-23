import { combineReducers } from 'redux';
import authReducer from './authentication';
import gameReducer from './gameReducer';

export default combineReducers({
  game: gameReducer,
  user: authReducer,
});
