import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import logger from 'redux-logger';
import rootReducer from './reducers/index';
import testAction from './actions/test';

const store = createStore(
    rootReducer,
    applyMiddleware(thunk, logger)
);

store.dispatch(testAction())
export default store;
