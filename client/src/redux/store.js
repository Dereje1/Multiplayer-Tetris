import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from './reducers/index';
import testAction from './actions/test';

// don't use logger for production
const reduxLogger = process.env.NODE_ENV === 'development' ? require('redux-logger') : null;

const middleware = reduxLogger ? [thunk, reduxLogger.logger] : [thunk];

const store = createStore(
  rootReducer,
  applyMiddleware(...middleware),
);

store.dispatch(testAction());
export default store;
