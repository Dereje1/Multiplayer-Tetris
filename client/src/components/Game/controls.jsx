import React from 'react';
import PropTypes from 'prop-types';
import './controls.css';
/* font awesome */
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPowerOff, faPause, faPlay, faUsers, faUser } from '@fortawesome/free-solid-svg-icons';

/* adds font awesome icons */
library.add(faPowerOff, faPause, faPlay);

const Controls = (props) => {
  if (!props.multiPlayer[0]) {
    return (
      <div className="controls">
        <canvas
          ref={props.onCanvas}
          width={props.game.canvas.canvasMinor.width}
          height={props.game.canvas.canvasMinor.height}
          tabIndex="0"
        />
        <div className="controls__resetPause">
          <FontAwesomeIcon
            className="controls__resetPause__reset"
            icon={faPowerOff}
            onClick={() => props.onReset(false)}
          />
          {
            props.game.paused ?
              <FontAwesomeIcon
                className="controls__resetPause__play"
                icon={faPlay}
                onClick={props.onhandlePause()}
              />
              :
              <FontAwesomeIcon
                className="controls__resetPause__pause"
                icon={faPause}
                onClick={props.onhandlePause()}
              />
          }
        </div>
        <FontAwesomeIcon
          className="controls__multiplayer"
          icon={faUsers}
          onClick={props.onMultiPlayer()}
        />

        <button className="controls__raise" onClick={() => props.onFloorRaise()}>
          Raise Floor
        </button>
        <label htmlFor="test">Lines Cleared</label>
        <label htmlFor="test">{props.game.points.totalLinesCleared}</label>
        <label htmlFor="test">Level</label>
        <label htmlFor="test">{props.game.points.level}</label>
      </div>

    );
  }

  return (
    <div className="controls">
      <canvas
        ref={props.onCanvas}
        width={props.game.canvas.canvasMinor.width}
        height={props.game.canvas.canvasMinor.height}
        tabIndex="0"
      />
      {
        !props.multiPlayer[1] ?
          <FontAwesomeIcon
            className="controls__multiplayer"
            icon={faUser}
            onClick={props.onMultiPlayer()}
          />
          :
          null
      }

      <label htmlFor="test">Lines Cleared</label>
      <label htmlFor="test">{props.game.points.totalLinesCleared}</label>
      <label htmlFor="test">Difficulty</label>
      <label htmlFor="test">{props.difficulty}</label>
      {
        props.socketId ?
          <label className="controls__socket" htmlFor="test">{props.socketId}</label>
          :
          null
      }
    </div>

  );
};

Controls.defaultProps = {
  onReset: null,
  onFloorRaise: null,
  onhandlePause: null,
  game: {},
  onCanvas: null,
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
  onCanvas: PropTypes.objectOf(PropTypes.any),
  multiPlayer: PropTypes.arrayOf(PropTypes.bool),
  difficulty: PropTypes.number,
  socketId: PropTypes.string,
};
export default Controls;
