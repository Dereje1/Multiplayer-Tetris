import React from 'react';
import PropTypes from 'prop-types';
import './controls.css';
/* font awesome */
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPowerOff, faPause, faPlay, faUsers, faUser,
} from '@fortawesome/free-solid-svg-icons';

/* adds font awesome icons */
library.add(faPowerOff, faPause, faPlay);

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
          <FontAwesomeIcon
            className="controls__resetPause__reset"
            icon={faPowerOff}
            onClick={() => onReset(false)}
          />
          {
            pauseButtonState
              ? (
                <FontAwesomeIcon
                  className="controls__resetPause__play"
                  icon={faPlay}
                  onClick={onhandlePause()}
                />
              )
              : (
                <FontAwesomeIcon
                  className="controls__resetPause__pause"
                  icon={faPause}
                  onClick={onhandlePause()}
                />
              )
          }
        </div>
        <FontAwesomeIcon
          className="controls__multiplayer"
          icon={faUsers}
          onClick={onMultiPlayer()}
        />

        <button
          className="controls__raise"
          type="submit"
          onClick={() => onFloorRaise()}
        >
          {'Raise Floor'}
        </button>
        <span>Lines Cleared</span>
        <span>{game.points.totalLinesCleared}</span>
        <span>Level</span>
        <span>{game.points.level}</span>
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
      {
        !multiPlayer[1] ? (
          <FontAwesomeIcon
            className="controls__multiplayer"
            icon={faUser}
            onClick={onMultiPlayer()}
          />
        )
          : null
      }

      <span>Lines Cleared</span>
      <span>{game.points.totalLinesCleared}</span>
      <span>Difficulty</span>
      <span>{difficulty}</span>
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
};
export default Controls;
