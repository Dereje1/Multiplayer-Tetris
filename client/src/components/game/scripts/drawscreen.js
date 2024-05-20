// Utility that checks for collision and refreshes screen data
import { runCollisionTest } from './collision';
import { refreshCanvas, winRubble } from './canvas';

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

  // Test for collision
  const collisionResult = runCollisionTest(game, shapeToDraw);

  if (collisionResult) {
    handleCollision(collisionResult, {
      endTick,
      gameOver,
      collide,
      game,
      canvasContextMajor,
      startTick,
      audio,
    });
  } else {
    // No collision found, just refresh the screen
    refreshScreen(game, shapeToDraw, updateScreen, canvasContextMajor);
  }
};

const handleCollision = (
  collisionResult,
  {
    endTick,
    gameOver,
    collide,
    game,
    canvasContextMajor,
    startTick,
    audio,
  }
) => {
  if (collisionResult === 'game over') {
    endTick('collision check - Game Over');
    gameOver();
    return;
  }

  const { winRows, ...rest } = collisionResult;
  const debugMessage = winRows ? 'collision check - Win' : 'collision check - No Win';
  endTick(debugMessage);

  // Update redux with collision results
  collide(rest);

  if (winRows) {
    handleWinningRows(winRows, {
      audio,
      canvasContextMajor,
      game,
      startTick,
    });
  } else {
    startTick();
  }
};

const handleWinningRows = (winRows, { audio, canvasContextMajor, game, startTick }) => {
  // Play appropriate audio based on the number of lines cleared
  if (winRows.length === 4) {
    audio.maxLinesCleared();
  } else {
    audio.lineCleared();
  }

  // Animate the cleared rows
  winRubble(canvasContextMajor, game, winRows);

  // Restart the game tick after a short delay
  const inter = setTimeout(() => {
    startTick();
    clearTimeout(inter);
  }, 250);
};

const refreshScreen = (game, shapeToDraw, updateScreen, canvasContextMajor) => {
  const screenRefreshData = {
    ...game,
    activeShape: shapeToDraw,
    paused: false,
  };

  // Update the game state and refresh the canvas
  updateScreen(screenRefreshData);
  refreshCanvas(canvasContextMajor, screenRefreshData);
};

export default drawScreen;
