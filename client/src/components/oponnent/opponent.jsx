import React from 'react';
import PropTypes from 'prop-types';
import './styles/opponentdescription.css';
// connect to redux
import { connect } from 'react-redux';
/* not handled yet
import {
  SIMULATE_GAMEPLAY,
} from '../../constants';
*/
// import { socket } from '../../Actions/socket';
import {
  clearCanvas, drawRubble, drawBoundary, drawCells,
} from '../game/scripts/canvas';

// custom components
import OpponentDescription from './opponentInfo';

// reads from store
const mapStateToProps = state => state;

// writes to store
class Opponent extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      gameState: {},
      status: ['', 0], // [status, data]
      playerPool: [],
      selfSocketId: '',
      opponent: {},
      levelsRaised: 0,
    };
    this.canvasOpponent = React.createRef();

    /* comment out all socket Transactions for now
    socket.on('CURRENT_POOL', pool => this.processPool(pool));
    socket.on('INVITATION_RECEIVED', invitedBy => this.processInvite(invitedBy));
    socket.on('GAME_DISCONNECTED', sId => this.disconnectGame(sId));
    socket.on('START_GAME', opp => this.processGameStart(opp));
    socket.on(SIMULATE_GAMEPLAY, oppGame => this.processGame(oppGame));
    socket.on('GAME_END', win => this.processGameEnd(win));
    */
  }

  componentDidMount() {
    this.countGameover = 0;
    // socket.emit('PLAYER_JOINED', JSON.stringify(this.props.user));
    console.log('Opponent Mounted!!');
  }

  componentDidUpdate(prevProps, prevState) {
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
  }

  componentWillUnmount() {
    // socket.emit('COMPONENT_UNMOUNTED', 'opponent');
    // socket.emit('disconnect', '');
  }

  setGame = () => {
    const { gameState, status } = this.state;
    if (Object.keys(gameState).length) {
      // full deep copy of game state needed as object mutation becomes a problem
      const copyOfState = JSON.parse(JSON.stringify(gameState));
      if (status[0] === 'GameOver') {
        clearCanvas(this.canvasOpponentContext, copyOfState);
        return;
      }
      const canvasOpponent = this.canvasOpponent.current;
      canvasOpponent.style.backgroundColor = 'black';
      this.canvasOpponentContext = canvasOpponent.getContext('2d');
      copyOfState.activeShape.unitBlockSize /= 2;
      clearCanvas(this.canvasOpponentContext, copyOfState);
      drawBoundary(this.canvasOpponentContext, copyOfState);
      drawCells(this.canvasOpponentContext, copyOfState.activeShape, true);
      drawRubble(this.canvasOpponentContext, copyOfState, true);
    }
  };

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
    const { gameState, status } = this.state;
    if (status[0] === 'GameOver') {
      clearCanvas(this.canvasOpponentContext, gameState);
      return;
    }
    const copyOfState = JSON.parse(JSON.stringify(this.state));
    copyOfState.gameState = JSON.parse(msg);
    this.setState(copyOfState, () => this.setGame());
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
  requestInvite = (p) => {
    console.log(p);
    // socket.emit('INVITATION_SENT', { hostSocketId: p, difficulty: this.props.difficulty });
  }

  acceptInvite = () => {
    const { status } = this.state;
    const { onSetDifficulty } = this.props;
    onSetDifficulty(status[1][1]);
    this.setState({
      status: ['Loading', null],
    });
    // socket.emit(
    // 'INVITATION_ACCEPTED', [this.state.selfSocketId, this.state.status[1][0].socketId]);
  }

  /* done sockets */

  render() {
    const { difficulty, game } = this.props;
    return (
      <div className="opponentContainer">
        <OpponentDescription
          opponentState={this.state}
          difficulty={difficulty}
          setDifficulty={this.setDifficulty}
          requestInvite={sId => this.requestInvite(sId)}
          acceptInvite={() => this.acceptInvite()}
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
