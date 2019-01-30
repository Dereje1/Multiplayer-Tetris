import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import getUser from '../../redux/actions/authentication';
import { clientEmitter } from '../../sockethandler';
import { socket as socketConstants } from '../../constants/index';

import './styles/header.css';

const mapStateToProps = state => state;
const mapDispatchToProps = dispatch => bindActionCreators({ getUser }, dispatch);
const { clientEmit: { SEND_LOGGED_IN_USER, USER_LOGGED_OUT } } = socketConstants;

class Header extends React.Component {

  constructor(props) {
    super(props);
    this.state = { };
  }

  componentDidMount() {
    this.loadUser();
  }

  loadUser = async () => {
    const { getUser: getUserStatus } = this.props;
    await getUserStatus();
    const { user } = this.props;
    const payloadToSend = user.profile.authenticated ? user.profile : null;
    clientEmitter(
      SEND_LOGGED_IN_USER,
      payloadToSend,
    );
  }

  logOutUser = async () => {
    const { getUser: getUserStatus } = this.props;
    await getUserStatus();
    const { user } = this.props;
    user.profile.remove = true;
    clientEmitter(USER_LOGGED_OUT, user.profile);
    window.location.assign('/auth/logout');
  }

  render() {
    const { user, socket } = this.props;
    const usersMessage = socket.usersLoggedIn
      ? `${socket.usersLoggedIn}  logged in user${socket.usersLoggedIn < 2 ? '' : 's'}`
      : null;
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
          <div
            id="users"
            role="button"
            tabIndex={-1}
            onKeyDown={() => {}}
            onClick={() => clientEmitter('pool', null)}
          >
            <span>{usersMessage}</span>
          </div>
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
  socket: PropTypes.shape({
    usersLoggedIn: PropTypes.number,
  }),
  user: PropTypes.shape({
    profile: PropTypes.shape({
      authenticated: PropTypes.bool.isRequired,
    }),
  }),
};
