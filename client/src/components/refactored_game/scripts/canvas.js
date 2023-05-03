/* eslint-disable max-len */
import tetrisShapes from './shapes';
import shapeLocator from './locateShape';

export const getCoordinatesFromIndex = ({ index, width, cellSize }) => {
  const cellsPerRow = width / cellSize;
  const row = Math.floor(index / cellsPerRow);
  const column = index % cellsPerRow;
  const x = column * cellSize;
  const y = row * cellSize;
  return [x, y];
};

export const getBoundryHeight = (state, opponent = false) => {
  const yBoundary = state.rubble.boundaryCells.map(c => Number(c.split('-')[1]));
  const boundaryHeight = (Array.from(new Set(yBoundary)).length - 1)
   * state.activeShape.unitBlockSize;
  return opponent ? 300 - boundaryHeight : 600 - boundaryHeight;
};
export const getRubbleHeight = (state, opponent) => {
  // since rubble height is inclusive of floor height, return
  // floor height if no rubble.
  if (state.rubble) {
    const yBoundary = state.rubble.occupiedCells.map(c => Number(c[0].split('-')[1]));
    const rubbleHeight = yBoundary.length
      ? Math.min.apply(null, yBoundary) * state.activeShape.unitBlockSize
      : getBoundryHeight(state, opponent);
    return rubbleHeight;
  }
  return getBoundryHeight(state, opponent);
};
// clear canvas
// eslint-disable-next-line no-unused-vars
export const clearCanvas = (canvasContext, clearHeight, caller) => {
  // if (canvasContext.canvas.clientHeight === 300) console.log(`clearing canvas ${caller} ${clearHeight}`);
  if (clearHeight === 'All') {
    canvasContext.clearRect(0, 0, canvasContext.canvas.width, canvasContext.canvas.height);
    return;
  }
  canvasContext.clearRect(0, 0, canvasContext.canvas.width, clearHeight);
};

