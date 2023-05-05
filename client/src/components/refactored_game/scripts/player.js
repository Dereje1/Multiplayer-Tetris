import { runCollisionTest, getSideBlock } from './collision';
import tetrisShapes from './shapes';
import shapeLocator from './locateShape';

const getCanvasEdge = ({ unitVertices, width, unitBlockSize }) => {
  const cellsPerRow = width / unitBlockSize;

  for (const idx of unitVertices) {
    const column = idx % cellsPerRow;
    if (column === 0) return 'leftEdge';
    if (column === cellsPerRow - 1) return 'rightEdge';
  }

  return 'noEdge'
}

const rotation = (state) => {
  const { canvas: { canvasMajor: { width } }, activeShape } = state;
  const updatedShape = tetrisShapes.onRotate({ activeShape, width });
  // if (!runCollisionTest(state, locatedShape)) return rotatedShape;
  return updatedShape;
};

const playerMoves = (keyCode, state, ctx) => {
  if (state.paused) return null;
  const left = keyCode === 37;
  const right = keyCode === 39;
  const up = keyCode === 38;
  const down = keyCode === 40;


  if (!(left || right || up || down)) return null; // do nothing for any other keypress
  const { canvas: { canvasMajor: { width } }, activeShape: { unitBlockSize, unitVertices } } = state;

  const edge = getCanvasEdge({ unitVertices, width, unitBlockSize });
  if (left && edge === 'leftEdge') return null;
  if (right && edge === 'rightEdge') return null;

  const copyOfActiveShape = Object.assign({}, state.activeShape);
  if (left) {
    if (getSideBlock('L', state)) return null;
    const newPos = copyOfActiveShape.unitVertices.map((idx) => idx - 1)
    return {
      ...copyOfActiveShape,
      unitVertices: newPos
    };
  } if (right) {
    if (getSideBlock('R', state)) return null;
    const newPos = copyOfActiveShape.unitVertices.map((idx) => idx + 1)
    return {
      ...copyOfActiveShape,
      unitVertices: newPos
    };
  } if (down) {
    // if next down is a collision then return null as dual processing
    // of collision with drawscreen produces problems
    copyOfActiveShape.yPosition += state.activeShape.unitBlockSize;
    [copyOfActiveShape.boundingBox,
    copyOfActiveShape.absoluteVertices] = tetrisShapes.getDims(copyOfActiveShape);
    const locatedShape = shapeLocator(
      ctx,
      state.canvas.canvasMajor.width,
      state.canvas.canvasMajor.height,
      copyOfActiveShape, false,
    );

    return runCollisionTest(state, locatedShape) ? null : 'forcedown';
  }

  return rotation(state, ctx);
};

export default playerMoves;
