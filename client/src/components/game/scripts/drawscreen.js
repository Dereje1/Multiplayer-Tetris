// utility that checks for collision and refreshses screen data
// custom functions
import tetrisShapes from './shapes';
import shapeLocator from './locateShape';
import { runCollisionTest } from './collision';
import {
  drawShape, drawRubble,
  winRubble,
} from './canvas';

const drawScreen = ({
  updatedShape,
  canvasContextMajor,
  endTick,
  startTick,
  gameOver,
  redux,
  lineCleared,
}) => {
  const { game, collide, updateScreen } = redux;
  const shapeToDraw = { ...updatedShape };
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
    endTick('collision check - Game Over');
    return gameOver();
  }
  if (collisionResult && collisionResult.length) {
    // collision detected
    // end tick to perform collision
    const debug = collisionResult[1] ? 'collision check - Win' : 'collision check - No Win';
    endTick(debug);
    // update redux with collision
    collide(collisionResult[0]);
    const collisionData = {
      activeShape: locatedShape,
      rubble: collisionResult[0].rubble,
    };
    if (collisionResult[1]) { // winner found
      lineCleared(); // audio
      // animation timeout
      winRubble(canvasContextMajor, game, collisionResult[1]);
      const inter = setTimeout(() => {
        drawRubble(canvasContextMajor, collisionData);
        startTick();
        clearTimeout(inter);
      }, 250);
    } else { // no winner found
      drawRubble(canvasContextMajor, collisionData);
      startTick();
    }
    return null;
  }
  /*  no collision is found, just do a screen refresh */
  const screenRefreshData = {
    activeShape: locatedShape,
    rubble: copyOfRubble,
    paused: false,
  };
  updateScreen(screenRefreshData);
  return drawShape(canvasContextMajor, screenRefreshData);
};

export default drawScreen;
