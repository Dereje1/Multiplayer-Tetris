import React from 'react';
import PropTypes from 'prop-types';

import './styles/game.css';
// connect to redux and get action creators
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  gameReset, nextShape, updateScreen, raiseFloor,
  collide, speedUp, pause, getFloorRaiseBoundry,
} from '../../redux/actions/tetris';
import looserSoundFile from './styles/Looser.wav';
import winnerSoundFile from './styles/Winner.wav';
// custom functions and scripts
import tetrisShapes from './scripts/shapes';
import shapeLocator from './scripts/locateShape';
import { runCollisionTest } from './scripts/collision';
import {
  clearCanvas, drawNextShape, drawGameOver, drawFloor, drawShape,
} from './scripts/canvas';
import drawScreen from './scripts/drawscreen';
import playerMoves from './scripts/player';
import { processMatch, processSinglePlayer } from './scripts/dbinteraction';
// custom react Components
import Controls from '../controls/controls';
import Opponent from '../oponnent/opponent';
// socket
import { socket as socketConstants } from '../../constants/index';
import { clientEmitter } from '../../sockethandler';

const {
  clientEmit: {
    GAME_OVER,
  },
} = socketConstants; // the only emit component makes
// reads from store
const mapStateToProps = state => state;

// writes to store
const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    gameReset,
    nextShape,
    updateScreen,
    raiseFloor,
    collide,
    speedUp,
    pause,
  }, dispatch),
});

