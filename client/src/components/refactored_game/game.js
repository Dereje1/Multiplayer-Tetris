import React from 'react';
import PropTypes from 'prop-types';

import './styles/game.scss';
// connect to redux and get action creators
import { connect } from 'react-redux';
import {
  getFloorRaiseBoundry, GameActions,
} from '../../redux/actions/tetris';
import { Audio, audioTypes } from './audio';
// custom functions and scripts
import boardReset from './scripts/boardreset';
import tetrisShapes from './scripts/shapes';
import { runCollisionTest } from './scripts/collision';
import {
  clearCanvas, drawNextShape, drawFloor
} from './scripts/canvas';
import drawScreen from './scripts/drawscreen';
import playerMoves from './scripts/player';
import { processMatch, processSinglePlayer } from './scripts/dbinteraction';
// custom react Components
import Controls from '../controls/controls';
import Opponent from '../oponnent/opponent';
// socket
import { socket as socketConstants, game as gameConstants } from '../../constants/index';
import { clientEmitter } from '../../sockethandler';

const {
  clientEmit: {
    GAME_OVER,
  },
} = socketConstants; // the only emit component makes

const {
  PAUSE, LEVEL_UP, SET_NEXT_SHAPE, SCREEN_UPDATE, COLLISION, INITIALIZE_GAME, RAISE_FLOOR,
} = gameConstants;

// reads from store
const mapStateToProps = state => state;

