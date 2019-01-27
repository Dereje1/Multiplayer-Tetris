import io from 'socket.io-client';
import store from './redux/store';
import { socket as socketConstants } from './constants/index';
import { getLoggedInUsers, getClientSocketId } from './redux/actions/socket';

const socketConnection = io(socketConstants.connection);
const { serverEmit: { LOGGED_IN_USERS, SOCKET_ID } } = socketConstants;

const clientEmitter = (event, dataToEmit) => {
  socketConnection.emit(event, dataToEmit);
};

socketConnection.on(
  LOGGED_IN_USERS,
  data => store.dispatch(getLoggedInUsers(data)),
);

socketConnection.on(
  SOCKET_ID,
  data => store.dispatch(getClientSocketId(data)),
);

export default clientEmitter;
