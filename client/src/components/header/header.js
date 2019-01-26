import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import io from 'socket.io-client';
import getUser from '../../redux/actions/authentication';
import { getLoggedInUsers } from '../../redux/actions/socket';
import { socket } from '../../constants/index';
import './styles/header.css';

const mapStateToProps = state => state;
const mapDispatchToProps = dispatch => bindActionCreators({ getUser, getLoggedInUsers }, dispatch);
const socketConnection = io(socket.connection);

class Header extends React.Component {

  constructor(props) {
    super(props);
    this.state = { };
    const { getLoggedInUsers: loggedInUsers } = this.props;
    socketConnection.on(socket.serverEmit.LOGGED_IN_USERS, data => loggedInUsers(data));
  }

  componentDidMount() {
    this.loadUser();
  }

  loadUser = async () => {
    const { getUser: getUserStatus } = this.props;
    await getUserStatus();
    const { user } = this.props;
    const addUserToSocket = user.profile.authenticated ? user.profile : null;
    socketConnection.emit(socket.clientEmit.SEND_LOGGED_IN_USER, addUserToSocket);
  }

  logOutUser = async () => {
    const { getUser: getUserStatus } = this.props;
    await getUserStatus();
    const { user } = this.props;
    user.profile.remove = true;
    socketConnection.emit(socket.clientEmit.USER_LOGGED_OUT, user.profile);
    window.location.assign('/auth/logout');
  }

  render() {
    const { user, socket } = this.props;
    const usersMessage = socket.usersLoggedIn ? `${socket.usersLoggedIn} users logged in` : null
    if (user.profile) {
      const { user: { profile: { authenticated } } } = this.props;
      return (
        <div id="header">
          <div id="profile" />
          {
            authenticated
              ? <div id="authbutton"><button id="logout" type="submit" onClick={this.logOutUser}>Logout</button></div>
              : <div id="authbutton"><button id="login" type="submit" onClick={() => window.location.assign('/auth/google')} /></div>
          }
          <div id="users"><span>{usersMessage}</span></div>
        </div>
      );
    }
    return null;
  }

}

export default connect(mapStateToProps, mapDispatchToProps)(Header);

Header.defaultProps = {
  user: null,
  socket: null,
};

Header.propTypes = {
  getUser: PropTypes.func.isRequired,
  getLoggedInUsers: PropTypes.func.isRequired,
  socket: PropTypes.shape({
    usersLoggedIn: PropTypes.number,
  }),
  user: PropTypes.shape({
    profile: PropTypes.shape({
      authenticated: PropTypes.bool.isRequired,
    }),
  }),
};
