import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import getUser from '../../redux/actions/authentication';
import './styles/header.css';

const mapStateToProps = state => state;
const mapDispatchToProps = dispatch => bindActionCreators({ getUser }, dispatch);

class Header extends React.Component {

  constructor(props) {
    super(props);
    this.state = { };
  }

  componentDidMount() {
    const { getUser: getUserStatus } = this.props;
    getUserStatus();
  }

  render() {
    const { user } = this.props;
    if (user.profile) {
      const { user: { profile: { authenticated } } } = this.props;
      return (
        <div id="header">
          {
            authenticated
              ? <button id="logout" type="submit" onClick={() => window.location.assign('/auth/logout')}>Logout</button>
              : <button id="login" type="submit" onClick={() => window.location.assign('/auth/google')} />
          }
        </div>
      );
    }
    return null;
  }

}

export default connect(mapStateToProps, mapDispatchToProps)(Header);

Header.defaultProps = {
  user: null,
};

Header.propTypes = {
  getUser: PropTypes.func.isRequired,
  user: PropTypes.shape({
    profile: PropTypes.shape({
      authenticated: PropTypes.bool.isRequired,
    }),
  }),
};
