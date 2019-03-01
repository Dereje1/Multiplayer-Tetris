import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
/* font awesome */
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBars,
} from '@fortawesome/free-solid-svg-icons';
import './styles/profile.css';

const mapStateToProps = state => state;

class Profile extends React.Component {

  constructor(props) {
    super(props);
    this.state = { };
  }

  componentDidMount() {

  }

  render() {
    const { user } = this.props;
    if (!Object.keys(user)) return null;
    return (
      <div id="profile">
        <div id="card">
          <span id="name">{user.profile ? user.profile.displayname : null}</span>
        </div>
      </div>
    );
  }

}

export default connect(mapStateToProps)(Profile);

Profile.defaultProps = {
  user: null,
};

Profile.propTypes = {
  user: PropTypes.shape({
    profile: PropTypes.shape({
      displayname: PropTypes.string,
    }),
  }),
};
