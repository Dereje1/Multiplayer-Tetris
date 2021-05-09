import React from 'react';
import PropTypes from 'prop-types';
/* font awesome */
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Box, ButtonGroup, Button, CircularProgress,
} from '@material-ui/core';
import {
  faSyncAlt,
} from '@fortawesome/free-solid-svg-icons';
import './styles/opponentdescription.scss';

/* opponent top part of component */
const OpponentDescription = ({
  socketState: temp,
  difficulty,
  setDifficulty,
  requestInvite,
  getPool,
}) => {
  const {
    opponents, invitationTo, declinedInvitation,
    acceptedInvitation, gameInProgress, gameOver,
  } = temp;
  // stage 1 - no logged in opponents in multiplayer mode found
  if (opponents && !opponents.length) {
    return (
      <div className="opponentContainer__opponentDescription">
        <p className="writing">No opponents  </p>
        <FontAwesomeIcon
          className="opponentContainer__opponentDescription__invitation_reload"
          icon={faSyncAlt}
          onClick={() => getPool()}
        />
      </div>
    );
  }
  // stage 2 - logged in opponents in multiplayer mode found, display invitation buttons
  if (opponents && opponents.length) {
    const players = (
      <ButtonGroup
        orientation="vertical"
        color="primary"
        aria-label="vertical outlined primary button group"
      >
        {temp.opponents.map(p => (
          <Button
            type="submit"
            key={p.socketId}
            variant="contained"
            size="large"
            onClick={() => requestInvite(p.socketId)}
          >
            {p.displayname.split(' ')[0]}
          </Button>
        ))}
      </ButtonGroup>
    );
    return (
      <Box className="opponentContainer__opponentDescription">
        <p className="writing">Difficulty</p>
        <ButtonGroup color="primary" aria-label="outlined primary button group">
          {
            [1, 2, 3, 4].map(d => (
              <Button
                key={d}
                role="button"
                onClick={() => setDifficulty(d)}
                onKeyDown={() => {}}
                tabIndex={0}
                variant={d === difficulty ? 'contained' : 'outlined'}
              >
                {d}
              </Button>
            ))
          }
        </ButtonGroup>
        <p className="writing">Invite</p>
        {players}
      </Box>
    );
  }
  // display pending invitation for the requester
  if (invitationTo) {
    return (
      <div className="opponentContainer__opponentDescription">
        <div className="opponentContainer__opponentDescription__invitation">
          <p className="writing">Pending</p>
          <p className="writing">Invitation to</p>
          <p className="writing">{temp.invitationTo.displaynameReciever.split(' ')[0]}</p>
          <CircularProgress />
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
          <FontAwesomeIcon
            className="opponentContainer__opponentDescription__invitation_reload"
            icon={faSyncAlt}
            onClick={() => getPool()}
          />
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
  if (gameInProgress) {
    const opponentGame = gameInProgress.opponentScreen
      ? JSON.parse(gameInProgress.opponentScreen)
      : 0;
    return ( // to render on game
      <div className="opponentContainer__opponentDescription">
        <div className="opponentContainer__opponentDescription__GamePlay">
          <p className="writing">{opponentGame ? gameInProgress.info.opponnetDisplayname.split(' ')[0] : null}</p>
          <p className="writing">Lines Cleared</p>
          <p className="opponentContainer__opponentDescription__GamePlay__linescleared">{opponentGame ? opponentGame.points.totalLinesCleared : 0}</p>
        </div>
      </div>
    );
  }
  // stage 6 - Game is done
  if (gameOver) {
    return (
      <div className="opponentContainer__opponentDescription">
        <div className="opponentContainer__opponentDescription__invitation">
          <FontAwesomeIcon
            className="opponentContainer__opponentDescription__invitation_reload"
            icon={faSyncAlt}
            onClick={() => getPool()}
          />
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
  difficulty: 2,
  getPool: {},
};
OpponentDescription.propTypes = {
  socketState: PropTypes.objectOf(PropTypes.any),
  setDifficulty: PropTypes.func,
  requestInvite: PropTypes.func,
  difficulty: PropTypes.number,
  getPool: PropTypes.func,
};
export default OpponentDescription;
