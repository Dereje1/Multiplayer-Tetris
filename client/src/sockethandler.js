import io from 'socket.io-client';
import store from './redux/store';
import { socket as socketConstants } from './constants/index';
import { getLoggedInUsers, getClientSocketId } from './redux/actions/socket';

const socketConnection = io(socketConstants.connection);

const clientEmitter = (event, dataToEmit) => {
  socketConnection.emit(event, dataToEmit);
};

socketConnection.on(
  socketConstants.serverEmit.LOGGED_IN_USERS,
  data => store.dispatch(getLoggedInUsers(data)),
);

socketConnection.on(
  socketConstants.serverEmit.ClIENT_SOCKET_ID,
  data => store.dispatch(getClientSocketId(data)),
);

export default clientEmitter;
