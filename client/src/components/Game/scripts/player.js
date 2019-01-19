import { runCollisionTest, getSideBlock } from './collision';
import tetrisShapes from './shapes';
import shapeLocator from './locateShape';

const rotation = (state, ctx) => {
  const unitVerticesAfterRotation = tetrisShapes.onRotate(state.activeShape.unitVertices);
  const rotatedShape = Object.assign({}, state.activeShape);
  // assign new unit vertices and find bbox and absolutevertices
  rotatedShape.unitVertices = unitVerticesAfterRotation;
  [rotatedShape.boundingBox, rotatedShape.absoluteVertices] = tetrisShapes.getDims(rotatedShape);

  rotatedShape.rotationStage = rotatedShape.rotationStage > 2 ?
    0 :
    rotatedShape.rotationStage + 1;
  rotatedShape.cells = [];

  // do crude wall kicks, ideally should translate with a recursive function
  if (
    rotatedShape.boundingBox[0] < 0 ||
        rotatedShape.boundingBox[1] > state.canvas.canvasMajor.width
  ) { // side wall kicks
    const translateUnits = state.activeShape.name === 'shapeI' ? 2 : 1;
    if (rotatedShape.boundingBox[0] < 0) { // translate to the left
      rotatedShape.xPosition += (translateUnits * state.activeShape.unitBlockSize);
    } else { // translate to the right
      rotatedShape.xPosition -= (translateUnits * state.activeShape.unitBlockSize);
    }
  }
  /* locate shape to get cell values and check for collision on rotation,
     if collision detected do not rotate shape */
  const locatedShape = shapeLocator(
    ctx,
    state.canvas.canvasMajor.width,
    state.canvas.canvasMajor.height,
    rotatedShape, false,
  );
  if (!runCollisionTest(state, locatedShape)) return rotatedShape;
  return null;
};

const playerMoves = (e, state, ctx) => {
  if (state.paused) return null;
  const left = e.keyCode === 37;
  const right = e.keyCode === 39;
  const up = e.keyCode === 38;
  const down = e.keyCode === 40;


  if (!(left || right || up || down)) return null; // do nothing for any other keypress

  // check X boundaries
  const leftOutOfBound = left && (state.activeShape.boundingBox[0] -
       state.activeShape.unitBlockSize) < 0;
  const rightOutOfBound = right && (state.activeShape.boundingBox[1] +
      state.activeShape.unitBlockSize) > state.canvas.canvasMajor.width;
  if (leftOutOfBound || rightOutOfBound) return null;

  const copyOfActiveShape = Object.assign({}, state.activeShape);
  if (left) {
    if (getSideBlock('L', state)) return null;
    copyOfActiveShape.xPosition -= state.activeShape.unitBlockSize;
    return copyOfActiveShape;
  } else if (right) {
    if (getSideBlock('R', state)) return null;
    copyOfActiveShape.xPosition += state.activeShape.unitBlockSize;
    return copyOfActiveShape;
  } else if (down) return 'tick';

  return rotation(state, ctx);
};

export default playerMoves;
