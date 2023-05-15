import {
  clearCanvas, drawGameOver, drawFloor,
} from './canvas';

const boardReset = ({
  config, stateReset, redux, classItems,
}) => {
  const { game, gameReset } = redux;
  const {
    reStart = true, gameover = false, opponent = null, authenticated
  } = config;
  const {
    canvasContextMajor, canvasContextMinor, animationId, endTick, startTick,
  } = classItems;
  stateReset({ floorsRaised: 0 });
  if (gameover) {
    drawGameOver(canvasContextMajor, canvasContextMinor, game, opponent, authenticated);
    gameReset({
      floor: {
        floorHeight: 0,
        floorIndices: []
      }
    });
    endTick('Game over');
    return;
  }
  const floorHeight = game.floor.floorHeight > 0 && reStart ? { floor: game.floor } : {
    floor: {
      floorHeight: 0,
      floorIndices: []
    }
  };
  gameReset(floorHeight);
  if (animationId) endTick('reset Board');
  if (reStart) { // fresh game
    startTick();
  } else {
    stateReset({ buttonPause: true });
  }
  clearCanvas(canvasContextMajor, 'All', 'reset'); // clear canvasMajor
  if (reStart) drawFloor(game, canvasContextMajor);
  clearCanvas(canvasContextMinor, 'All', 'reset'); // clear canvasMajor
};

export default boardReset;
