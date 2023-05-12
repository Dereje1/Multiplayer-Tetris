// utility that checks for collision and refreshses screen data
// custom functions
import { runCollisionTest } from './collision';
import {
  refreshCanvas,
  winRubble,
} from './canvas';

const drawScreen = ({
  updatedShape,
  canvasContextMajor,
  endTick,
  startTick,
  gameOver,
  redux,
  audio,
}) => {
  const { game, collide, updateScreen } = redux;
  const shapeToDraw = { ...updatedShape };

  // test for collision
  const collisionResult = runCollisionTest(game, shapeToDraw);
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
    if (collisionResult[1]) { // winner found
      // audio
      if (collisionResult[1].length === 4) audio.maxLinesCleared();
      else audio.lineCleared();
      // animation timeout
      winRubble(canvasContextMajor, game, collisionResult[1]);
      const inter = setTimeout(() => {
        startTick();
        clearTimeout(inter);
      }, 250);
    } else { // no winner found
      startTick();
    }
    return null;
  }
  /*  no collision is found, just do a screen refresh */
  const screenRefreshData = {
    activeShape: shapeToDraw,
    rubble: {
      ...game.rubble,
      winRows: null // need to reset back to null incase of previous win
    },
    floor: {
      ...game.floor,
    },
    paused: false,
  };
  updateScreen(screenRefreshData);
  return refreshCanvas(canvasContextMajor, screenRefreshData);
};

export default drawScreen;