const actionCreators = {
  GameActions,
};
export class Game extends React.Component {

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
      requestAnimation: true, // used a switch to turn animation off/on,
      mute: false
    };
    this.canvasMajor = React.createRef();
    this.canvasMinor = React.createRef();
    this.lastRefresh = 0; // animation last refresh
    Object.keys(audioTypes).forEach(audio => (this[audio] = React.createRef()));
  }

  componentDidMount() {
    const { GameActions, socket } = this.props;
    GameActions(INITIALIZE_GAME, 1, true);
    this.checkWindowSize();
    window.addEventListener('resize', () => this.checkWindowSize());
    if (socket.temp && socket.temp.invitationFrom) this.setState({ multiPlayer: true });
  }

  componentDidUpdate(prevProps) {
    // all optimizations go here
    if (!Object.keys(prevProps.game).length) return;
    const { game: prevGame, socket: prevSocket } = prevProps;
    const { game, socket, GameActions } = this.props;
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
    ) {
      GameActions(LEVEL_UP, 50);
    }

    /* draws floor or sets state to do so before the next tick */
    if (game.rubble.boundaryCells && game.rubble.boundaryCells.length > 10
      && prevGame.rubble.boundaryCells.length !== game.rubble.boundaryCells.length) {
      if (!game.activeShape.cells.length || game.paused) drawFloor(game, this.canvasContextMajor);
      else this.setState({ updateFloor: true });
    }

    /* an Invitation from another client has been accepted */
    if (!multiPlayer && socket.temp) {
      if (prevSocket.temp && !prevSocket.temp.acceptedInvitation
        && socket.temp.acceptedInvitation) {
        this.setState({ multiPlayer: true }, () => this.resetBoard({ reStart: false }));
      }
    }
    /* Opponent has unmounted after accepting invitation but no game started */
    if (prevSocket && prevSocket.temp && !socket.temp) {
      this.setState({ multiPlayer: false }, () => this.resetBoard({ reStart: false }));
    }
  }

  componentWillUnmount() {
    this.endTick('componentWillUnmount');
    window.removeEventListener('resize', () => { });
  }

  audioProps = () => {
    const props = {};
    Object.keys(audioTypes).forEach((audio) => {
      props[audio] = this[audio];
    });
    return props;
  };

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
  };

  resetBoard = (config) => {
    console.log({config})
    const { game, GameActions } = this.props;
    const resetObject = {
      config,
      stateReset: stateItem => this.setState(stateItem),
      redux: { game, gameReset: floorHeight => GameActions(INITIALIZE_GAME, floorHeight, true) },
      classItems: {
        canvasContextMajor: this.canvasContextMajor,
        canvasContextMinor: this.canvasContextMinor,
        animationId: this.animationId,
        endTick: this.endTick,
        startTick: this.startTick,
      },
    };
    boardReset(resetObject);
  };

  startTick = async (makeNewShape = true) => {
    const { GameActions } = this.props;
    if (makeNewShape) {
      const data = this.newShape();
      // unable to update store wwithout async, not sure why ??
      await GameActions(SCREEN_UPDATE, data);
      // eslint-disable-next-line react/destructuring-assignment
    }
    // setTimeout so not too immediately start the animation after new shape
    this.setState({ requestAnimation: true }, () => this.animationId = requestAnimationFrame(this.tick));
  };

  tick = (timeStamp) => {
    const { requestAnimation, updateFloor } = this.state;
    const { game } = this.props;
    // console.log(timeStamp);
    if ((timeStamp - this.lastRefresh) >= game.timerInterval) {
      this.lastRefresh = timeStamp;
      if (updateFloor) {
        this.setState({
          updateFloor: false,
        }, () => drawFloor(game, this.canvasContextMajor));
      };
      this.moveShape();
    }
    // recursively call tick if animation state is still on,
    // there maybe a little slippage before it turns off
    if (requestAnimation) this.animationId = requestAnimationFrame(this.tick);
  };

  endTick = (sentBy) => {
    if (process.env.NODE_ENV === 'development') console.log(sentBy);
    this.setState({ requestAnimation: false });
    cancelAnimationFrame(this.animationId);
  };

  // get the next shape ypos
  positionForecast = () => {
    const { game: { activeShape } } = this.props;
    const newPos = activeShape.indices.map((idx) => idx + 10)
    return {
      ...activeShape,
      indices: newPos
    };
  };

  newShape = () => {
    // draw next shape on minor and send data of current shape to starttick()
    const { game, GameActions } = this.props;
    const { randomShape, newShapeName, nextShapeInfo } = tetrisShapes.createNewShape(game);
    GameActions(SET_NEXT_SHAPE, newShapeName);
    drawNextShape(this.canvasContextMinor, nextShapeInfo, game);
    const data = {
      activeShape: randomShape,
      rubble: game.rubble,
    };
    return data;
  };

  moveShape = (newPosition) => {
    const { game, GameActions } = this.props;
    const { mute } = this.state;
    drawScreen(
      {
        updatedShape: newPosition || this.positionForecast(),
        canvasContextMajor: this.canvasContextMajor,
        endTick: this.endTick,
        startTick: this.startTick,
        gameOver: this.gameOver,
        redux: {
          game,
          collide: data => GameActions(COLLISION, data),
          updateScreen: data => GameActions(SCREEN_UPDATE, data),
        },
        audio: {
          lineCleared: () => !mute && this.clearAudio.current.play(),
          maxLinesCleared: () => !mute && this.maxClearAudio.current.play(),
        },
      },
    );
  };

  /* Handle Player Events Below */
  handlePause = () => {
    const { buttonPause } = this.state;
    const { GameActions, game } = this.props;
    this.setState(prevState => ({ buttonPause: !prevState.buttonPause }));
    this.canvasMajor.current.focus();
    GameActions(PAUSE, !buttonPause);
    if (game.paused) {
      // test if a new game or within a game
      if (game.activeShape.indices.length) this.startTick(false);
      else this.resetBoard({});
    } else this.endTick('Manual Pause');
  };

  floorRaise = (f) => {
    const { game, GameActions } = this.props;
    const { raisedOccupiedCells, floorIndices, floorHeight } = getFloorRaiseBoundry(game, f);
    const collisionResult = runCollisionTest(game, game.activeShape, raisedOccupiedCells);
    this.canvasMajor.current.focus();
    if (collisionResult) {
      // right now can not raise floor and collide simultaneously
      console.log('Unable to move floor', collisionResult);
    } else {
      GameActions(RAISE_FLOOR, game, { raiseBy: f });
      // only manually draw raised floor if game has no active cells
      !game.activeShape.indices.length && drawFloor({
        ...game,
        floor: {
          floorHeight,
          floorIndices
        }
      },
        this.canvasContextMajor
      )
    }
  };

  gamePlay = ({ keyCode }) => {
    const { game } = this.props;
    const ans = playerMoves(keyCode, game, this.canvasContextMajor);
    if (ans) {
      if (ans === 'forcedown') {
        this.endTick('Down Key');
        this.moveShape();
      } else {
        this.moveShape(ans);
      }
    }
  };

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
      }, () => this.resetBoard({ reStart: false }));
    }
  };

  gameOver = async (opponentInfo = null) => {
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
      ? await processMatch(opponentInfo[0], this.state, this.props, this.winnerAudio)
      : await processSinglePlayer({ game, user });

    this.setState({
      buttonPause: true,
    }, () => this.resetBoard({
      reStart: false, keepFloor: false, gameover: true, opponent,
    }));
  };

  checkWindowSize = () => {
    const minHeight = 700;
    const minWidth = 950;
    if ((window.innerWidth < minWidth)
      || (window.innerHeight < minHeight)
    ) this.setState({ windowTooSmall: true });
    else this.setState({ windowTooSmall: null }, () => this.loadCanvas());
  };

  render() {
    const { game, socket } = this.props;
    const {
      difficulty, multiPlayer, inGameToggle,
      buttonPause, floorsRaised, windowTooSmall,
      mute
    } = this.state;
    return (
      <div id="landing">
        {
          Object.keys(game).length && !windowTooSmall ?
            <div className="democontainer">
              <Controls
                minorCanvas={this.canvasMinor}
                game={game}
                difficulty={difficulty}
                socketId={socket.mySocketId}
                multiPlayer={[multiPlayer, inGameToggle]}
                pauseButtonState={buttonPause}
                onReset={b => this.resetBoard({ reStart: b })}
                onhandlePause={() => this.handlePause()}
                onFloorRaise={() => this.floorRaise(1)}
                onMultiPlayer={() => this.handleMultiplayer()}
                allowMultiPlayer={Boolean(Object.keys(socket).length) && socket.usersLoggedIn > 1}
                onMute={() => this.setState({ mute: !mute }, () => this.canvasMajor.current.focus())}
                mute={mute}
              />
              <canvas
                ref={this.canvasMajor}
                width={game.canvas.canvasMajor.width}
                height={game.canvas.canvasMajor.height}
                tabIndex="0"
                onKeyDown={e => this.gamePlay(e)}
                onKeyUp={e => this.arrowKeyLag(e)}
              />

              <Opponent
                onReset={reStart => this.resetBoard(reStart)}
                onFloorRaise={f => this.floorRaise(f)}
                onGameOver={msg => this.gameOver(msg)}
                onCanvasFocus={() => this.canvasMajor.current.focus()}
                onSetDifficulty={d => this.setState({ difficulty: d })}
                toggleMultiplayer={() => this.setState({ inGameToggle: !inGameToggle })}
                difficulty={difficulty}
                floorsRaisedOnOpp={f => this.setState({ floorsRaised: floorsRaised + f })}
                multiPlayer={multiPlayer}
              />

              <Audio {...this.audioProps()} />
            </div>
            :
            <div id="smallwindow" />
        }
      </div>
    )
  }
}

Game.defaultProps = {
  game: {},
  user: {},
  socket: {},
};

Game.propTypes = {
  GameActions: PropTypes.func.isRequired,
  game: PropTypes.objectOf(PropTypes.any),
  user: PropTypes.objectOf(PropTypes.any),
  socket: PropTypes.objectOf(PropTypes.any),
};
export default connect(mapStateToProps, actionCreators)(Game);
