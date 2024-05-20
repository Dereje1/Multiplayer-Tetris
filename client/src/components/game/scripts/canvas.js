import tetrisShapes from './shapes';
import { gameConstants } from '../../../constants';

const { CELLS_PER_ROW } = gameConstants;

// Clear the entire canvas or a specified height
export const clearCanvas = (canvasContext, clearHeight, caller) => {
  // console.log('clear called ' + caller);
  if (clearHeight === 'All') {
    canvasContext.clearRect(0, 0, canvasContext.canvas.width, canvasContext.canvas.height);
  } else {
    canvasContext.clearRect(0, 0, canvasContext.canvas.width, clearHeight);
  }
};

// Draw the grid on the canvas
const drawGrid = ({ context, cellSize }) => {
  const { width: canvasWidth, height: canvasHeight } = context.canvas;
  context.strokeStyle = '#2F2F2F';

  for (let x = 0; x <= canvasWidth; x += cellSize) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, canvasHeight);
    context.stroke();
  }

  for (let y = 0; y <= canvasHeight; y += cellSize) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(canvasWidth, y);
    context.stroke();
  }
};

// Draw cells of the shape on the canvas
export const drawCells = (ctx, shape, opponent = false) => {
  const { unitBlockSize, indices, name } = shape;
  const { color } = tetrisShapes.shapes[name];

  indices.forEach(index => {
    const [x, y] = tetrisShapes.getCoordinatesFromIndex({
      index,
      width: ctx.canvas.width,
      cellSize: unitBlockSize,
    });

    ctx.beginPath();
    ctx.rect(x, y, unitBlockSize, unitBlockSize);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.lineWidth = '3';
    ctx.strokeStyle = 'grey';
    ctx.stroke();
  });
};

// Draw rubble on the canvas
export const drawRubble = (ctx, state, opponent = false) => {
  if (opponent) console.log('Opponent Drawing rubble');
  
  const { occupiedCells } = state.rubble;
  const { unitBlockSize } = state.activeShape;

  occupiedCells.forEach(([index, color]) => {
    const [x, y] = tetrisShapes.getCoordinatesFromIndex({
      index,
      width: ctx.canvas.width,
      cellSize: unitBlockSize,
    });

    ctx.fillStyle = color;
    ctx.fillRect(x, y, unitBlockSize, unitBlockSize);

    ctx.beginPath();
    ctx.lineWidth = opponent ? '2' : '3';
    ctx.strokeStyle = 'grey';
    ctx.rect(x, y, unitBlockSize, unitBlockSize);
    ctx.stroke();
  });
};

// Refresh the entire canvas by clearing and redrawing everything
export const refreshCanvas = (ctx, state, opponent = false) => {
  clearCanvas(ctx, 'All', 'refreshCanvas');
  drawGrid({ context: ctx, cellSize: state.activeShape.unitBlockSize });
  drawCells(ctx, state.activeShape, opponent);
  drawRubble(ctx, state, opponent);
  drawFloor(state, ctx, opponent);
};

// Draw the next shape preview on the canvas
export const drawNextShape = async (ctx, newShape, state) => {
  clearCanvas(ctx, 'All', 'drawNextShape');

  const initializedShape = {
    ...newShape,
    indices: newShape.indices.map(i => i + 40),
    unitBlockSize: 21,
  };

  await Promise.resolve();
  drawCells(ctx, initializedShape);
};

// Draw the winning rubble effect on the canvas
export const winRubble = (ctx, state, winners) => {
  const { unitBlockSize } = state.activeShape;

  winners.forEach(row => {
    const index = Number(row) * CELLS_PER_ROW;
    const [x, y] = tetrisShapes.getCoordinatesFromIndex({
      index,
      width: ctx.canvas.width,
      cellSize: unitBlockSize,
    });

    for (let i = 0; i < CELLS_PER_ROW; i++) {
      ctx.fillStyle = 'white';
      ctx.fillRect(x + i * unitBlockSize, y, unitBlockSize, unitBlockSize);

      ctx.beginPath();
      ctx.lineWidth = '3';
      ctx.strokeStyle = 'grey';
      ctx.rect(x + i * unitBlockSize, y, unitBlockSize, unitBlockSize);
      ctx.stroke();
    }
  });
};

// Draw the game over screen on the canvas
export const drawGameOver = (ctx, ctxMinor, state, opponent, authenticated) => {
  clearCanvas(ctx, 'All', 'draw game over Major');
  clearCanvas(ctxMinor, 'All', 'draw game over Minor');

  ctx.font = '60px serif';
  ctx.fillStyle = 'white';
  ctx.fillText(opponent ? opponent.message : 'Game Over', 14, 100);

  const textB = `${state.points.totalLinesCleared} Lines Cleared`;
  const textC = opponent ? `${opponent.floors}` : `     Reached Level ${state.points.level}`;
  const textD = authenticated ? '' : 'Login to save your scores!';

  ctx.font = '30px serif';
  ctx.fillText(textB, 55, 300);
  ctx.fillText(textC, 5, 450);
  ctx.font = '25px serif';
  ctx.fillText(textD, 15, 550);
};

// Draw the floor on the canvas
export const drawFloor = (game, canvasContextMajor, opponent) => {
  const { floor: { floorIndices }, activeShape: { unitBlockSize } } = game;

  floorIndices.forEach(index => {
    const [x, y] = tetrisShapes.getCoordinatesFromIndex({
      index,
      width: canvasContextMajor.canvas.width,
      cellSize: unitBlockSize,
    });

    canvasContextMajor.fillStyle = 'grey';
    canvasContextMajor.fillRect(x, y, unitBlockSize, unitBlockSize);

    canvasContextMajor.beginPath();
    canvasContextMajor.lineWidth = opponent ? '2' : '3';
    canvasContextMajor.strokeStyle = 'white';
    canvasContextMajor.rect(x, y, unitBlockSize, unitBlockSize);
    canvasContextMajor.stroke();
  });
};
