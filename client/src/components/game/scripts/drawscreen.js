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
    if (collisionResult[1]) { // winner found
      // end tick to play animation and start tick back after animation is over
      endTick('collision check - Win');
      winRubble(
        canvasContextMajor,
        game,
        collisionResult[1],
      );
      collide(collisionResult[0]);
      const collisionData = {
        activeShape: locatedShape,
        rubble: collisionResult[0].rubble,
      };
      const inter = setTimeout(() => {
        drawRubble(canvasContextMajor, collisionData);
        startTick();
        clearTimeout(inter);
      }, 250);
    } else { // no winner found just set state with current rubble
      endTick('collision check - No Win');
      collide(collisionResult[0]);
      const collisionData = {
        activeShape: locatedShape,
        rubble: collisionResult[0].rubble,
      };
      drawRubble(canvasContextMajor, collisionData);
      startTick();
    }
  } else {
    /*  no collision is found, just do a screen refresh */
    const screenRefreshData = {
      activeShape: locatedShape,
      rubble: copyOfRubble,
      paused: false,
    };
    updateScreen(screenRefreshData);
    drawShape(canvasContextMajor, screenRefreshData);
  }
  return null;
};

export default drawScreen;
