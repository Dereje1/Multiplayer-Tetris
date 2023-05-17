import { runCollisionTest, getSideBlock } from './collision';
import tetrisShapes from './shapes';

const getCanvasEdge = ({ indices, width, unitBlockSize }) => {
  const cellsPerRow = width / unitBlockSize;

  for (const idx of indices) {
    const column = idx % cellsPerRow;
    if (column === 0) return 'leftEdge';
    if (column === cellsPerRow - 1) return 'rightEdge';
  }

  return 'noEdge'
}

const rotation = (state) => {
  const { canvas: { canvasMajor: { width } }, activeShape } = state;
  const updatedShape = tetrisShapes.onRotate({ activeShape, width });
  return runCollisionTest(state, updatedShape) ? activeShape : updatedShape;
};

const playerMoves = (keyCode, state) => {
  if (state.paused) return null;

  const keyActions = {
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down'
  };

  const action = keyActions[keyCode];

  if (!action) return null; // do nothing for any other keypress

  const { canvas: { canvasMajor: { width } }, activeShape: { unitBlockSize, indices } } = state;

  const edge = getCanvasEdge({ indices, width, unitBlockSize });

  if ((action === 'left' && edge === 'leftEdge') || (action === 'right' && edge === 'rightEdge')) return null;

  const copyOfActiveShape = Object.assign({}, state.activeShape);

  if (action === 'left') {
    if (getSideBlock('L', state)) return null;
    const newPos = copyOfActiveShape.indices.map((idx) => idx - 1)
    return {
      ...copyOfActiveShape,
      indices: newPos
    };
  }
  if (action === 'right') {
    if (getSideBlock('R', state)) return null;
    const newPos = copyOfActiveShape.indices.map((idx) => idx + 1)
    return {
      ...copyOfActiveShape,
      indices: newPos
    };
  }
  if (action === 'down') {
    // if next down is a collision then return null as dual processing
    // of collision with drawscreen produces problems
    return runCollisionTest(state, {
      ...copyOfActiveShape,
      indices: copyOfActiveShape.indices.map((idx) => idx + 10)
    }) ? null : 'forcedown';
  }

  return rotation(state);
};

export default playerMoves;