export const drawCells = (ctx, shape, opponent = false) => {
  const canvasContext = ctx;
  const b = shape.unitBlockSize;
  shape.unitVertices.forEach((c) => {
    const [x,y] = getCoordinatesFromIndex({
      index: c,
      width: 300,
      cellSize: b
    })
    canvasContext.beginPath();
    canvasContext.lineWidth = '3';
    canvasContext.strokeStyle = 'grey';
    canvasContext.rect(x, y, b, b);
    canvasContext.stroke();
    canvasContext.fillStyle = tetrisShapes[shape.name].color;
    canvasContext.fill();
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
  clearCanvas(ctx, getBoundryHeight(state, opponent), 'drawRubble');
  const canvasContext = ctx;
  const b = state.activeShape.unitBlockSize;
  state.rubble.occupiedCells.forEach((cell) => {
    const [cellString, color] = cell;

    const x = Number(cellString.split('-')[0]);
    const y = Number(cellString.split('-')[1]);
    // filled rects

    canvasContext.fillStyle = color;
    canvasContext.fillRect(x * b, y * b, b, b);
    // draw borders for rubble
    canvasContext.beginPath();
    canvasContext.lineWidth = opponent ? '2' : '3';
    canvasContext.strokeStyle = 'grey';
    canvasContext.rect(x * b, y * b, b, b);
    canvasContext.stroke();
  });
};

export const drawBoundary = (ctx, state, opponent = false) => {
  // console.log('Drawing Boundry');
  const canvasContext = ctx;
  const b = state.activeShape.unitBlockSize;
  canvasContext.clearRect(0, getRubbleHeight(state),
    canvasContext.canvas.width, canvasContext.canvas.height);
  state.rubble.boundaryCells.forEach((cell) => {
    const x = Number(cell.split('-')[0]);
    const y = Number(cell.split('-')[1]);
    // filled rects

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
  console.log({state})
  const shapeToDraw = state.activeShape;
  const shapeYDirectionLowerBound = opponent
    ? shapeToDraw.boundingBox[3] / 2
    : shapeToDraw.boundingBox[3];
  const borderOffset = opponent ? 33 / 2 : 33;
  // if (opponent) console.log(shapeYDirectionLowerBound);
  if (getRubbleHeight(state, opponent)) {
    // if (opponent) console.log(`Boundry Height = ${getBoundryHeight(state, opponent)} Rubble Height = ${getRubbleHeight(state, opponent)}`);
    const distanceBetweenRubble = (getRubbleHeight(state, opponent)) - shapeYDirectionLowerBound;
    if (distanceBetweenRubble > borderOffset) {
      clearCanvas(ctx, shapeYDirectionLowerBound + borderOffset, opponent ? 'drawshape1' : null);
    } else {
      drawRubble(ctx, state, opponent);
    }
  } else clearCanvas(ctx, shapeYDirectionLowerBound + borderOffset, opponent ? 'drawshape3' : null);
console.log({shapeToDraw})
  // if (!opponent) {
  //   const canvasContext = ctx;
  //   canvasContext.beginPath();
  //   canvasContext.fillStyle = tetrisShapes[shapeToDraw.name].color;
  //   canvasContext.moveTo(shapeToDraw.xPosition, shapeToDraw.yPosition);
  //   shapeToDraw.unitVertices.forEach((v) => {
  //     const [x,y] = getCoordinatesFromIndex({
  //       index: v,
  //       width: 300,
  //       cellSize: shapeToDraw.unitBlockSize
  //     })
  //     console.log(x,y)
  //     canvasContext.lineTo(x, y);
  //   });
    
  //   canvasContext.lineTo(shapeToDraw.xPosition, shapeToDraw.yPosition);
  //   canvasContext.fill();
  // }
  drawCells(ctx, shapeToDraw, opponent);
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

  [initiailizedShape.boundingBox,
    initiailizedShape.absoluteVertices] = tetrisShapes.getDims(initiailizedShape);

  const locatedShape = shapeLocator(
    ctx,
    canvasWidth,
    canvasHeight,
    initiailizedShape,
    false,
    specialshapes,
  );
  await Promise.resolve()
  // console.log({locatedShape})
  // const canvasContext = ctx;
  // canvasContext.beginPath();
  // canvasContext.fillStyle = tetrisShapes[locatedShape.name].color;
  // canvasContext.moveTo(locatedShape.xPosition, locatedShape.yPosition);
  // locatedShape.unitVertices.forEach((v) => {
  //   const [x,y] = getCoordinatesFromIndex({
  //     index: v,
  //     width: canvasWidth,
  //     cellSize: locatedShape.unitBlockSize
  //   })
  //   canvasContext.lineTo(x, y);
  // });
  // canvasContext.lineTo(locatedShape.xPosition, locatedShape.yPosition);
  // canvasContext.fill();
  drawCells(ctx, locatedShape);
};


export const winRubble = (ctx, state, winners) => {
  const canvasContext = ctx;
  // drawBoundary(canvasContext, state);
  const b = state.activeShape.unitBlockSize;
  state.rubble.occupiedCells.forEach((cell) => {
    const [cellString, color] = cell;
    const x = Number(cellString.split('-')[0]);
    const y = Number(cellString.split('-')[1]);
    // filled rects
    if (!winners.includes(y)) {
      // filled rects
      canvasContext.fillStyle = color;
      canvasContext.fillRect(x * b, y * b, b, b);
      // draw borders for rubble
      canvasContext.beginPath();
      canvasContext.lineWidth = '3';
      canvasContext.strokeStyle = 'grey';
      canvasContext.rect(x * b, y * b, b, b);
      canvasContext.stroke();
    }
  });
  const blocksPerRow = state.canvas.canvasMajor.width / b;
  winners.forEach((y) => {
    for (let x = 0; x < blocksPerRow; x += 1) {
      // filled rects
      canvasContext.fillStyle = 'white';
      canvasContext.fillRect(x * b, y * b, b, b);
      // draw borders for rubble
      canvasContext.beginPath();
      canvasContext.lineWidth = '3';
      canvasContext.strokeStyle = 'grey';
      canvasContext.rect(x * b, y * b, b, b);
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
