import React from 'react';
import PropTypes from 'prop-types';
import './game.css';

// import { socket } from '../../Actions/socket';
// import { SIMULATE_GAMEPLAY } from '../../constants';
// connect to redux and get action creators
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  gameReset, nextShape, updateScreen, raiseFloor,
  collide, speedUp, pause, getFloorRaiseBoundry,
} from '../../redux/actions/tetris';

// custom functions
import tetrisShapes from './scripts/shapes';
import shapeLocator from './scripts/locateShape';
import { runCollisionTest } from './scripts/collision';
import {
  clearCanvas, drawRubble, drawNextShape, drawBoundary,
} from './scripts/canvas';
import drawScreen from './scripts/drawscreen';
import playerMoves from './scripts/player';
// react Components
import Controls from './controls';
// import Opponent from './opponent';
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

// end redux
class Game extends React.Component {

  constructor(props) {
    super(props);
    this.state = { // holds information that the opponent component uses
      multiPlayer: false,
      disableExit: false,
      difficulty: 2,
      selfSocketId: '',
      buttonPause: true,
      floor: false,
      canvasReady: false,
      // opponentSocketId: '', // commented out for single player
    };
    this.canvasMajor = React.createRef();
    this.canvasMinor = React.createRef();
  }

  componentDidMount() {
    this.loadCanvas();
    this.resetBoard(false);
  }

  componentDidUpdate(prevProps) {
    if (Object.keys(prevProps.game).length) {
      const { game } = this.props;
      const { multiPlayer } = this.state;
      if ((game.points.level !== prevProps.game.points.level)
          && (game.timerInterval > 250)
          && (!multiPlayer)
      ) this.speedUp();
    }
  }

  componentWillUnmount() {
    // socket.emit('disconnect', '');
    // socket.emit('COMPONENT_UNMOUNTED', 'Demo');
    this.endTick(true, 'componentWillUnmount');
  }

  loadCanvas = async () => {
    const { actions } = this.props;
    await actions.gameReset(1); // needed to initialize canvas width/height
    const canvasMajor = this.canvasMajor.current;
    const canvasMinor = this.canvasMinor.current;
    canvasMajor.focus();
    canvasMajor.style.backgroundColor = 'black';
    canvasMinor.style.backgroundColor = 'black';
    // setting context so it can be accesible everywhere in the class , maybe a better way ?
    this.canvasContextMajor = canvasMajor.getContext('2d');
    this.canvasContextMinor = canvasMinor.getContext('2d');
    if (this.canvasMajor.current) this.setState({ canvasReady: true });
  }

  resetBoard = (reStart = true, keepFloor = false) => {
    const { canvasReady } = this.state;
    if (!canvasReady) return;
    const { game, actions } = this.props;
    const floorHeight = game.rubble && keepFloor ? game.rubble.boundaryCells.length / 10 : 1;
    actions.gameReset(floorHeight);
    if (this.downInterval) this.endTick(false, 'reset Board');
    if (reStart) {
      this.startTick();
    } else {
      this.setState({
        multiPlayer: false,
        // opponentSocketId: '', /* comment out for single player */
        selfSocketId: '',
        buttonPause: true,
      }, () => {
        clearCanvas(this.canvasContextMajor, 'All', 'reset'); // clear canvasMajor
        clearCanvas(this.canvasContextMinor, 'All', 'reset'); // clear canvasMajor
      });
    }
  }

  startTick = (makeNewShape = true) => {
    this.abortCounter = 0;
    if (!this.tickCounter && this.tickCounter !== 0) this.tickCounter = 0;
    if (this.downInterval)clearInterval(this.downInterval);
    if (makeNewShape) this.newShape();
    this.downInterval = setInterval(() => {
      console.log('ticking');
      // eslint-disable-next-line react/destructuring-assignment
      if (this.props.game.paused) clearInterval(this.downInterval);
      this.tickCounter = this.tickCounter + 1;
      if (this.tickCounter === 4) {
        this.tickCounter = 0;
        // this.floorRaise(1);
      }
      this.tick();
    // eslint-disable-next-line react/destructuring-assignment
    }, this.props.game.timerInterval);
  }

