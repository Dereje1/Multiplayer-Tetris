import React from 'react';
import PropTypes from 'prop-types';
import './styles/header.css';

const Invitation = ({ name, onDeclineInvite, onAcceptInvite }) => (
  <div id="invitation">
    <span>{`Invitation from ${name}`}</span>
    <div id="invbuttons">
      <button className="inv accept" type="submit" onClick={() => onAcceptInvite()}>Accept</button>
      <button className="inv decline" type="submit" onClick={() => onDeclineInvite()}>Decline</button>
    </div>
  </div>
);

export default Invitation;

Invitation.propTypes = {
  name: PropTypes.string.isRequired,
  onDeclineInvite: PropTypes.func.isRequired,
  onAcceptInvite: PropTypes.func.isRequired,
};
