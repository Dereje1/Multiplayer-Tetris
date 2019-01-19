import tetrisShapes from './shapes';
import shapeLocator from './locateShape';
import floorPattern from '../../../assets/pattern.bmp';

export const drawCells = (ctx, shape, opponent = false) => {
  const canvasContext = ctx;
  const b = shape.unitBlockSize;
  shape.cells.forEach((c) => {
    canvasContext.beginPath();
    canvasContext.lineWidth = '3';
    canvasContext.strokeStyle = 'grey';
    canvasContext.rect(c[0] * b, c[1] * b, b, b);
    canvasContext.stroke();
    if (opponent) {
      canvasContext.fillStyle = tetrisShapes[shape.name].color;
      canvasContext.fill();
    }
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

export const drawRuble = (ctx, state, opponent = false) => {
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

export const drawBoundary = (ctx, state) => {
  const yBoundary = state.rubble.boundaryCells.map(c => Number(c.split('-')[1]));
  const boundaryHeight = (Array.from(new Set(yBoundary)).length - 1) *
   state.activeShape.unitBlockSize;
  const yStart = ctx.canvas.height - boundaryHeight;
  const img = new Image();
  img.src = floorPattern;
  img.onload = () => {
    const pattern = ctx.createPattern(img, 'repeat');
    ctx.fillStyle = pattern;
    ctx.fillRect(0, yStart, ctx.canvas.width, boundaryHeight);
  };
};

export const drawShape = (ctx, shapeToDraw) => {
  const canvasContext = ctx;
  canvasContext.beginPath();
  canvasContext.fillStyle = tetrisShapes[shapeToDraw.name].color;
  canvasContext.moveTo(shapeToDraw.xPosition, shapeToDraw.yPosition);
  shapeToDraw.absoluteVertices.forEach((v) => {
    canvasContext.lineTo(v[0], v[1]);
  });
  canvasContext.lineTo(shapeToDraw.xPosition, shapeToDraw.yPosition);
  canvasContext.fill();
};

// clear canvas
export const clearCanvas = (canvasContext, state, fullClear = false) => {
  const yBoundary = state.rubble.boundaryCells.map(c => Number(c.split('-')[1]));
  const boundaryHeight = (Array.from(new Set(yBoundary)).length - 1) *
   state.activeShape.unitBlockSize;
  const yStart = canvasContext.canvas.height - boundaryHeight;
  const heightToClear = fullClear ? canvasContext.canvas.height : yStart;
  canvasContext.clearRect(0, 0, canvasContext.canvas.width, heightToClear);
};

export const drawNextShape = (ctx, newShape, state) => {
  clearCanvas(ctx, state, true);
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

  [initiailizedShape.boundingBox, initiailizedShape.absoluteVertices] =
   tetrisShapes.getDims(initiailizedShape);

  const locatedShape = shapeLocator(
    ctx,
    canvasWidth,
    canvasHeight,
    initiailizedShape,
    false,
    specialshapes,
  );
  drawShape(ctx, locatedShape);
  drawCells(ctx, locatedShape);
};


export const winRubble = (ctx, state, winners) => {
  const canvasContext = ctx;
  drawBoundary(canvasContext, state);
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
