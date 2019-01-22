import React from 'react';
import PropTypes from 'prop-types';
import './opponentdescription.css';
/* opponent top part of component */
const OpponentDescription = ({
  opponentState,
  difficulty,
  setDifficulty,
  requestInvite,
  acceptInvite,
}) => {
  // stage 1 - no logged in opponents in multiplayer mode found
  if (opponentState.status[0] === 'noopponents' && !Object.keys(opponentState.opponent).length) {
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
  if (opponentState.status[0] === 'opponents') {
    const players = opponentState.playerPool.map(p => (
      <button
        className="opponentContainer__opponentDescription__playersbutton"
        key={p.socketId}
        onClick={() => requestInvite(p.socketId)}
      >{p.displayName.split(' ')[0]}
      </button>));
    return (
      <div className="opponentContainer__opponentDescription">
        <p className="writing">Difficulty</p>
        <div className="opponentContainer__opponentDescription_diffButtons">
          {
            [1, 2, 3, 4].map(d => (
              d === difficulty ?
                <span key={d} className="opponentContainer__opponentDescription_diffButtons_dot_highlight" role="button" onClick={() => setDifficulty(d)} onKeyDown={() => {}} tabIndex={0} >{d}</span>
                :
                <span key={d} className="opponentContainer__opponentDescription_diffButtons_dot" role="button" onClick={() => setDifficulty(d)} onKeyDown={() => {}} tabIndex={0} >{d}</span>
            ))
          }
        </div>
        <p className="writing">Invite</p>
        {players}
      </div>
    );
  }
  // stage 3 - an invitation has been requested, display invitation for the invited
  if (opponentState.status[0] === 'Invite') {
    return (
      <div className="opponentContainer__opponentDescription">
        <div className="opponentContainer__opponentDescription__invitation">
          <p className="writing">Invite from</p>
          <p className="writing">{opponentState.status[1][0].displayName.split(' ')[0]}</p>
          <p className="writing">Difficulty = {opponentState.status[1][1]}</p>
          <button className="opponentContainer__opponentDescription__invitation__button-accept-invitation" onClick={() => acceptInvite()}>Accept</button>
          <button className="opponentContainer__opponentDescription__invitation__button-decline-invitation">Decline</button>
        </div>
      </div>
    );
  }
  // stage 4 - invitation has been accepted, display pre game warm up
  if (opponentState.status[0] === 'PreGame') {
    return ( // to render on game
      <div className="opponentContainer__opponentDescription">
        <div className="opponentContainer__opponentDescription__Timer">
          <h4>GET READY</h4>
          <h4>TO DUEL WITH:</h4>
          <p className="timercountdown">{opponentState.opponent.displayName.split(' ')[0]}</p>
          <p className="timercountdown">in {opponentState.status[1]} s</p>
        </div>
      </div>
    );
  }
  // stage 5 - Game has started
  if (opponentState.status[0] === 'Playing' && Object.keys(opponentState.gameState).length) {
    return ( // to render on game
      <div className="opponentContainer__opponentDescription">
        <div className="opponentContainer__opponentDescription__GamePlay">
          <p className="writing">{opponentState.opponent.displayName.split(' ')[0]}</p>
          <p className="writing">Lines Cleared</p>
          <p className="opponentContainer__opponentDescription__GamePlay__linescleared">{opponentState.gameState.points.totalLinesCleared}</p>
          <p className="writing">Games Played</p>
          <p className="opponentContainer__opponentDescription__GamePlay__gamesplayed">{opponentState.opponent.stats.mpStats.games_played}</p>
        </div>
      </div>
    );
  }
  // stage 6 - Game is done back to single player mode
  if (opponentState.status[0] === 'GameOver') {
    return opponentState.status[1] ?
      ( // to render on game
        <div className="opponentContainer__opponentDescription">
          <div className="opponentContainer__opponentDescription__winner">
            <p >Congratulations</p>
            <p >You Have Won !!</p>
          </div>
        </div>
      )
      :
      ( // to render on game
        <div className="opponentContainer__opponentDescription">
          <div className="opponentContainer__opponentDescription__looser">
            <p >You Have Lost</p>
            <p >This Game, </p>
            <p >Better Luck</p>
            <p >Next Time !!</p>
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
  opponentState: {},
  setDifficulty: null,
  requestInvite: null,
  acceptInvite: null,
  difficulty: 2,
};
OpponentDescription.propTypes = {
  opponentState: PropTypes.objectOf(PropTypes.any),
  setDifficulty: PropTypes.func,
  requestInvite: PropTypes.func,
  acceptInvite: PropTypes.func,
  difficulty: PropTypes.number,
};
export default OpponentDescription;
