import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from './reducers/index';

// don't use logger for production
const reduxLogger = process.env.NODE_ENV === 'development' ? require('redux-logger') : null;

const middleware = reduxLogger ? [thunk, reduxLogger.createLogger({
  predicate: (getState, action) => action.type !== 'SCREEN_UPDATE',
})] : [thunk];

const store = createStore(
  rootReducer,
  applyMiddleware(...middleware),
);

export default store;
