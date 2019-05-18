import {
  clearCanvas, drawGameOver, drawFloor,
} from './canvas';

const boardReset = ({
  config, stateReset, redux, classItems,
}) => {
  const { game, actions } = redux;
  const {
    reStart = true, keepFloor = false, gameover = false, opponent = null,
  } = config;
  const {
    canvasContextMajor, canvasContextMinor, animationId, endTick, startTick,
  } = classItems;
  stateReset({ floorsRaised: 0 });
  if (gameover) {
    drawGameOver(canvasContextMajor, canvasContextMajor, game, opponent);
    actions.gameReset(1);
    return;
  }
  const floorHeight = game.rubble && keepFloor ? game.rubble.boundaryCells.length / 10 : 1;
  actions.gameReset(floorHeight);
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
