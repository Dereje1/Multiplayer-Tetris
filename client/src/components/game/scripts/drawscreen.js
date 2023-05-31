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

  if (collisionResult) {
    if (collisionResult === 'game over') {
      endTick('collision check - Game Over');
      return gameOver();
    }
    const { winRows, ...rest } = collisionResult
    // collision detected
    // end tick to perform collision
    const debug = winRows ? 'collision check - Win' : 'collision check - No Win';
    endTick(debug);
    // update redux with collision
    collide(rest);
    if (winRows) { // winner found
      // audio
      if (winRows.length === 4) audio.maxLinesCleared();
      else audio.lineCleared();
      // animation timeout
      winRubble(canvasContextMajor, game, winRows);
      const inter = setTimeout(() => {
        startTick();
        clearTimeout(inter);
      }, 250);
    } else { // no winner found/plain collision
      startTick();
    }
    return null;
  }
  /*  no collision is found, just do a screen refresh */
  const screenRefreshData = {
    ...game,
    activeShape: shapeToDraw,
    paused: false,
  };
  updateScreen(screenRefreshData);
  return refreshCanvas(canvasContextMajor, screenRefreshData);
};

export default drawScreen;
