import io from 'socket.io-client';
import store from './redux/store';
import { socket as socketConstants } from './constants/index';
import {
  getLoggedInUsers, getClientSocketId, getOpponents, removeOpponents,
  sendInvite, receiveInvite, declinedInvitation, acceptedInvitation,
} from './redux/actions/socket';

const socketConnection = io(socketConstants.connection);
const {
  serverEmit: {
    LOGGED_IN_USERS, SOCKET_ID, SERVER_RESET, OPPONENT_POOL,
    UNMOUNT_OPPONENT, INVITE_SENT, INVITE_RECIEVED, DECLINED_INVITATION,
    ACCEPTED_INVITATION,
  },
} = socketConstants;
const { clientEmit: { SEND_LOGGED_IN_USER } } = socketConstants;

const clientEmitter = (event, dataToEmit) => {
  socketConnection.emit(event, dataToEmit);
};

const serverReset = () => {
  // runs whenever there is a new connection.
  // If client has not refreshed then use existing user profile to update server
  const { socket: socketObject, user } = store.getState();
  if (!Object.keys(socketObject).length) return;
  const payloadToSend = user.profile.authenticated ? user.profile : null;
  clientEmitter(
    SEND_LOGGED_IN_USER,
    payloadToSend,
  );
};

socketConnection.on(
  SERVER_RESET,
  () => serverReset(),
);

socketConnection.on(
  LOGGED_IN_USERS,
  data => store.dispatch(getLoggedInUsers(data)),
);

socketConnection.on(
  SOCKET_ID,
  data => store.dispatch(getClientSocketId(data)),
);

socketConnection.on(
  OPPONENT_POOL,
  data => store.dispatch(getOpponents(data)),
);

socketConnection.on(
  UNMOUNT_OPPONENT,
  () => store.dispatch(removeOpponents()),
);

socketConnection.on(
  INVITE_SENT,
  reciever => store.dispatch(sendInvite(reciever)),
);

socketConnection.on(
  INVITE_RECIEVED,
  sender => store.dispatch(receiveInvite(sender)),
);

socketConnection.on(
  DECLINED_INVITATION,
  () => store.dispatch(declinedInvitation()),
);

socketConnection.on(
  ACCEPTED_INVITATION,
  opponentData => store.dispatch(acceptedInvitation(opponentData)),
);

export default clientEmitter;
