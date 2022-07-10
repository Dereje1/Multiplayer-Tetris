import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Header from '../components/header/header';
import Profile from '../components/profile/profile';
import Footer from '../components/footer/footer';
import Game from '../components/game/game'
// import routerTester from '../components/testRouter';

const Router = () => (
  <BrowserRouter>
    <React.Fragment>
      <Header />
      <Switch>
        <Route path="/" exact component={Game} />
        <Route Path="/profile" component={Profile} />
      </Switch>
      <Footer />
    </React.Fragment>
  </BrowserRouter>
);

export default Router;
