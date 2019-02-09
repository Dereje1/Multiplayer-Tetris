import React from 'react';
import io from 'socket.io-client';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getLoggedInUsers } from '../redux/actions/socket';

const mapStateToProps = state => state;
const mapDispatchToProps = dispatch => bindActionCreators({ getLoggedInUsers }, dispatch);


class socketTester extends React.Component {

  constructor(props) {
    super(props);
    this.state = { };

    // socket.on('LOGGED_IN_USERS', data => this.props.getLoggedInUsers(data));
  }

  socketTest = () => {
    const socket = io('http://localhost:5000/');
    const { user } = this.props;
    const addUserToSocket = user.profile.authenticated ? user.profile : null;
    socket.emit('SEND_LOGGED_IN_USER', addUserToSocket);
  }

  render() {
    return (
      <button type="submit" onClick={this.socketTest}><h1>Click Me!</h1></button>
    );
  }

}

export default connect(mapStateToProps, mapDispatchToProps)(socketTester);
