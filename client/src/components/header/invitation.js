import React from 'react';
import PropTypes from 'prop-types';
import './styles/header.css';

const Invitation = ({
  invite, onDeclineInvite, onAcceptInvite,
}) => {
  if (!invite) return <div id="invitation" className="hide" />;
  return (
    <div id="invitation" className="show">
      <span className="desc">{`You have an invite from ${invite[0]}`}</span>
      <span>{`Difficulty Level = ${invite[1]}`}</span>
      <div id="invbuttons">
        <button className="inv accept" type="submit" onClick={() => onAcceptInvite()}>Accept</button>
        <button className="inv decline" type="submit" onClick={() => onDeclineInvite()}>Decline</button>
      </div>
    </div>
  );
};

export default Invitation;

Invitation.defaultProps = {
  invite: null,
};

Invitation.propTypes = {
  invite: PropTypes.arrayOf(PropTypes.any),
  onDeclineInvite: PropTypes.func.isRequired,
  onAcceptInvite: PropTypes.func.isRequired,
};
