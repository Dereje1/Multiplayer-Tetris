import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Header from '../components/header/header';
import App from '../App';
import routerTester from '../components/testRouter';

const Router = () => (
  <BrowserRouter>
    <React.Fragment>
      <Header />
      <Switch>
        <Route path="/" exact component={App} />
        <Route Path="/test" component={routerTester} />
      </Switch>
    </React.Fragment>
  </BrowserRouter>
);

export default Router;
