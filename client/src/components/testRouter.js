import React from 'react';
import io from 'socket.io-client';

io('http://localhost:5000/');
const routerTester = () => (
  <h1>Multiplayer not setup yet!</h1>
);

export default routerTester;
