import { runCollisionTest, getSideBlock } from './collision';
import tetrisShapes from './shapes';
import shapeLocator from './locateShape';

const rotation = (state, ctx) => {
  const rotatedShape = Object.assign({}, state.activeShape);
  // assign new unit vertices and find bbox and absolutevertices

  rotatedShape.rotationStage = rotatedShape.rotationStage > 2
    ? 0
    : rotatedShape.rotationStage + 1;
  rotatedShape.cells = [];

  const unitVerticesAfterRotation = tetrisShapes.onRotate(rotatedShape);
  rotatedShape.unitVertices = unitVerticesAfterRotation;

  // do crude wall kicks, ideally should translate with a recursive function
  if (
    rotatedShape.boundingBox[0] < 0
    || rotatedShape.boundingBox[1] > state.canvas.canvasMajor.width
  ) { // side wall kicks
    const translateUnits = state.activeShape.name === 'shapeI' ? 2 : 1;
    if (rotatedShape.boundingBox[0] < 0) { // translate to the left
      rotatedShape.xPosition += (translateUnits * state.activeShape.unitBlockSize);
    } else { // translate to the right
      rotatedShape.xPosition -= (translateUnits * state.activeShape.unitBlockSize);
    }
  }

  // if (!runCollisionTest(state, locatedShape)) return rotatedShape;
  return rotatedShape;
};

const playerMoves = (keyCode, state, ctx) => {
  if (state.paused) return null;
  const left = keyCode === 37;
  const right = keyCode === 39;
  const up = keyCode === 38;
  const down = keyCode === 40;


  if (!(left || right || up || down)) return null; // do nothing for any other keypress

  // check X boundaries
  const leftOutOfBound = left && (state.activeShape.boundingBox[0]
    - state.activeShape.unitBlockSize) < 0;
  const rightOutOfBound = right && (state.activeShape.boundingBox[1]
    + state.activeShape.unitBlockSize) > state.canvas.canvasMajor.width;
  if (leftOutOfBound || rightOutOfBound) return null;

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