class Game extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      multiPlayer: false, // True if in multiplayer mode
      inGameToggle: false, // disallows unmounting of a game in progress in multiplayer
      difficulty: 2, // level transmitted to a guest opponent upon invitation
      floorsRaised: 0, // captures floors raised on opponent
      buttonPause: true, // single player only
      updateFloor: false, // builds floor on next tick if true
      canvasLoaded: false, // loads only once per mount
      windowTooSmall: null,
      lastRefresh: 0, // animation last refresh
      requestAnimation: true, // used a switch to turn animation off/on
    };
    this.canvasMajor = React.createRef();
    this.canvasMinor = React.createRef();
    this.winnerAudio = React.createRef();
    this.looserAudio = React.createRef();
  }


  componentDidMount() {
    const { actions, socket } = this.props;
    actions.gameReset(1); // initialize canvas width/height
    this.checkWindowSize();
    window.addEventListener('resize', () => this.checkWindowSize());
    if (socket.temp && socket.temp.invitationFrom) this.setState({ multiPlayer: true });
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { lastRefresh } = this.state;
    // component already updates on redux prop change of y-movement for new tick
    // prevent an unnecessary update on last refresh being changed in the state.
    if (nextState.lastRefresh !== lastRefresh) return false;
    return true;
  }

  componentDidUpdate(prevProps) {
    // all optimizations go here
    if (!Object.keys(prevProps.game).length) return;
    const { game: prevGame, socket: prevSocket } = prevProps;
    const { game, socket, actions } = this.props;
    const {
      multiPlayer, canvasLoaded, windowTooSmall,
    } = this.state;
    if (windowTooSmall) return;

    /* load Canvas */
    if (!canvasLoaded && this.canvasMajor) this.loadCanvas();

    /* spped up on level up */
    if ((game.points.level > prevGame.points.level)
          && (game.timerInterval > 100)
          && (!multiPlayer)
    ) actions.speedUp();

    /* draws floor or sets state to do so before the next tick */
    if (game.rubble.boundaryCells.length > 10
       && prevGame.rubble.boundaryCells.length !== game.rubble.boundaryCells.length) {
      if (!game.activeShape.cells.length || game.paused) drawFloor(game, this.canvasContextMajor);
      else this.setState({ updateFloor: true });
    }

    /* an Invitation from another client has been accepted */
    if (!multiPlayer && socket.temp) {
      if (prevSocket.temp && !prevSocket.temp.acceptedInvitation
          && socket.temp.acceptedInvitation) {
        this.setState({ multiPlayer: true }, () => this.resetBoard(false));
      }
    }
    /* Opponent has unmounted after accepting invitation but no game started */
    if (prevSocket && prevSocket.temp && !socket.temp) {
      this.setState({ multiPlayer: false }, () => this.resetBoard(false));
    }
  }

  componentWillUnmount() {
    this.endTick('componentWillUnmount');
    window.removeEventListener('resize', () => {});
  }

  loadCanvas = () => {
    // loads canvas once on game mount
    const canvasMajor = this.canvasMajor.current;
    const canvasMinor = this.canvasMinor.current;
    canvasMajor.focus();
    canvasMajor.style.backgroundColor = 'black';
    canvasMinor.style.backgroundColor = 'black';
    this.canvasContextMajor = canvasMajor.getContext('2d');
    this.canvasContextMinor = canvasMinor.getContext('2d');
    this.canvasMajor.current.focus();
    this.setState({ canvasLoaded: true });
  }

  resetBoard = (
    reStart = true, // if false will not start with a new shape/ tick
    keepFloor = false, // used to set floor height in sp mode
    gameover = false,
    opponent = null, // opponent info needed for canvas
  ) => {
    const { game, actions } = this.props;
    this.setState({ floorsRaised: 0 });
    if (gameover) {
      drawGameOver(this.canvasContextMajor, this.canvasContextMinor, game, opponent);
      actions.gameReset(1);
      return;
    }
    const floorHeight = game.rubble && keepFloor ? game.rubble.boundaryCells.length / 10 : 1;
    actions.gameReset(floorHeight);
    if (this.animationId) this.endTick('reset Board');
    if (reStart) { // fresh game
      this.startTick();
    } else {
      this.setState({
        buttonPause: true,
      });
    }
    clearCanvas(this.canvasContextMajor, 'All', 'reset'); // clear canvasMajor
    if (reStart) drawFloor(game, this.canvasContextMajor);
    clearCanvas(this.canvasContextMinor, 'All', 'reset'); // clear canvasMajor
  }

  startTick = async (makeNewShape = true) => {
    const { actions } = this.props;
    if (makeNewShape) {
      const data = this.newShape();
      // unable to update store wwithout async, not sure why ??
      await actions.updateScreen(data);
      // eslint-disable-next-line react/destructuring-assignment
      drawShape(this.canvasContextMajor, this.props.game);
    }
    // setTimeout so not too immediately start the animation after new shape
    setTimeout(() => {
      this.setState({ requestAnimation: true });
      this.animationId = requestAnimationFrame(this.tick);
    }, 50);
  }

  tick = (timeStamp) => {
    const { lastRefresh, requestAnimation, updateFloor } = this.state;
    const { game } = this.props;
    // console.log(timeStamp);
    if ((timeStamp - lastRefresh) >= game.timerInterval) {
      if (updateFloor) drawFloor(game, this.canvasContextMajor);
      this.setState({
        lastRefresh: timeStamp,
        updateFloor: false,
      });
      // can not do moveshape() in setstate callback, will slip, need more investigation
      this.moveShape();
    }
    // recursively call tick if animation state is still on,
    // there maybe a little slippage before it turns off
    if (requestAnimation) this.animationId = requestAnimationFrame(this.tick);
  }

  endTick = (sentBy) => {
    if (process.env.NODE_ENV === 'develpment') console.log(sentBy);
    this.setState({ requestAnimation: false });
    cancelAnimationFrame(this.animationId);
  }

  // get the next shape ypos
  positionForecast = () => {
    const { game } = this.props;
    const copyOfActiveShape = Object.assign({}, game.activeShape);
    copyOfActiveShape.yPosition += game.activeShape.unitBlockSize;
    return copyOfActiveShape;
  }

  newShape = () => {
    // draw next shape on minor and send data of current shape to starttick()
    const { game, actions } = this.props;
    const { randomShape, newShapeName, nextShapeInfo } = tetrisShapes.createNewShape(game);
    actions.nextShape(newShapeName);
    drawNextShape(this.canvasContextMinor, nextShapeInfo, game);
    // prepare activeshape data to send to starttick
    [randomShape.boundingBox, randomShape.absoluteVertices] = tetrisShapes.getDims(randomShape);
    const locatedShape = shapeLocator(
      this.canvasContextMajor,
      game.canvas.canvasMajor.width,
      game.canvas.canvasMajor.height,
      randomShape, false,
    );
    const data = {
      activeShape: locatedShape,
      rubble: game.rubble,
    };
    return data;
  }

  moveShape = (newPosition = this.positionForecast()) => drawScreen(
    newPosition,
    this.canvasContextMajor,
    this.endTick,
    this.startTick,
    this.gameOver,
  );

  /* Handle Player Events Below */
  handlePause = () => {
    const { buttonPause } = this.state;
    const { actions, game } = this.props;
    this.setState(prevState => ({ buttonPause: !prevState.buttonPause }));
    this.canvasMajor.current.focus();
    actions.pause(!buttonPause);
    if (game.paused) {
      // test if a new game or within a game
      if (game.activeShape.cells.length) this.startTick(false);
      else this.resetBoard();
    } else this.endTick('Manual Pause');
  }

  floorRaise = (f) => {
    const { game, actions } = this.props;
    // Locate Shape on screen and then set .cell prop of activeShape
    const locatedShape = shapeLocator(
      this.canvasContextMajor,
      game.canvas.canvasMajor.width,
      game.canvas.canvasMajor.height,
      this.positionForecast(),
      false,
    );
    const newFloor = getFloorRaiseBoundry(game.rubble, f);
    const collisionResult = runCollisionTest(game, locatedShape, newFloor);
    this.canvasMajor.current.focus();
    if (collisionResult) {
      // right now can not raise floor and collide simultaneously
      console.log('Unable to move floor', collisionResult);
    } else {
      actions.raiseFloor(game.rubble, f);
    }
  }

  gamePlay = (e) => {
    const { game } = this.props;
    const ans = (playerMoves(e, game, this.canvasContextMajor));
    if (ans) {
      if (ans === 'forcedown') {
        this.endTick('Down Key');
        this.moveShape();
      } else {
        this.moveShape(ans);
      }
    }
  }

  arrowKeyLag = e => (e.keyCode === 40 ? this.startTick(false) : null);

  /* opponent component Callbacks */
  handleMultiplayer = () => {
    const { user } = this.props;
    const { multiPlayer } = this.state;

    if (user.profile.authenticated) {
      clearCanvas(this.canvasContextMajor, 'All', 'Multi');
      clearCanvas(this.canvasContextMinor, 'All', 'Multi');
      this.setState({
        multiPlayer: !multiPlayer,
      }, () => this.resetBoard(false));
    }
  }

  gameOver = (opponentInfo = null) => {
    const { multiPlayer } = this.state;
    const { game, user, socket } = this.props;
    // Whoever looses first will emit game over while in multiplayer mode
    if (multiPlayer && socket.temp.gameInProgress) {
      clientEmitter(GAME_OVER, socket);
      this.looserAudio.current.play();
    }
    // disregard first local loss signal in multiplayer as another one will come from socket
    if (multiPlayer && !opponentInfo) return;

    const opponent = opponentInfo
      ? processMatch(opponentInfo[0], this.state, this.props, this.winnerAudio)
      : processSinglePlayer({ game, user });

    this.setState({
      buttonPause: true,
    }, () => this.resetBoard(
      false, false, true, opponent,
    ));
  }

  checkWindowSize = () => {
    const { multiPlayer } = this.state;
    const minHeight = 750;
    const minWidthSP = 585;
    const minWidthMP = 800;
    if (
      (multiPlayer && window.innerWidth < minWidthMP)
        || (!multiPlayer && window.innerWidth < minWidthSP)
        || (window.innerHeight < minHeight)
    ) this.setState({ windowTooSmall: true });
    else this.setState({ windowTooSmall: null }, () => this.loadCanvas());
  }

  render() {
    const { game, socket } = this.props;
    const {
      difficulty, multiPlayer, inGameToggle,
      buttonPause, floorsRaised, windowTooSmall,
    } = this.state;
    if (Object.keys(game).length && !windowTooSmall) {
      return (
        <div className="democontainer">
          <Controls
            minorCanvas={this.canvasMinor}
            game={game}
            difficulty={difficulty}
            socketId={socket.mySocketId}
            multiPlayer={[multiPlayer, inGameToggle]}
            pauseButtonState={buttonPause}
            onReset={b => this.resetBoard(b)}
            onhandlePause={() => this.handlePause}
            onFloorRaise={() => this.floorRaise(1)}
            onMultiPlayer={() => this.handleMultiplayer}
            allowMultiPlayer={Boolean(Object.keys(socket).length) && socket.usersLoggedIn > 1}
          />
          <canvas
            ref={this.canvasMajor}
            width={game.canvas.canvasMajor.width}
            height={game.canvas.canvasMajor.height}
            tabIndex="0"
            onKeyDown={e => this.gamePlay(e)}
            onKeyUp={e => this.arrowKeyLag(e)}
          />
          {multiPlayer
            ? (
              <Opponent
                onReset={reStart => this.resetBoard(reStart)}
                onFloorRaise={f => this.floorRaise(f)}
                onGameOver={msg => this.gameOver(msg)}
                onCanvasFocus={() => this.canvasMajor.current.focus()}
                onSetDifficulty={d => this.setState({ difficulty: d })}
                toggleMultiplayer={() => this.setState({ inGameToggle: !inGameToggle })}
                difficulty={difficulty}
                floorsRaisedOnOpp={f => this.setState({ floorsRaised: floorsRaised + f })}
              />
            )
            : null
          }
          <audio ref={this.winnerAudio} src={winnerSoundFile}>
            <track kind="captions" />
          </audio>
          <audio ref={this.looserAudio} src={looserSoundFile}>
            <track kind="captions" />
          </audio>
        </div>
      );
    }
    if (windowTooSmall) return <div id="smallwindow" />;
    return null;
  }

}

Game.defaultProps = {
  actions: {},
  game: {},
  user: {},
  socket: {},
};

Game.propTypes = {
  actions: PropTypes.shape({
    gameReset: PropTypes.func,
    nextShape: PropTypes.func,
    updateScreen: PropTypes.func,
    raiseFloor: PropTypes.func,
    collide: PropTypes.func,
    speedUp: PropTypes.func,
    pause: PropTypes.func,
  }),
  game: PropTypes.objectOf(PropTypes.any),
  user: PropTypes.objectOf(PropTypes.any),
  socket: PropTypes.objectOf(PropTypes.any),
};
export default connect(mapStateToProps, mapDispatchToProps)(Game);
