import React from 'react';
import PropTypes from 'prop-types';
import './styles/opponentdescription.css';
/* opponent top part of component */
const OpponentDescription = ({
  socketState,
  difficulty,
  setDifficulty,
  requestInvite,
  acceptInvite,
  declineInvite,
  getPool,
}) => {
  const { temp } = socketState;
  const {
    opponents, invitationFrom, invitationTo, declinedInvitation,
    acceptedInvitation, gameStart,
  } = temp;
  // stage 1 - no logged in opponents in multiplayer mode found
  if (opponents && !opponents.length) {
    return (
      <div className="opponentContainer__opponentDescription">
        <div className="opponentContainer__opponentDescription">
          <p className="writing">No opponents  </p>
          <p className="writing">avalilable at</p>
          <p className="writing">the moment,</p>
          <p className="writing">check back</p>
          <p className="writing">later !!</p>
        </div>
      </div>
    );
  }
  // stage 2 - logged in opponents in multiplayer mode found, display invitation buttons
  if (opponents && opponents.length) {
    const players = socketState.temp.opponents.map(p => (
      <button
        type="submit"
        className="opponentContainer__opponentDescription__playersbutton"
        key={p.socketId}
        onClick={() => requestInvite(p.socketId)}
      >
        {p.displayname.split(' ')[0]}
      </button>));
    return (
      <div className="opponentContainer__opponentDescription">
        <p className="writing">Difficulty</p>
        <div className="opponentContainer__opponentDescription_diffButtons">
          {
            [1, 2, 3, 4].map(d => (
              d === difficulty
                ? <span key={d} className="opponentContainer__opponentDescription_diffButtons_dot_highlight" role="button" onClick={() => setDifficulty(d)} onKeyDown={() => {}} tabIndex={0}>{d}</span>
                : <span key={d} className="opponentContainer__opponentDescription_diffButtons_dot" role="button" onClick={() => setDifficulty(d)} onKeyDown={() => {}} tabIndex={0}>{d}</span>
            ))
          }
        </div>
        <p className="writing">Invite</p>
        {players}
      </div>
    );
  }
  // stage 3 - an invitation has been requested, display invitation for the invited
  if (invitationFrom) {
    return (
      <div className="opponentContainer__opponentDescription">
        <div className="opponentContainer__opponentDescription__invitation">
          <p className="writing">Invite from</p>
          <p className="writing">{socketState.temp.invitationFrom.displayname.split(' ')[0]}</p>
          <p className="writing">{`Difficulty = ${socketState.temp.invitationFrom.difficulty}`}</p>
          <button type="submit" className="opponentContainer__opponentDescription__invitation__button-accept-invitation" onClick={() => acceptInvite()}>Accept</button>
          <button type="submit" className="opponentContainer__opponentDescription__invitation__button-decline-invitation" onClick={() => declineInvite()}>Decline</button>
        </div>
      </div>
    );
  }
  // display pending invitation for the requester
  if (invitationTo) {
    return (
      <div className="opponentContainer__opponentDescription">
        <div className="opponentContainer__opponentDescription__invitation">
          <p className="writing">Pending</p>
          <p className="writing">Invitation to</p>
          <p className="writing">{socketState.temp.invitationTo.displaynameReciever.split(' ')[0]}</p>
          <div className="loading" />
        </div>
      </div>
    );
  }
  // Invitation has been declined Inform the sender.
  if (declinedInvitation) {
    return (
      <div className="opponentContainer__opponentDescription">
        <div className="opponentContainer__opponentDescription__invitation">
          <p className="writing">Invitation</p>
          <p className="writing">Declined</p>
          <button type="submit" className="opponentContainer__opponentDescription__invitation__button-decline-invitation" onClick={() => getPool()}>Back</button>
        </div>
      </div>
    );
  }
  // stage 4 - invitation has been accepted, display pre game warm up
  if (acceptedInvitation) {
    return ( // to render on game
      <div className="opponentContainer__opponentDescription">
        <div className="opponentContainer__opponentDescription__Timer">
          <h4>GET READY</h4>
          <h4>TO DUEL WITH:</h4>
          <p className="timercountdown">{acceptedInvitation.opponnetDisplayname.split(' ')[0]}</p>
          <p className="timercountdown">{`in ${acceptedInvitation.countdown} s`}</p>
        </div>
      </div>
    );
  }
  // stage 5 - Game has started
  if (gameStart) {
    return ( // to render on game
      <div className="opponentContainer__opponentDescription">
        <div className="opponentContainer__opponentDescription__GamePlay">
          <p className="writing">{socketState.temp.opponent.displayName.split(' ')[0]}</p>
          <p className="writing">Lines Cleared</p>
          <p className="opponentContainer__opponentDescription__GamePlay__linescleared">{socketState.temp.gameState.points.totalLinesCleared}</p>
          <p className="writing">Games Played</p>
          <p className="opponentContainer__opponentDescription__GamePlay__gamesplayed">{socketState.temp.opponent.stats.mpStats.games_played}</p>
        </div>
      </div>
    );
  }
  // stage 6 - Game is done back to single player mode
  if (socketState.temp.status && socketState.temp.status[0] === 'GameOver') {
    return socketState.temp.status[1]
      ? ( // to render on game
        <div className="opponentContainer__opponentDescription">
          <div className="opponentContainer__opponentDescription__winner">
            <p>Congratulations</p>
            <p>You Have Won !!</p>
          </div>
        </div>
      )
      : ( // to render on game
        <div className="opponentContainer__opponentDescription">
          <div className="opponentContainer__opponentDescription__looser">
            <p>You Have Lost</p>
            <p>This Game, </p>
            <p>Better Luck</p>
            <p>Next Time !!</p>
          </div>
        </div>
      );
  }
  return ( // to render on loading
    <div className="opponentContainer__opponentDescription">
      <div className="loading" />
    </div>
  );
};

OpponentDescription.defaultProps = {
  socketState: {},
  setDifficulty: null,
  requestInvite: null,
  acceptInvite: null,
  difficulty: 2,
  declineInvite: {},
  getPool: {},
};
OpponentDescription.propTypes = {
  socketState: PropTypes.objectOf(PropTypes.any),
  setDifficulty: PropTypes.func,
  requestInvite: PropTypes.func,
  acceptInvite: PropTypes.func,
  difficulty: PropTypes.number,
  declineInvite: PropTypes.func,
  getPool: PropTypes.func,
};
export default OpponentDescription;