  tick = () => {
    const { game: { paused } } = this.props;
    const { floor } = this.state;
    if (paused) return;
    // handle y direction movements
    drawScreen(
      this.positionForecast(),
      floor,
      this.canvasContextMajor,
      this.endTick,
      this.startTick,
      this.drawFloor,
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

  positionForecast = () => {
    const { game } = this.props;
    const copyOfActiveShape = Object.assign({}, game.activeShape);
    // console.log(`bbox @ tick ${this.props.game.activeShape.boundingBox}`)
    copyOfActiveShape.yPosition += game.activeShape.unitBlockSize;
    return copyOfActiveShape;
  }

  speedUp = () => {
    const { actions } = this.props;
    actions.speedUp();
  }

  newShape = () => {
    const { game, actions } = this.props;
    const { floor } = this.state;
    const randomShape = game.nextShape
      ? this.initializeShape(game.nextShape)
      : this.initializeShape(tetrisShapes.getRandShapeName());
    const newShapeName = tetrisShapes.getRandShapeName();
    const nextShapeInfo = this.initializeShape(newShapeName);
    actions.nextShape(newShapeName);
    drawNextShape(this.canvasContextMinor, nextShapeInfo, game);
    drawScreen(
      randomShape,
      floor,
      this.canvasContextMajor,
      this.endTick,
      this.startTick,
      this.drawFloor,
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
    this.setState({ floor: false });
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
      console.log('Unable to move floor', collisionResult);
    } else {
      actions.raiseFloor(game.rubble, f);
      if (game.paused) {
        this.drawFloor();
      } else this.setState({ floor: true });
      // if (game.activeShape.boundingBox.length) this.startTick(false);
    }
  }

  gamePlay = (e) => {
    const { game } = this.props;
    const { floor } = this.state;
    const ans = (playerMoves(e, game, this.canvasContextMajor));
    if (ans) {
      if (ans === 'tick') {
        this.endTick(false, 'Down Key');
        this.tick();
      } else {
        drawScreen(
          ans,
          floor,
          this.canvasContextMajor,
          this.endTick,
          this.startTick,
          this.drawFloor,
          this.gameOver,
        );
      }
    }
  }

  arrowKeyLag = (e) => {
    if (e.keyCode === 40) this.startTick(false);
  }

  /* opponent component Callbacks */
  handleMultiplayer = () => {
    const { user } = this.props;
    if (user.profile.authenticated) {
      clearCanvas(this.canvasContextMajor, 'All', 'Multi'); // clear canvasMajor
      clearCanvas(this.canvasContextMinor, 'All', 'Multi'); // clear canvasMajor
      this.setState({
        multiPlayer: false, /* static false for single player */
      }, () => this.resetBoard(false));// don't forget to add reset board call back here
    } else {
      window.location = '/test';
    }
  }

  /* commented out for single player
  gameEmit = ({ self, opponnent }) => {
    this.setState({
      selfSocketId: self,
      opponentSocketId: opponnent.socketId,
    }, () => this.resetBoard());
  }
 */

  gameOver = (multiPlayerData) => {
    if (multiPlayerData) console.log('Do nothing Till db setup');
    /* commented out for single player
    if (this.state.multiPlayer && multiPlayerData) {
       upDatedb({ match: multiPlayerData });
    } else if (!this.state.multiPlayer && this.props.user.authenticated) {
      const databaseEntry =
        {
          multiPlayer: false,
          players: [
            {
              name: this.props.user.displayName,
              _id: this.props.user._id,
              score: this.props.game.points.totalLinesCleared * 50,
            },
          ],
        };
       upDatedb({ match: databaseEntry });
    }
    */
    this.setState({
      multiPlayer: false,
      // opponentSocketId: '', /* comment out for single player */
      selfSocketId: '',
      buttonPause: true,
    }, () => this.resetBoard(false));
  }

  render() {
    const { game } = this.props;
    const {
      difficulty, selfSocketId, multiPlayer, disableExit, buttonPause,
    } = this.state;
    if (Object.keys(game).length) {
      return (
        <div className="democontainer">
          <Controls
            minorCanvas={this.canvasMinor}
            game={game}
            difficulty={difficulty}
            socketId={selfSocketId}
            multiPlayer={[multiPlayer, disableExit]}
            pauseButtonState={buttonPause}
            onReset={b => this.resetBoard(b)}
            onhandlePause={() => this.handlePause}
            onFloorRaise={() => this.floorRaise()}
            onMultiPlayer={() => this.handleMultiplayer}
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
              /* comment out for single player
              <Opponent
                onReset={reStart => this.resetBoard(reStart)}
                onGameEmit={socketInfo => this.gameEmit(socketInfo)}
                onFloorRaise={f => this.floorRaise(f)}
                onGameOver={db => this.gameOver(db)}
                onPause={() => this.handlePause(true)}
                onClearCanvas={() => clearCanvas(this.canvasContextMajor, this.props.game)}
                onSetDifficulty={d => this.setState({ difficulty: d })}
                onGetSocketId={sId => this.setState({ selfSocketId: sId })}
                onDisableExit={setTo => this.setState({ disableExit: setTo })}
                difficulty={this.state.difficulty}
              />
              */
              null
            )
            : null
          }
        </div>
      );
    }

    return null;
  }

}

Game.defaultProps = {
  actions: {},
  game: {},
  user: {},
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
};
export default connect(mapStateToProps, mapDispatchToProps)(Game);
