import React from 'react';
import PropTypes from 'prop-types';
// connect to redux for store read onlny
import { connect } from 'react-redux';
import { clientEmitter } from '../../sockethandler';
import { socket as socketConstants } from '../../constants/index';
import { drawShape, drawBoundary } from '../game/scripts/canvas';
// custom components
import OpponentDescription from './opponentInfo';
import './styles/opponentdescription.scss';
import soundFile from './styles/WPN.wav';

// read from store
const mapStateToProps = ({ game, socket: { temp } }) => ({ game, temp });
const {
  clientEmit: {
    LOOK_FOR_OPPONENTS,
    OPPONENT_UNMOUNTED,
    INVITATION_SENT,
    INVITATION_DECLINED,
    START_GAME,
    UPDATED_CLIENT_SCREEN,
  },
} = socketConstants;

class Opponent extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      levelsRaised: 0, // storage for surplus floor levels by opponent
      opponentLinesCleared: 0,
      canvasLoaded: false, // load canvas only once
      docHidden: false,
    };
    this.canvasOpponent = React.createRef();
  }

  componentDidMount() {
    console.log('Opponent Mounted!!');
    const { temp } = this.props;
    if (!temp) clientEmitter(LOOK_FOR_OPPONENTS, null);
  }

  componentDidUpdate(prevProps) {
    const { canvasLoaded, opponentLinesCleared, docHidden } = this.state;
    const { game: prevGame, temp: prevTemp } = prevProps;
    const {
      game, onReset, toggleMultiplayer, onCanvasFocus,
      temp, onSetDifficulty,
    } = this.props;
    /* load Opponent Canvas */
    if (!canvasLoaded && this.canvasOpponent.current) {
      this.loadOpponentCanvas();
      this.setState({ canvasLoaded: true });
    }
    /* handle game phases here */
    if (temp) {
      const tempKey = Object.keys(temp)[0];
      switch (tempKey) {
        case 'acceptedInvitation': {
          if (!prevTemp.acceptedInvitation) {
            onReset({ reStart: false });
            if (this.canvasOpponentContext && !this.canvasOpponentContext.canvas.hidden) {
              this.canvasOpponentContext.canvas.hidden = true;
            }
            break;
          }
          if (docHidden) this.audio.play();
          const { acceptedInvitation: { countdown: prevCountdown } } = prevTemp;
          const { acceptedInvitation: { countdown, difficulty } } = temp;
          const cdReachedZero = prevCountdown === 1 && countdown === 0;
          if (cdReachedZero) {
            this.audio.play();
            clientEmitter(START_GAME, {
              opponentInfo: temp[tempKey],
              clientScreen: JSON.stringify(game),
            });
            onSetDifficulty(difficulty);
            this.setState({ levelsRaised: 0, opponentLinesCleared: 0 });
          }
        }
          break;
        case 'gameInProgress': {
          const { gameInProgress: { info, opponentScreen } } = temp;
          if (!prevTemp.gameInProgress) { // game started
            onCanvasFocus();
            onReset({});
            toggleMultiplayer();
          } else { // game running
            /* Important
            It's is not enough to emit every time
            component updates, must emit when only the game
            actually CHANGES!!, otherwise big performance
            degredation if we have other things, like setstate
            update the component, meaning a new emit on every component
            update!
            */
            const { gameInProgress: { opponentScreen: prevOpponentScreen } } = prevTemp;
            // set opponent screen on socket data only if there is a difference in the opp game.
            if (opponentScreen !== prevOpponentScreen) {
              this.setGame(opponentScreen, prevOpponentScreen);
            }
            // emit client data only if there is a difference in client game.
            if (JSON.stringify(prevGame) === JSON.stringify(game)) return;
            clientEmitter(UPDATED_CLIENT_SCREEN, {
              opponentSID: info.opponentSID,
              clientScreen: JSON.stringify(game),
            });
          }
        }
          break;
        case 'gameOver': {
          const { onGameOver } = this.props;
          if (!prevTemp.gameOver) {
            onGameOver([opponentLinesCleared]);
            toggleMultiplayer();
          }
        }
          break;
        default:
          break;
      }
    }
  }

  componentWillUnmount() {
    const { temp } = this.props;
    // if a person unmounts in the middle of an invitation
    if (temp && temp.invitationFrom) clientEmitter(INVITATION_DECLINED, temp);
    clientEmitter(OPPONENT_UNMOUNTED, temp);
  }

  loadOpponentCanvas = () => {
    // load only once
    const canvasOpponent = this.canvasOpponent.current;
    canvasOpponent.style.backgroundColor = 'black';
    this.canvasOpponentContext = canvasOpponent.getContext('2d');
    this.canvasOpponentContext.canvas.hidden = true;
  };

  // called on every game object change
  setGame = (opponentScreen, prevOpponentScreen) => {
    if (!opponentScreen) return;
    const { temp } = this.props;
    const opp = JSON.parse(opponentScreen);
    const prevOpp = prevOpponentScreen ? JSON.parse(prevOpponentScreen) : null;
    if (temp.gameOver) return;
    // test if a floor raise is warranted
    if (opp && prevOpp) this.processFloorRaise(opp, prevOpp);
    if (this.canvasOpponentContext.canvas.hidden) this.canvasOpponentContext.canvas.hidden = false;
    opp.activeShape.unitBlockSize /= 2;
    drawShape(this.canvasOpponentContext, opp, true);
  };

  setDifficulty = (val) => {
    const { onSetDifficulty } = this.props;
    onSetDifficulty(val);
  };

  // test if a floor raise is warranted
  processFloorRaise = (currentGame, previousGame) => {
    const { levelsRaised } = this.state;
    const {
      temp:
          {
            gameInProgress:
            {
              info: { difficulty },
            },
          },
      onFloorRaise, floorsRaisedOnOpp,
    } = this.props;
    const {
      points: { totalLinesCleared: previouslyClearedLines },
      rubble: { boundaryCells: prevBoundryCells },
    } = previousGame;
    const {
      points: { totalLinesCleared },
      rubble: { boundaryCells },
    } = currentGame;
    // draw boundry in opponent screen if floor raise
    if (boundaryCells.length !== prevBoundryCells.length) {
      const copyOfGame = JSON.parse(JSON.stringify(currentGame));
      copyOfGame.activeShape.unitBlockSize /= 2;
      drawBoundary(this.canvasOpponentContext, copyOfGame, true);
      floorsRaisedOnOpp((boundaryCells.length - prevBoundryCells.length) / 10);
    }
    const linesCleared = totalLinesCleared - previouslyClearedLines;
    // return if no new lines have been cleared
    if (!linesCleared) return;
    this.setState({ opponentLinesCleared: totalLinesCleared });
    /*
    Difficulty                                 Description
    -----------------------------------------------------------------------------------
      1               After player clears 4 rows , floor is raised by 1 row on opponent
      2               After player clears 3 rows , floor is raised by 1 row on opponent
      3               After player clears 2 rows , floor is raised by 1 row on opponent
      4               After player clears 1 row  , floor is raised by 1 row on opponent
    */
    const difficultyMap = [[4, 1], [3, 2], [2, 3], [1, 4]]; // [[level, ]]
    // number of floors that needs to be cleared for a single floor raise on opp
    const amountNeededForRaise = difficultyMap.filter(d => d[0] === difficulty)[0][1];
    // Includes any surplus from previous lines cleared
    const totalRaisedByOpponent = levelsRaised + linesCleared;
    if (totalRaisedByOpponent >= amountNeededForRaise) {
      // Total levels to be raised on opponent
      const raiseOnClient = Math.floor(totalRaisedByOpponent / amountNeededForRaise);
      // To store for client if any surplus
      const storeForOpponent = totalRaisedByOpponent - (raiseOnClient * amountNeededForRaise);
      this.setState({ levelsRaised: storeForOpponent }, () => onFloorRaise(Number(raiseOnClient)));
    } else this.setState({ levelsRaised: totalRaisedByOpponent });
  };

  /* process socket-out-going below */
  requestInvite = (sentTo) => {
    const { difficulty } = this.props;
    clientEmitter(INVITATION_SENT, { sentTo, difficulty });
  };

  resetMultiplayer = () => {
    const { onReset } = this.props;
    onReset({ reStart: false });
    clientEmitter(LOOK_FOR_OPPONENTS, null);
    if (!this.canvasOpponentContext.canvas.hidden) this.canvasOpponentContext.canvas.hidden = true;
  };
  /* done sockets */

  audioPlayer = () => (
    <audio ref={(input) => { this.audio = input; }} src={soundFile}>
      <track kind="captions" />
    </audio>
  );

  render() {
    const { difficulty, game, temp } = this.props;
    if (!temp) return null;
    return (
      <div className="opponentContainer">
        <OpponentDescription
          socketState={temp}
          difficulty={difficulty}
          setDifficulty={this.setDifficulty}
          requestInvite={sId => this.requestInvite(sId)}
          acceptInvite={() => this.acceptInvite()}
          declineInvite={() => this.declineInvite()}
          getPool={() => this.resetMultiplayer()}
        />
        <canvas
          ref={this.canvasOpponent}
          width={game.canvas.canvasMajor.width / 2}
          height={game.canvas.canvasMajor.height / 2}
        />
        {this.audioPlayer()}
      </div>
    );
  }

}

Opponent.defaultProps = {
  game: {}, // client game in redux store
  temp: null, // socket info in redux store
  onFloorRaise: null,
  onReset: null, // callback to main game
  onSetDifficulty: null,
  difficulty: 2,
  onGameOver: null,
  toggleMultiplayer: null,
  onCanvasFocus: null,
  floorsRaisedOnOpp: null,
};
Opponent.propTypes = {
  temp: PropTypes.objectOf(PropTypes.any),
  game: PropTypes.objectOf(PropTypes.any),
  difficulty: PropTypes.number,
  onFloorRaise: PropTypes.func,
  onReset: PropTypes.func,
  onSetDifficulty: PropTypes.func,
  onGameOver: PropTypes.func,
  toggleMultiplayer: PropTypes.func,
  onCanvasFocus: PropTypes.func,
  floorsRaisedOnOpp: PropTypes.func,
};

export default connect(mapStateToProps)(Opponent);
