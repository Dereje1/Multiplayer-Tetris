import React from 'react';
import PropTypes from 'prop-types';
import './styles/opponentdescription.css';
// connect to redux
import { connect } from 'react-redux';
import { clientEmitter, socketConnection } from '../../sockethandler';
import { socket as socketConstants } from '../../constants/index';
import {
  clearCanvas, drawRubble, drawBoundary, drawShape,
} from '../game/scripts/canvas';

// custom components
import OpponentDescription from './opponentInfo';

// reads from store
const mapStateToProps = state => state;
const {
  clientEmit: {
    LOOK_FOR_OPPONENTS,
    OPPONENT_UNMOUNTED,
    INVITATION_SENT,
    INVITATION_DECLINED,
    INVITATION_ACCEPTED,
    START_GAME,
    UPDATED_CLIENT_SCREEN,
  },
  serverEmit: {
    OPPONENT_SCREEN,
  },
} = socketConstants;

class Opponent extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      opponentScreen: {}, // refreshed by socket
      gameState: {},
      status: ['', 0], // [status, data]
      playerPool: [],
      selfSocketId: '',
      opponent: {},
      levelsRaised: 0,
    };
    this.canvasOpponent = React.createRef();
    this.gamestart = false;
    socketConnection.on(
      OPPONENT_SCREEN,
      screen => this.processGame(screen),
    );
  }

  componentDidMount() {
    console.log('Opponent Mounted!!');
    this.countGameover = 0;
    const { socket: { temp } } = this.props;
    if (!temp) clientEmitter(LOOK_FOR_OPPONENTS, null);
  }

  componentDidUpdate(prevProps) {
    const { socket: { temp: prevTemp } } = prevProps;
    const { socket: { temp } } = this.props;
    const { game, onReset } = this.props;
    if (temp) {
      const tempKey = Object.keys(temp)[0];

      switch (tempKey) {
        case 'acceptedInvitation': {
          if (!prevTemp.acceptedInvitation) break;
          const { acceptedInvitation: { countdown: prevCountdown } } = prevTemp;
          const { acceptedInvitation: { countdown } } = temp;
          if (prevCountdown === 1 && countdown === 0) {
            clientEmitter(START_GAME, {
              opponentInfo: temp[tempKey],
              clientScreen: JSON.stringify(game),
            });
          }
        }
          break;
        case 'opponentGame': {
          const { opponentGame: { info } } = temp;
          // this.setGame();
          if (!prevTemp.opponentGame) { // game started
            onReset();
          } else { // game running
            clientEmitter(UPDATED_CLIENT_SCREEN, {
              opponentSID: info.opponentSID,
              clientScreen: JSON.stringify(game),
            });
          }
        }
          break;
        default:
          break;
      }
    }
    /*
    const { gameState, status } = this.state;
    const { onDisableExit } = this.props;

    if (Object.keys(prevState.gameState).length) {
      if (prevState.gameState.points.totalLinesCleared
        !== gameState.points.totalLinesCleared) {
        this.processFloorRaise();
      }
    }
    if (prevState.status[0] !== status[0]) {
      if ((status[0] === 'Playing') || (status[0] === 'GameOver')) {
        onDisableExit(true);
      }
    }
    */
  }

  componentWillUnmount() {
    const { socket: { temp } } = this.props;
    // if a person leaves component in the middle of an invitation
    if (temp.invitationFrom) clientEmitter(INVITATION_DECLINED, temp);
    clientEmitter(OPPONENT_UNMOUNTED, null);
    // socket.emit('COMPONENT_UNMOUNTED', 'opponent');
    // socket.emit('disconnect', '');
  }

  setGame = (opponentScreen) => {
    /*
      if (status[0] === 'GameOver') {
        clearCanvas(this.canvasOpponentContext, copyOfState);
        return;
      }
      */
    const canvasOpponent = this.canvasOpponent.current;
    canvasOpponent.style.backgroundColor = 'black';
    this.canvasOpponentContext = canvasOpponent.getContext('2d');
    opponentScreen.activeShape.unitBlockSize /= 2;
    // clearCanvas(this.canvasOpponentContext, opponentScreen);
    //drawBoundary(this.canvasOpponentContext, opponentScreen);
    drawShape(this.canvasOpponentContext, opponentScreen.activeShape, opponentScreen, true);
   // drawRubble(this.canvasOpponentContext, opponentScreen, true);
  }

  setUp = () => {
    const { playerPool } = this.state;
    const opponentsAvailable = !!playerPool.length;
    if (!opponentsAvailable) {
      this.setState({
        status: ['noopponents', 0],
      });
    } else {
      this.setState({
        status: ['opponents', playerPool.length],
      });
    }
  }

  setDifficulty = (val) => {
    const { onSetDifficulty } = this.props;
    onSetDifficulty(val);
  }

  processFloorRaise = () => {
    const { gameState, levelsRaised } = this.state;
    const { difficulty, onFloorRaise } = this.props;
    /*
    Difficulty                                 Description
    -----------------------------------------------------------------------------------
      1               After player clears 4 rows , floor is raised by 1 row on opponent
      2               After player clears 3 rows , floor is raised by 1 row on opponent
      3               After player clears 2 rows , floor is raised by 1 row on opponent
      4               After player clears 1 row  , floor is raised by 1 row on opponent
    */
    const { totalLinesCleared } = gameState.points;
    const difficultyMap = [[4, 1], [3, 2], [2, 3], [1, 4]]; // [[level, ]]
    const amountNeededForRaise = difficultyMap.filter(d => d[0] === difficulty)[0][1];
    const targetRaised = Math.floor(totalLinesCleared * (1 / amountNeededForRaise));
    const toRaise = targetRaised - levelsRaised;
    if (toRaise > 0) onFloorRaise(Number(toRaise));
    this.setState({
      levelsRaised: levelsRaised + toRaise,
    });
  }

  /* process socket-in-coming below */
  processPool = (poolData) => {
    const { selfSocketId } = this.state;
    const checkSelfSocketId = selfSocketId === '' ? poolData.self : selfSocketId;
    const nonSelfPoolData = poolData.pool.filter(p => p.socketId !== checkSelfSocketId);
    const playerChoices = [];
    nonSelfPoolData.forEach((sock, idx) => {
      if (idx < 5) playerChoices.push(sock);
    });

    this.setState({
      playerPool: playerChoices,
      selfSocketId: selfSocketId === '' ? poolData.self : selfSocketId,
    }, () => this.setUp());
  }

  disconnectGame = () => {
    const { onGameOver } = this.props;
    console.log('A signal has come in that your Opponent Disconnected the Game!!');
    // add penalty in database for this in the future
    onGameOver(null);
  }

  processInvite = (host) => {
    const { playerPool } = this.state;
    const fullPlayerInfo = playerPool.filter(p => p.socketId === host.hostSocketId)[0];
    this.setState({
      status: ['Invite', [fullPlayerInfo, host.difficulty]],
    });
  }

  processGameStart = (opp) => {
    const { selfSocketId } = this.state;
    const { onGameEmit, onReset } = this.props;
    this.setState({
      opponent: opp,
    });
    let startCounter = 15;
    const gameStartId = setInterval(() => {
      this.setState({
        status: ['PreGame', startCounter],
      });
      startCounter -= 1;
      if (startCounter <= 0) {
        this.setState({
          status: ['Playing', null],
        });
        onGameEmit({ self: selfSocketId, opponnent: opp });
        onReset();
        clearInterval(gameStartId);
      }
    }, 1000);
  }

  processGame = (msg) => {
    const { opponentScreen, status } = this.state;
    if (status[0] === 'GameOver') {
      clearCanvas(this.canvasOpponentContext, opponentScreen);
      return;
    }
    this.setGame(JSON.parse(msg));
    // this.setState({ opponentScreen: JSON.parse(msg) });
  }

  processGameEnd = (isWinner) => {
    const {
      onClearCanvas, difficulty, user, game,
    } = this.props;
    const { gameState, opponent } = this.state;
    onClearCanvas();
    this.countGameover += 1;
    if (this.countGameover > 1) return;
    // clearCanvas(this.canvasOpponentContext, this.state.gameState);
    // isWinner , true if client won
    const databaseEntry = isWinner
      ? {
        difficulty,
        multiPlayer: true,
        players: [
          {
            name: user.displayName,
            _id: user._id,
            score: game.points.totalLinesCleared * 50,
            winner: isWinner,
          },
          {
            name: opponent.displayName,
            _id: opponent._id,
            score: gameState.points.totalLinesCleared * 50,
            winner: !isWinner,
          },
        ],
      }
      : null;

    let startCounter = 10;
    const {
      onPause, onGameOver, onDisableExit, onReset,
    } = this.props;
    this.setState({
      status: ['GameOver', isWinner],
    }, () => onPause(true));
    console.log(`game over called ${this.countGameover}`);
    const gameEndId = setInterval(() => {
      startCounter -= 1;
      if (startCounter <= 0) {
        if (databaseEntry) onGameOver(databaseEntry);
        else onGameOver(null);
        onDisableExit(false);
        clearInterval(gameEndId);
        onReset(false);
      }
    }, 1000);
  };

  /* process socket-out-going below */
  requestInvite = (sentTo) => {
    const { difficulty } = this.props;
    clientEmitter(INVITATION_SENT, { sentTo, difficulty });
    // socket.emit('INVITATION_SENT', { hostSocketId: p, difficulty: this.props.difficulty });
  }

  declineInvite = () => {
    const { socket: { temp } } = this.props;
    clientEmitter(INVITATION_DECLINED, temp);
    clientEmitter(LOOK_FOR_OPPONENTS, null);
  };

  acceptInvite = () => {
    const { socket: { temp } } = this.props;
    // const { onSetDifficulty } = this.props;
    clientEmitter(INVITATION_ACCEPTED, temp);
    // onSetDifficulty(status[1][1]);
    this.setState({
      status: ['Loading', null],
    });
  }

  /* done sockets */

  render() {
    const { difficulty, game, socket } = this.props;
    if (!socket.temp) return null;
    return (
      <div className="opponentContainer">
        <OpponentDescription
          socketState={socket}
          difficulty={difficulty}
          setDifficulty={this.setDifficulty}
          requestInvite={sId => this.requestInvite(sId)}
          acceptInvite={() => this.acceptInvite()}
          declineInvite={() => this.declineInvite()}
          getPool={() => clientEmitter(LOOK_FOR_OPPONENTS, null)}
        />
        <canvas
          ref={this.canvasOpponent}
          width={game.canvas.canvasMajor.width / 2}
          height={game.canvas.canvasMajor.height / 2}
        />
      </div>
    );
  }

}

Opponent.defaultProps = {
  game: {},
  user: {},
  socket: {},
  onFloorRaise: null,
  onReset: null,
  onGameEmit: null,
  onGameOver: null,
  onSetDifficulty: null,
  onClearCanvas: null,
  onPause: null,
  onDisableExit: null,
  difficulty: 2,
};
Opponent.propTypes = {
  socket: PropTypes.objectOf(PropTypes.any),
  game: PropTypes.objectOf(PropTypes.any),
  user: PropTypes.objectOf(PropTypes.any),
  difficulty: PropTypes.number,
  onFloorRaise: PropTypes.func,
  onReset: PropTypes.func,
  onGameEmit: PropTypes.func,
  onGameOver: PropTypes.func,
  onSetDifficulty: PropTypes.func,
  onClearCanvas: PropTypes.func,
  onPause: PropTypes.func,
  onDisableExit: PropTypes.func,
};

export default connect(mapStateToProps)(Opponent);
