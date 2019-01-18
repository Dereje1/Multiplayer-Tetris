import { combineReducers } from 'redux';
import testReducer from './test';

export default combineReducers({
  tester: testReducer,
});
