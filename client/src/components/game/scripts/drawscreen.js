// utility that checks for collision and refreshses screen data
import store from '../../../redux/store';
import {
  updateScreen, collide,
} from '../../../redux/actions/tetris';

// custom functions
import tetrisShapes from './shapes';
import shapeLocator from './locateShape';
import { runCollisionTest } from './collision';
import {
  drawShape, drawRubble,
  winRubble,
} from './canvas';

const drawScreen = (
  updatedShape,
  canvasContextMajor,
  endTick,
  startTick,
  gameOver,
) => {
  const { game } = store.getState();
  const shapeToDraw = updatedShape;
  [shapeToDraw.boundingBox, shapeToDraw.absoluteVertices] = tetrisShapes.getDims(updatedShape);

  const copyOfRubble = Object.assign({}, game.rubble);
  copyOfRubble.winRows = null; // need to reset back to null incase of previous win

  // Locate Shape on screen and then set .cell prop of activeShape
  const locatedShape = shapeLocator(
    canvasContextMajor,
    game.canvas.canvasMajor.width,
    game.canvas.canvasMajor.height,
    shapeToDraw, false,
  );

  // test for collision
  const collisionResult = runCollisionTest(game, locatedShape);
  if (collisionResult && !collisionResult.length) {
    endTick(true, 'collision check - game done');
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
    return gameOver();
  } if (collisionResult && collisionResult.length) {
    if (collisionResult[1]) { // winner found
      // end tick to play animation and start tick back after animation is over
      endTick(false, 'collision check - Win');
      winRubble(
        canvasContextMajor,
        game,
        collisionResult[1],
      );
      store.dispatch(collide(collisionResult[0]));
      const inter = setTimeout(() => {
        // redux store update not taking effect in upper scope of game def.
        drawRubble(canvasContextMajor, store.getState().game);
        startTick();
        clearInterval(inter);
      }, 250);
    } else { // no winner found just set state with current rubble
      endTick(false, 'collision check - No Win');
      store.dispatch(collide(collisionResult[0]));
      drawRubble(canvasContextMajor, store.getState().game);
      startTick();
    }
  } else {
    /*  no collision is found, do this */
    const data = {
      activeShape: locatedShape,
      rubble: copyOfRubble,
      paused: false,
    };
    store.dispatch(updateScreen(data));
    drawShape(canvasContextMajor, locatedShape, store.getState().game);
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
  return null;
};

export default drawScreen;
