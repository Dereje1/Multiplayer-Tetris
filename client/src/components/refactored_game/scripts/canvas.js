/* eslint-disable max-len */
import tetrisShapes from './shapes';

export const getCoordinatesFromIndex = ({ index, width, cellSize }) => {
  const cellsPerRow = width / cellSize;
  const row = Math.floor(index / cellsPerRow);
  const column = index % cellsPerRow;
  const x = column * cellSize;
  const y = row * cellSize;
  return [x, y];
};

const rubbleHeight = (state, opponent) => {
  if (!state.rubble.occupiedCells.length) {
    return opponent ? 300 : 600;
  }
  const occupiedIndices = state.rubble.occupiedCells.map(o => o[0])
  const minIndex = Math.min(...occupiedIndices)

  const [, height] = getCoordinatesFromIndex({
    index: minIndex,
    width: 300,
    cellSize: 30
  })
  return height
}

export const getBoundryHeight = (state, opponent = false) => {


  return opponent ? 300 - rubbleHeight(state) : 600 - rubbleHeight(state);
};
export const getRubbleHeight = (state, opponent) => {
  // since rubble height is inclusive of floor height, return
  // floor height if no rubble.
  if (state.rubble.occupiedCells.length) {
    const yBoundary = state.rubble.occupiedCells.map(c => c[0]);
    const rubbleHeight = yBoundary.length
      ? Math.min.apply(null, yBoundary) * state.activeShape.unitBlockSize
      : getBoundryHeight(state, opponent);
    return getBoundryHeight(state, opponent);
  }
  return getBoundryHeight(state, opponent);
};
// clear canvas
// eslint-disable-next-line no-unused-vars
export const clearCanvas = (canvasContext, clearHeight, caller) => {
  console.log('clear called ' + caller)
  // if (canvasContext.canvas.clientHeight === 300) console.log(`clearing canvas ${caller} ${clearHeight}`);
  if (clearHeight === 'All') {
    canvasContext.clearRect(0, 0, canvasContext.canvas.width, canvasContext.canvas.height);
    return;
  }
  canvasContext.clearRect(0, 0, canvasContext.canvas.width, clearHeight);
};

