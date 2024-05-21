import { runCollisionTest, getSideBlock } from './collision';
import tetrisShapes from './shapes';
import { gameConstants } from '../../../constants';

const { CELLS_PER_ROW } = gameConstants;

// Determine if the shape is at the edge of the canvas
const getCanvasEdge = ({ indices }) => {
  for (const idx of indices) {
    const column = idx % CELLS_PER_ROW;
    if (column === 0) return 'leftEdge';
    if (column === CELLS_PER_ROW - 1) return 'rightEdge';
  }
  return 'noEdge';
};

// Rotate the active shape
const rotation = (state) => {
  const { activeShape } = state;
  return tetrisShapes.onRotate({ activeShape });
};

// Move the active shape based on the key press
const playerMoves = (keyCode, state) => {
  if (state.paused) return null;

  const keyActions = {
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down'
  };

  const action = keyActions[keyCode];
  if (!action) return null; // Do nothing for any other keypress

  const { activeShape } = state;
  const { indices } = activeShape;
  const edge = getCanvasEdge({ indices });

  if ((action === 'left' && edge === 'leftEdge') || (action === 'right' && edge === 'rightEdge')) {
    return null;
  }

  const newShape = getNewShape(action, state, activeShape);
  if (!newShape) return null;

  return newShape;
};

// Calculate the new shape based on the movement direction
const getNewShape = (action, state, activeShape) => {
  const { indices } = activeShape;
  let newShape;

  if (action === 'left' && !getSideBlock('L', state)) {
    newShape = {
      ...activeShape,
      indices: indices.map(idx => idx - 1)
    };
    return newShape;
  }
  if (action === 'right' && !getSideBlock('R', state)) {
    newShape = {
      ...activeShape,
      indices: indices.map(idx => idx + 1)
    };
    return newShape;
  }
  if (action === 'down') {
    newShape = {
      ...activeShape,
      indices: indices.map(idx => idx + CELLS_PER_ROW)
    };
    if (runCollisionTest(state, newShape)) {
      return null;
    }
    return newShape;
  }
  if (action === 'up') {
    newShape = rotation(state);
    if (runCollisionTest(state, newShape)) {
      return activeShape;
    }
    return newShape;
  }

  return null;
};

export default playerMoves;
