import React from 'react';
import PropTypes from 'prop-types';
import './styles/controls.scss';
/* font awesome */
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers, faUser,
} from '@fortawesome/free-solid-svg-icons';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import IconButton from '@mui/material/IconButton';
import PlayCircleFilledWhiteIcon from "@mui/icons-material/PlayCircleFilledWhite";
import PauseIcon from "@mui/icons-material/Pause";


const PlayControls = ({ pauseButtonState, onhandlePause, onReset, disabled }) => (
  <>
    <IconButton
      aria-label="reset"
      size="large"
      onClick={() => onReset(false)}
      disabled={disabled}
    >
      <RestartAltIcon sx={{ fontSize: 52, color: disabled ? 'grey' : 'rgb(59, 9, 153)' }} />
    </IconButton>
    {
      pauseButtonState
        ? (
          <IconButton aria-label="play" size="large" onClick={onhandlePause} disabled={disabled}>
            <PlayCircleFilledWhiteIcon sx={{ fontSize: 52, color: disabled ? 'grey' : 'green' }} />
          </IconButton>
        )
        : (
          <IconButton aria-label="play" size="large" onClick={onhandlePause} disabled={disabled}>
            <PauseIcon sx={{ fontSize: 52, color: disabled ? 'grey' : 'red' }} />
          </IconButton>
        )
    }
  </>
)

const Controls = ({
  onhandlePause,
  onMultiPlayer,
  onFloorRaise,
  onReset,
  minorCanvas,
  game,
  multiPlayer,
  difficulty,
  socketId,
  pauseButtonState,
  allowMultiPlayer,
}) => {
  if (!multiPlayer[0]) {
    return (
      <div className="controls">
        <canvas
          ref={minorCanvas}
          width={game.canvas.canvasMinor.width}
          height={game.canvas.canvasMinor.height}
          tabIndex="0"
        />
        <div className="controls__resetPause">
          <PlayControls
            pauseButtonState={pauseButtonState}
            onhandlePause={onhandlePause}
            onReset={onReset}
          />
        </div>
        {
          allowMultiPlayer
            ? (
              <FontAwesomeIcon
                className="controls__multiplayer"
                icon={faUsers}
                onClick={onMultiPlayer}
              />
            )
            : null
        }
        <button
          className="controls__raise"
          type="submit"
          onClick={onFloorRaise}
        >
          Raise Floor
        </button>
        <span>Lines Cleared</span>
        <span>{game.points.totalLinesCleared}</span>
        <span>Level</span>
        <span>{game.points.level}</span>
        <span>Single Player Mode</span>
      </div>

    );
  }

  return (
    <div className="controls">
      <canvas
        ref={minorCanvas}
        width={game.canvas.canvasMinor.width}
        height={game.canvas.canvasMinor.height}
        tabIndex="0"
      />
      <div className="controls__resetPause">
        <PlayControls
          pauseButtonState={pauseButtonState}
          onhandlePause={onhandlePause}
          onReset={onReset}
          disabled={true}
        />
      </div>
      {
        !multiPlayer[1] ? (
          <FontAwesomeIcon
            className="controls__multiplayer"
            icon={faUser}
            onClick={onMultiPlayer}
          />
        )
          : null
      }
      <div style={{ height: 40 }}></div>
      <span>Lines Cleared</span>
      <span>{game.points.totalLinesCleared}</span>
      <span>Difficulty</span>
      <span>{difficulty}</span>
      <span>Multi Player Mode</span>
      {
        socketId
          ? <span className="controls__socket">{socketId}</span>
          : null
      }
    </div>

  );
};

Controls.defaultProps = {
  onReset: null,
  onFloorRaise: null,
  onhandlePause: null,
  game: {},
  minorCanvas: null,
  onMultiPlayer: null,
  multiPlayer: [],
  difficulty: 2,
  socketId: '',
};
Controls.propTypes = {
  onReset: PropTypes.func,
  onFloorRaise: PropTypes.func,
  onhandlePause: PropTypes.func,
  onMultiPlayer: PropTypes.func,
  game: PropTypes.objectOf(PropTypes.any),
  minorCanvas: PropTypes.objectOf(PropTypes.any),
  multiPlayer: PropTypes.arrayOf(PropTypes.bool),
  difficulty: PropTypes.number,
  socketId: PropTypes.string,
  pauseButtonState: PropTypes.bool.isRequired,
  allowMultiPlayer: PropTypes.bool.isRequired,
};
export default Controls;
