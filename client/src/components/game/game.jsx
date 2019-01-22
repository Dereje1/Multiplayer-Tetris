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
  clearCanvas, drawShape, drawRubble,
  winRubble, drawNextShape, drawBoundary,
} from './scripts/canvas';
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
      // opponentSocketId: '', // commented out for single player
    };
    this.canvasMajor = React.createRef();
    this.canvasMinor = React.createRef();
  }

  componentDidMount() {
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

  resetBoard =async (reStart = true, keepFloor = false) => {
    const { game, actions } = this.props;
    const floorHeight = game.rubble && keepFloor ? game.rubble.boundaryCells.length / 10 : 1;
    await actions.gameReset(floorHeight);
    const canvasMajor = this.canvasMajor.current;
    const canvasMinor = this.canvasMinor.current;
    if (canvasMajor) {
      canvasMajor.focus();
      canvasMajor.style.backgroundColor = 'black';
      canvasMinor.style.backgroundColor = 'black';
      // setting context so it can be accesible everywhere in the class , maybe a better way ?
      this.canvasContextMajor = canvasMajor.getContext('2d');
      this.canvasContextMinor = canvasMinor.getContext('2d');
      if (this.downInterval) this.endTick(false, 'reset Board');
    }
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
    const { game } = this.props;
    this.abortCounter = 0;
    if (!this.tickCounter && this.tickCounter !== 0) this.tickCounter = 0;
    if (this.downInterval)clearInterval(this.downInterval);
    if (makeNewShape) this.newShape();
    this.downInterval = setInterval(() => {
      this.tickCounter = this.tickCounter + 1;
      if (this.tickCounter === 4) {
        this.tickCounter = 0;
        this.floorRaise(1);
      }
      this.tick();
    }, game.timerInterval);
  }

  tick = () => {
    const { game: { paused } } = this.props;
    if (paused) return;
    // handle y direction movements
    this.drawScreen(this.positionForecast());
  }

  endTick = async (gameOver, comments) => {
    const { actions } = this.props;
    this.abortCounter += 1;
    console.log(`Called by ${comments} , attempts = ${this.abortCounter}`);
    if (this.downInterval) {
      clearInterval(this.downInterval);
      await actions.pause(true);
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

  speedUp = async () => {
    const { actions } = this.props;
    await actions.speedUp();
  }

  newShape = async () => {
    const { game, actions } = this.props;
    const randomShape = game.nextShape
      ? this.initializeShape(game.nextShape)
      : this.initializeShape(tetrisShapes.getRandShapeName());
    const newShapeName = tetrisShapes.getRandShapeName();
    const nextShapeInfo = this.initializeShape(newShapeName);
    await actions.nextShape(newShapeName);
    drawNextShape(this.canvasContextMinor, nextShapeInfo, game);
    this.drawScreen(randomShape);
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

  drawFloor = async () => {
    const { game } = this.props;
    drawBoundary(this.canvasContextMajor, game);
    drawRubble(this.canvasContextMajor, game);
    this.setState({ floor: false });
  }

  drawScreen = async (updatedShape) => {
    const { game, actions } = this.props;
    const { floor } = this.state;
    const shapeToDraw = updatedShape;
    [shapeToDraw.boundingBox, shapeToDraw.absoluteVertices] = tetrisShapes.getDims(updatedShape);

    const copyOfRubble = Object.assign({}, game.rubble);
    copyOfRubble.winRows = null; // need to reset back to null incase of previous win

    // Locate Shape on screen and then set .cell prop of activeShape
    const locatedShape = shapeLocator(
      this.canvasContextMajor,
      game.canvas.canvasMajor.width,
      game.canvas.canvasMajor.height,
      shapeToDraw, false,
    );

    // test for collision
    const collisionResult = runCollisionTest(game, locatedShape);
    if (collisionResult && !collisionResult.length) {
      this.endTick(true, 'collision check - game done');
      // By Nature of the game, looser is the one that will send this signal
      /* commented out for single player
      if (this.state.multiPlayer && this.state.opponentSocketId) {
        this.setState({
          opponentSocketId: '',
          selfSocketId: '',
        }, () => socket.emit('GAME_OVER', ''));
        return;
      }
      */
      this.gameOver();
    } else if (collisionResult && collisionResult.length) {
      if (collisionResult[1]) { // winner found
        // end tick to play animation and start tick back after animation is over
        this.endTick(false, 'collision check - Win');
        winRubble(
          this.canvasContextMajor,
          game,
          collisionResult[1],
        );
        await actions.collide(collisionResult[0]);
        const inter = setTimeout(() => {
          // redux store update not taking effect in upper scope of game def.
          // eslint-disable-next-line react/destructuring-assignment
          drawRubble(this.canvasContextMajor, this.props.game);
          this.startTick();
          clearInterval(inter);
        }, 250);
      } else { // no winner found just set state with current rubble
        this.endTick(false, 'collision check - No Win');
        await actions.collide(collisionResult[0]);
        // eslint-disable-next-line react/destructuring-assignment
        drawRubble(this.canvasContextMajor, this.props.game);
        this.startTick();
      }
    } else {
      /*  no collision is found, do this */
      const data = {
        activeShape: locatedShape,
        rubble: copyOfRubble,
        paused: false,
      };
      await actions.updateScreen(data);
      if (floor) await this.drawFloor();
      drawShape(this.canvasContextMajor, locatedShape, game);
    }
    // if (this.state.multiPlayer) socket.emit(SIMULATE_GAMEPLAY, JSON.stringify(this.props.game));
    /* commented out for single player
    if (this.state.opponentSocketId) {
      socket.emit(
        SIMULATE_GAMEPLAY,
        { gameState: JSON.stringify(this.props.game), socketId: this.state.opponentSocketId },
      );
    }
    */
  }

  /* Handle Player Events Below */
  handlePause = async (val) => {
    this.setState(prevState => ({ buttonPause: !prevState.buttonPause }));
    const { game, actions } = this.props;
    const toDO = typeof (val) === 'object' ? !game.paused : val;
    this.canvasMajor.current.focus();
    await actions.pause(toDO);
    if (!game.activeShape.boundingBox.length) this.resetBoard(true, true);
  }

  floorRaise = async (f) => {
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
      await actions.raiseFloor(game.rubble, f);
      if (game.paused) {
        await this.drawFloor();
      } else this.setState({ floor: true });
      // if (game.activeShape.boundingBox.length) this.startTick(false);
    }
  }

  gamePlay = (e) => {
    const { game } = this.props;
    const ans = (playerMoves(e, game, this.canvasContextMajor));
    if (ans) {
      if (ans === 'tick') {
        this.endTick(false, 'Down Key');
        this.tick();
      } else this.drawScreen(ans);
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

  gameOver = async (multiPlayerData) => {
    if (multiPlayerData) console.log('Do nothing Till db setup');
    /* commented out for single player
    if (this.state.multiPlayer && multiPlayerData) {
      await upDatedb({ match: multiPlayerData });
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
      await upDatedb({ match: databaseEntry });
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