export const drawCells = (ctx, shape, opponent = false) => {
  const canvasContext = ctx;
  const { unitBlockSize, indices } = shape;
  indices.forEach((c) => {
    const [x, y] = getCoordinatesFromIndex({
      index: c,
      width: 300,
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

export const drawGrid = (x, y, occupied, b, ctx) => {
  const canvasContext = ctx;
  const col = occupied ? 'grey' : 'white';
  canvasContext.beginPath();
  canvasContext.lineWidth = '3';
  canvasContext.strokeStyle = col;
  canvasContext.rect(x, y, b, b);
  canvasContext.stroke();
};

export const drawGridSpecial = (x, y, occupied, b, ctx) => {
  const canvasContext = ctx;
  if (x === 0) {
    canvasContext.beginPath();
    canvasContext.lineWidth = '3';
    canvasContext.strokeStyle = 'black';
    canvasContext.rect(x, y, b, b);
    canvasContext.stroke();
    canvasContext.fillStyle = 'black';
    canvasContext.rect(x, y, b, b);
    canvasContext.fill();
  }
};

export const drawRubble = (ctx, state, opponent = false) => {
  if (opponent) console.log('Opponent Drawing rubble');
  const canvasContext = ctx;
  const b = state.activeShape.unitBlockSize;
  state.rubble.occupiedCells.forEach((cell) => {
    const [index, color] = cell;
    const [x, y] = getCoordinatesFromIndex({
      index,
      width: 300,
      cellSize: 30
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

export const drawBoundary = (ctx, state, opponent = false) => {
  // console.log('Drawing Boundry');
  const canvasContext = ctx;
  const b = state.activeShape.unitBlockSize;
  canvasContext.clearRect(
    0,
    getRubbleHeight(state),
    canvasContext.canvas.width,
    canvasContext.canvas.height
  );
  state.rubble.boundaryCells.forEach((cell) => {
    // filled rects
    const [x, y] = getCoordinatesFromIndex({
      index: cell,
      width: 300,
      cellSize: b
    })
    canvasContext.fillStyle = 'rgba(93, 149, 221, 0.403921568627451)';
    canvasContext.fillRect(x * b, y * b, b, b);
    // draw borders for rubble
    canvasContext.beginPath();
    canvasContext.lineWidth = opponent ? '1' : '4';
    canvasContext.strokeStyle = 'white';
    canvasContext.rect(x * b, y * b, b, b);
    canvasContext.stroke();
  });
  return opponent ? drawRubble(ctx, state, true) : null;
};

export const drawShape = (ctx, state, opponent = false) => {
  clearCanvas(ctx, 'All', 'drawShape')
  drawCells(ctx, state.activeShape, opponent);
  drawRubble(ctx, state)
};

export const drawNextShape = async (ctx, newShape, state) => {
  clearCanvas(ctx, 'All', 'drawNextShape');
  const initiailizedShape = newShape;
  const canvasWidth = state.canvas.canvasMinor.width;
  const canvasHeight = state.canvas.canvasMinor.height;
  let specialshapes = false;
  if (initiailizedShape.name !== 'shapeI' && initiailizedShape.name !== 'shapeO') {
    initiailizedShape.xPosition = canvasWidth / 2;
    initiailizedShape.yPosition = canvasHeight / 2;
  } else {
    specialshapes = true;
    initiailizedShape.xPosition = (canvasWidth / 2) + (initiailizedShape.unitBlockSize / 2);
    initiailizedShape.yPosition += (canvasHeight / 2);
    initiailizedShape.yPosition -= (initiailizedShape.unitBlockSize / 2);
  }

  await Promise.resolve()
  // console.log({locatedShape})
  // const canvasContext = ctx;
  // canvasContext.beginPath();
  // canvasContext.fillStyle = tetrisShapes[locatedShape.name].color;
  // canvasContext.moveTo(locatedShape.xPosition, locatedShape.yPosition);
  // locatedShape.indices.forEach((v) => {
  //   const [x,y] = getCoordinatesFromIndex({
  //     index: v,
  //     width: canvasWidth,
  //     cellSize: locatedShape.unitBlockSize
  //   })
  //   canvasContext.lineTo(x, y);
  // });
  // canvasContext.lineTo(locatedShape.xPosition, locatedShape.yPosition);
  // canvasContext.fill();
  drawCells(ctx, initiailizedShape);
};


export const winRubble = (ctx, state, winners) => {
  const canvasContext = ctx;
  const b = state.activeShape.unitBlockSize;
  const blocksPerRow = state.canvas.canvasMajor.width / b;
  winners.forEach((row) => {
    const index = Number(row) * blocksPerRow
    const [x, y] = getCoordinatesFromIndex({
      index: index,
      width: 300,
      cellSize: 30
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

export const drawGameOver = (ctx, ctxMinor, state, opponent) => {
  const canvasContext = ctx;
  clearCanvas(ctx, 'All', 'draw game over Major');
  clearCanvas(ctxMinor, 'All', 'draw game over Minor');
  canvasContext.font = '60px serif';
  canvasContext.fillStyle = 'white';
  canvasContext.fillText(opponent ? opponent.message : 'Game Over', 14, 100);
  const textB = `${state.points.totalLinesCleared} Lines Cleared`;
  const textC = opponent ? `${opponent.floors}` : `     Reached Level ${state.points.level}`;
  canvasContext.font = '30px serif';
  canvasContext.fillText(textB, 55, 300);
  canvasContext.fillText(textC, 5, 450);
};

export const drawFloor = (game, canvasContextMajor) => {
  drawBoundary(canvasContextMajor, game);
  drawRubble(canvasContextMajor, game);
  drawShape(canvasContextMajor, game);
};
