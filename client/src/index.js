/* default CRA imports */
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import './index.css';
import { Provider } from 'react-redux';
import { store } from './store';
import Header from './components/header/header';
import Profile from './components/profile/profile';
import Footer from './components/footer/footer';
import Game from './components/game/game'


ReactDOM.render(
  <Provider store={store}>
    <BrowserRouter>
      <React.Fragment>
        <Header />
        <Switch>
          <Route path="/" exact component={Game} />
          <Route path="/profile" component={Profile} />
        </Switch>
        <Footer />
      </React.Fragment>
    </BrowserRouter>
  </Provider>,
  document.getElementById('root'),
);
