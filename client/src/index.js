/* default CRA imports */
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
/* custom imports */
import { Provider } from 'react-redux';
import {store} from './store';
import Router from './routes/index';


ReactDOM.render(
  <Provider store={store}>
    <Router />
  </Provider>,
  document.getElementById('root'),
);
