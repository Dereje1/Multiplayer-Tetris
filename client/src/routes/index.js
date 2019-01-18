import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import App from '../App';
import routerTester from '../components/testRouter';

const Router = () => (
  <BrowserRouter>
    <Switch>
      <Route path="/" exact component={App} />
      <Route Path="/test" component={routerTester} />
    </Switch>
  </BrowserRouter>
);

export default Router;
