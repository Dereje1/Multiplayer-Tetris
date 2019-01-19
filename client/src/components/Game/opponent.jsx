import React from 'react';
import PropTypes from 'prop-types';
import './opponentdescription.css';
// connect to redux
import { connect } from 'react-redux';

import {
  SIMULATE_GAMEPLAY,
} from '../../constants';

import { socket } from '../../Actions/socket';
import { clearCanvas, drawRuble, drawBoundary, drawCells } from './scripts/canvas';

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

    socket.on('CURRENT_POOL', pool => this.processPool(pool));
    socket.on('INVITATION_RECEIVED', invitedBy => this.processInvite(invitedBy));
    socket.on('GAME_DISCONNECTED', sId => this.disconnectGame(sId));
    socket.on('START_GAME', opp => this.processGameStart(opp));
    socket.on(SIMULATE_GAMEPLAY, oppGame => this.processGame(oppGame));
    socket.on('GAME_END', win => this.processGameEnd(win));
  }
  componentDidMount() {
    this.countGameover = 0;
    socket.emit('PLAYER_JOINED', JSON.stringify(this.props.user));
    console.log('Opponent Mounted!!');
  }

  componentDidUpdate(prevProps, prevState) {
    if (Object.keys(prevState.gameState).length) {
      if (prevState.gameState.points.totalLinesCleared !==
         this.state.gameState.points.totalLinesCleared) {
        this.processFloorRaise();
      }
    }
    if (prevState.status[0] !== this.state.status[0]) {
      if ((this.state.status[0] === 'Playing') || (this.state.status[0] === 'GameOver')) {
        this.props.onDisableExit(true);
      }
    }
  }

  componentWillUnmount() {
    socket.emit('COMPONENT_UNMOUNTED', 'opponent');
    socket.emit('disconnect', '');
  }

  setGame = () => {
    if (Object.keys(this.state.gameState).length) {
      // full deep copy of game state needed as object mutation becomes a problem
      const copyOfState = JSON.parse(JSON.stringify(this.state.gameState));
      if (this.state.status[0] === 'GameOver') {
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
      drawRuble(this.canvasOpponentContext, copyOfState, true);
    }
  };

  setUp = () => {
    const opponentsAvailable = !!this.state.playerPool.length;
    if (!opponentsAvailable) {
      this.setState({
        status: ['noopponents', 0],
      });
    } else {
      this.setState({
        status: ['opponents', this.state.playerPool.length],
      });
    }
  }
  setDifficulty = (val) => {
    this.props.onSetDifficulty(val);
  }

  processFloorRaise = () => {
    /*
    Difficulty                                 Description
    -----------------------------------------------------------------------------------
      1               After player clears 4 rows , floor is raised by 1 row on opponent
      2               After player clears 3 rows , floor is raised by 1 row on opponent
      3               After player clears 2 rows , floor is raised by 1 row on opponent
      4               After player clears 1 row  , floor is raised by 1 row on opponent
    */
    const { totalLinesCleared } = this.state.gameState.points;
    const difficultyMap = [[4, 1], [3, 2], [2, 3], [1, 4]]; // [[level, ]]
    const amountNeededForRaise = difficultyMap.filter(d => d[0] === this.props.difficulty)[0][1];
    const targetRaised = Math.floor(totalLinesCleared * (1 / amountNeededForRaise));
    const toRaise = targetRaised - this.state.levelsRaised;
    if (toRaise > 0) this.props.onFloorRaise(Number(toRaise));
    this.setState({
      levelsRaised: this.state.levelsRaised + toRaise,
    });
  }

  /* process socket-in-coming below */
  processPool = (poolData) => {
    const checkSelfSocketId = this.state.selfSocketId === '' ? poolData.self : this.state.selfSocketId;
    const nonSelfPoolData = poolData.pool.filter(p => p.socketId !== checkSelfSocketId);
    const playerChoices = [];
    nonSelfPoolData.forEach((sock, idx) => {
      if (idx < 5) playerChoices.push(sock);
    });

    this.setState({
      playerPool: playerChoices,
      selfSocketId: this.state.selfSocketId === '' ? poolData.self : this.state.selfSocketId,
    }, () => this.setUp());
  }

  disconnectGame = () => {
    console.log('A signal has come in that your Opponent Disconnected the Game!!');
    // add penalty in database for this in the future
    this.props.onGameOver(null);
  }

  processInvite = (host) => {
    const fullPlayerInfo = this.state.playerPool.filter(p => p.socketId === host.hostSocketId)[0];
    this.setState({
      status: ['Invite', [fullPlayerInfo, host.difficulty]],
    });
  }

  processGameStart = (opp) => {
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
        this.props.onGameEmit({ self: this.state.selfSocketId, opponnent: opp });
        this.props.onReset();
        clearInterval(gameStartId);
      }
    }, 1000);
  }

  processGame = (msg) => {
    if (this.state.status[0] === 'GameOver') {
      clearCanvas(this.canvasOpponentContext, this.state.gameState);
      return;
    }
    const copyOfState = JSON.parse(JSON.stringify(this.state));
    copyOfState.gameState = JSON.parse(msg);
    this.setState(copyOfState, () => this.setGame());
  }

  processGameEnd = (isWinner) => {
    this.props.onClearCanvas();
    this.countGameover += 1;
    if (this.countGameover > 1) return;
    // clearCanvas(this.canvasOpponentContext, this.state.gameState);
    // isWinner , true if client won
    const databaseEntry = isWinner ?
      {
        difficulty: this.props.difficulty,
        multiPlayer: true,
        players: [
          {
            name: this.props.user.displayName,
            _id: this.props.user._id,
            score: this.props.game.points.totalLinesCleared * 50,
            winner: isWinner,
          },
          {
            name: this.state.opponent.displayName,
            _id: this.state.opponent._id,
            score: this.state.gameState.points.totalLinesCleared * 50,
            winner: !isWinner,
          },
        ],
      }
      : null;

    let startCounter = 10;
    this.setState({
      status: ['GameOver', isWinner],
    }, () => this.props.onPause(true));
    console.log(`game over called ${this.countGameover}`);
    const gameEndId = setInterval(() => {
      startCounter -= 1;
      if (startCounter <= 0) {
        if (databaseEntry) this.props.onGameOver(databaseEntry);
        else this.props.onGameOver(null);
        this.props.onDisableExit(false);
        clearInterval(gameEndId);
        this.props.onReset(false);
      }
    }, 1000);
  };

  /* process socket-out-going below */
  requestInvite = (p) => {
    socket.emit('INVITATION_SENT', { hostSocketId: p, difficulty: this.props.difficulty });
  }

  acceptInvite = () => {
    this.props.onSetDifficulty(this.state.status[1][1]);
    this.setState({
      status: ['Loading', null],
    });
    socket.emit('INVITATION_ACCEPTED', [this.state.selfSocketId, this.state.status[1][0].socketId]);
  }

  /* done sockets */

  render() {
    return (
      <div className="opponentContainer">
        <OpponentDescription
          opponentState={this.state}
          difficulty={this.props.difficulty}
          setDifficulty={this.setDifficulty}
          requestInvite={sId => this.requestInvite(sId)}
          acceptInvite={() => this.acceptInvite()}
        />
        <canvas
          ref={this.canvasOpponent}
          width={this.props.game.canvas.canvasMajor.width / 2}
          height={this.props.game.canvas.canvasMajor.height / 2}
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

