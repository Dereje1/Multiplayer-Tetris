/* eslint-disable max-len */
import tetrisShapes from './shapes';
// clear canvas
// eslint-disable-next-line no-unused-vars
export const clearCanvas = (canvasContext, clearHeight, caller) => {
  // console.log('clear called ' + caller)
  if (clearHeight === 'All') {
    canvasContext.clearRect(0, 0, canvasContext.canvas.width, canvasContext.canvas.height);
    return;
  }
  canvasContext.clearRect(0, 0, canvasContext.canvas.width, clearHeight);
};

const drawGrid = ({ context, cellSize }) => {
  const canvasWidth = context.canvas.width;
  const canvasHeight = context.canvas.height;
  for (let x = 0; x <= canvasWidth; x += cellSize) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, canvasHeight);
    context.strokeStyle = '#2F2F2F';
    context.stroke();
  }
  for (let y = 0; y <= canvasHeight; y += cellSize) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(canvasWidth, y);
    context.strokeStyle = '#2F2F2F';
    context.stroke();
  }
};

export const drawCells = (ctx, shape, opponent = false) => {
  const canvasContext = ctx;
  const { unitBlockSize, indices } = shape;
  indices.forEach((c) => {
    const [x, y] = tetrisShapes.getCoordinatesFromIndex({
      index: c,
      width: ctx.canvas.width,
      cellSize: unitBlockSize
    })
    canvasContext.beginPath();
    canvasContext.rect(x, y, unitBlockSize, unitBlockSize);
    canvasContext.fillStyle = tetrisShapes[shape.name].color;
    canvasContext.fill();
    canvasContext.lineWidth = '3';
    canvasContext.strokeStyle = 'grey';
    canvasContext.stroke();
  });
};


export const drawRubble = (ctx, state, opponent = false) => {
  if (opponent) console.log('Opponent Drawing rubble');
  const canvasContext = ctx;
  const b = state.activeShape.unitBlockSize;
  state.rubble.occupiedCells.forEach((cell) => {
    const [index, color] = cell;
    const [x, y] = tetrisShapes.getCoordinatesFromIndex({
      index,
      width: ctx.canvas.width,
      cellSize: b
    })
    // filled rects
    canvasContext.fillStyle = color;
    canvasContext.fillRect(x, y, b, b);
    // draw borders for rubble
    canvasContext.beginPath();
    canvasContext.lineWidth = opponent ? '2' : '3';
    canvasContext.strokeStyle = 'grey';
    canvasContext.rect(x, y, b, b);
    canvasContext.stroke();
  });
};

export const refreshCanvas = (ctx, state, opponent = false) => {
  clearCanvas(ctx, 'All', 'refreshCanvas')
  drawGrid({ context: ctx, cellSize: state.activeShape.unitBlockSize })
  drawCells(ctx, state.activeShape, opponent);
  drawRubble(ctx, state)
  drawFloor(state, ctx, opponent)
};

export const drawNextShape = async (ctx, newShape, state) => {
  clearCanvas(ctx, 'All', 'drawNextShape');
  const initiailizedShape = {
    ...newShape,
    indices: newShape.indices.map(i => i + 40),
    unitBlockSize: 21
  }
  await Promise.resolve()
  drawCells(ctx, initiailizedShape);
};


export const winRubble = (ctx, state, winners) => {
  const canvasContext = ctx;
  const b = state.activeShape.unitBlockSize;
  const blocksPerRow = state.canvas.canvasMajor.width / b;
  winners.forEach((row) => {
    const index = Number(row) * blocksPerRow
    const [x, y] = tetrisShapes.getCoordinatesFromIndex({
      index: index,
      width: ctx.canvas.width,
      cellSize: b
    })
    for (let i = 0; i < blocksPerRow; i += 1) {
      // filled rects
      canvasContext.fillStyle = 'white';
      canvasContext.fillRect(x + (i * b), y, b, b);
      // draw borders for rubble
      canvasContext.beginPath();
      canvasContext.lineWidth = '3';
      canvasContext.strokeStyle = 'grey';
      canvasContext.rect(x + (i * b), y, b, b);
      canvasContext.stroke();
    }
  });
};

export const drawGameOver = (ctx, ctxMinor, state, opponent, authenticated) => {
  const canvasContext = ctx;
  clearCanvas(ctx, 'All', 'draw game over Major');
  clearCanvas(ctxMinor, 'All', 'draw game over Minor');
  canvasContext.font = '60px serif';
  canvasContext.fillStyle = 'white';
  canvasContext.fillText(opponent ? opponent.message : 'Game Over', 14, 100);
  const textB = `${state.points.totalLinesCleared} Lines Cleared`;
  const textC = opponent ? `${opponent.floors}` : `     Reached Level ${state.points.level}`;
  const textD = authenticated ? '' : `Login to save your scores!`
  canvasContext.font = '30px serif';
  canvasContext.fillText(textB, 55, 300);
  canvasContext.fillText(textC, 5, 450);
  canvasContext.font = '25px serif';
  canvasContext.fillText(textD, 15, 550);
};

export const drawFloor = (game, canvasContextMajor, opponent) => {
  const { floor: { floorIndices }, activeShape: { unitBlockSize } } = game;
  floorIndices.forEach((cell) => {
    const [x, y] = tetrisShapes.getCoordinatesFromIndex({
      index: cell,
      width: canvasContextMajor.canvas.width,
      cellSize: unitBlockSize
    })
    // filled rects
    canvasContextMajor.fillStyle = 'grey';
    canvasContextMajor.fillRect(x, y, unitBlockSize, unitBlockSize);
    // draw borders
    canvasContextMajor.beginPath();
    canvasContextMajor.lineWidth = opponent ? '2' : '3';
    canvasContextMajor.strokeStyle = 'white';
    canvasContextMajor.rect(x, y, unitBlockSize, unitBlockSize);
    canvasContextMajor.stroke();
  });
};
