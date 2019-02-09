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

// custom functions and scripts
import tetrisShapes from './scripts/shapes';
import shapeLocator from './scripts/locateShape';
import { runCollisionTest } from './scripts/collision';
import {
  clearCanvas, drawRubble, drawNextShape, drawBoundary, drawGameOver,
} from './scripts/canvas';
import drawScreen from './scripts/drawscreen';
import playerMoves from './scripts/player';
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
    };
    this.canvasMajor = React.createRef();
    this.canvasMinor = React.createRef();
  }

  componentDidMount() {
    const { actions } = this.props;
    actions.gameReset(1); // initialize canvas width/height
    this.checkWindowSize();
    window.addEventListener('resize', () => this.checkWindowSize());
  }

  componentDidUpdate(prevProps) {
    // all optimizations go here
    if (!Object.keys(prevProps.game).length) return;
    const { game: prevGame, socket: prevSocket } = prevProps;
    const { game, socket } = this.props;
    const { multiPlayer, canvasLoaded, windowTooSmall } = this.state;
    if (windowTooSmall) return;

    /* load Canvas */
    if (!canvasLoaded && this.canvasMajor) this.loadCanvas();

    /* spped up on level up */
    if ((game.points.level !== prevGame.points.level)
          && (game.timerInterval > 250)
          && (!multiPlayer)
    ) this.speedUp();

    /* draws floor or sets state to do so before the next tick */
    if (game.rubble.boundaryCells.length > 10
       && prevGame.rubble.boundaryCells.length !== game.rubble.boundaryCells.length) {
      if (!game.activeShape.cells.length) this.drawFloor();
      else this.setState({ updateFloor: true });
    }

    /* an Invitation from another client */
    if (!multiPlayer && socket.temp) {
      if (!prevSocket.temp && socket.temp.invitationFrom) this.setState({ multiPlayer: true });
    }
  }

  componentWillUnmount() {
    this.endTick(true, 'componentWillUnmount');
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
    if (this.downInterval) this.endTick(false, 'reset Board');
    if (reStart) { // fresh game
      this.startTick();
    } else {
      this.setState({
        buttonPause: true,
      }, () => {
        clearCanvas(this.canvasContextMajor, 'All', 'reset'); // clear canvasMajor
        clearCanvas(this.canvasContextMinor, 'All', 'reset'); // clear canvasMajor
      });
    }
  }

  startTick = (makeNewShape = true) => {
    this.abortCounter = 0;
    if (this.downInterval)clearInterval(this.downInterval);
    if (makeNewShape) this.newShape();
    this.downInterval = setInterval(() => {
      const { updateFloor } = this.state;
      // eslint-disable-next-line react/destructuring-assignment
      if (this.props.game.paused) clearInterval(this.downInterval);
      if (updateFloor) { // drawFloor needs to happen before tick
        this.drawFloor();
        this.setState({ updateFloor: false }, () => this.tick());
      } else this.tick();
    // eslint-disable-next-line react/destructuring-assignment
    }, this.props.game.timerInterval);
  }

  tick = () => {
    const { game: { paused } } = this.props;
    if (paused) return;
    // test for collision or free fall happens below
    drawScreen(
      this.positionForecast(),
      this.canvasContextMajor,
      this.endTick,
      this.startTick,
      this.gameOver,
    );
  }

  endTick = (gameOver, comments) => {
    const { actions } = this.props;
    this.abortCounter += 1;
    console.log(`Called by ${comments} , attempts = ${this.abortCounter}`);
    if (this.downInterval) {
      clearInterval(this.downInterval);
      actions.pause(true);
      if (gameOver) {
        clearCanvas(this.canvasContextMajor, 'All', 'gameover');
      }
    }
  }

  // get the next shape ypos
  positionForecast = () => {
    const { game } = this.props;
    const copyOfActiveShape = Object.assign({}, game.activeShape);
    copyOfActiveShape.yPosition += game.activeShape.unitBlockSize;
    return copyOfActiveShape;
  }

  speedUp = () => {
    const { actions } = this.props;
    actions.speedUp();
  }

  newShape = () => {
    const { game, actions } = this.props;
    const randomShape = game.nextShape
      ? this.initializeShape(game.nextShape)
      : this.initializeShape(tetrisShapes.getRandShapeName());
    const newShapeName = tetrisShapes.getRandShapeName();
    const nextShapeInfo = this.initializeShape(newShapeName);
    actions.nextShape(newShapeName);
    drawNextShape(this.canvasContextMinor, nextShapeInfo, game);
    drawScreen(
      randomShape,
      this.canvasContextMajor,
      this.endTick,
      this.startTick,
      this.gameOver,
    );
  }

  initializeShape = (shapeName) => {
    const { game } = this.props;
    // finding intital y bound so it does not get cutoff
    const x = (shapeName !== 'shapeI' && shapeName !== 'shapeO')
      ? (game.canvas.canvasMajor.width / 2)
      + (game.activeShape.unitBlockSize / 2)
      : game.canvas.canvasMajor.width / 2;

    const initialAbsoluteVertices = tetrisShapes.getAbsoluteVertices(
      game.activeShape.unitBlockSize,
      x,
      0,
      tetrisShapes[shapeName].vertices,
    );

    const initialBoundingBox = tetrisShapes.onBoundingBox(initialAbsoluteVertices);
    const activeShape = {
      name: shapeName,
      unitBlockSize: 30,
      xPosition: x,
      yPosition: -1 * initialBoundingBox[2],
      unitVertices: tetrisShapes[shapeName].vertices,
      absoluteVertices: initialAbsoluteVertices,
      boundingBox: initialBoundingBox,
      rotationStage: 0,
      cells: [],
    };
    return activeShape;
  }

  drawFloor = () => {
    const { game } = this.props;
    drawBoundary(this.canvasContextMajor, game);
    drawRubble(this.canvasContextMajor, game);
  }

  /* Handle Player Events Below */
  handlePause = (val) => {
    this.setState(prevState => ({ buttonPause: !prevState.buttonPause }));
    const { game, actions } = this.props;
    const toDO = typeof (val) === 'object' ? !game.paused : val;
    this.canvasMajor.current.focus();
    actions.pause(toDO);
    if (!toDO) this.startTick(false);
    if (!game.activeShape.boundingBox.length) this.resetBoard(true, true);
  }

  floorRaise = (f) => {
    const { game, actions } = this.props;
    // Locate Shape on screen and then set .cell prop of activeShape
    const locatedShape = shapeLocator(
      this.canvasContextMajor,
      game.canvas.canvasMajor.width,
      game.canvas.canvasMajor.height,
      this.positionForecast(), false,
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
      if (ans === 'tick') {
        this.endTick(false, 'Down Key');
        this.tick();
      } else {
        drawScreen(
          ans,
          this.canvasContextMajor,
          this.endTick,
          this.startTick,
          this.gameOver,
        );
      }
    }
  }

  arrowKeyLag = (e) => {
    if (e.keyCode === 40) {
      this.startTick(false);
    }
  }

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

  gameOver = (message = null) => {
    const { multiPlayer, floorsRaised } = this.state;
    const { socket } = this.props;
    if (multiPlayer && socket.temp.gameInProgress) {
      clientEmitter(GAME_OVER, socket);
    }
    // disregard first local loss signal in multiplayer as another one will come from socket
    if (multiPlayer && !message) return;
    let multiplayerMessage;
    if (message && message.disqualified) {
      multiplayerMessage = { message: message.message, floors: 'Opponent \n Disqualified' };
    } else multiplayerMessage = message ? { message, floors: `        ${floorsRaised} Floors Raised` } : null;
    this.setState({
      buttonPause: true,
    }, () => this.resetBoard(false, false, true, multiplayerMessage));
  }

  checkWindowSize = () => {
    const { multiPlayer } = this.state;
    const minHeight = 800;
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
      difficulty, multiPlayer, inGameToggle, buttonPause, floorsRaised, windowTooSmall,
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
