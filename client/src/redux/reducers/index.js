import { combineReducers } from 'redux';
import authReducer from './authentication';
import testReducer from './test';

export default combineReducers({
  tester: testReducer,
  user: authReducer,
});
