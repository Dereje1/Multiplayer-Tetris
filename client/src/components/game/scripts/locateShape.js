import { drawGrid, drawGridSpecial } from './canvas';

const shapeLocator = (
  canvasContext, canvasWidth, canvasHeight,
  shapeInfo, grid = false, specialShapes = false,
) => {
  const {
    unitBlockSize: b,
    absoluteVertices, xPosition, yPosition, boundingBox,
  } = shapeInfo;
  const blocksPerRow = canvasWidth / b;
  const blocksPerColumn = canvasHeight / b;
  const copyOfActiveShape = Object.assign({}, shapeInfo);
  let doloop = true;

  copyOfActiveShape.cells = [];
  // add origin to absolute vertices needed for check
  const absoluteVerticesWithOrigin = [...absoluteVertices, [xPosition, yPosition]];

  const stringifyAbsVertices = absoluteVerticesWithOrigin.map(v => v.join('-'));
  for (let i = 0; i < blocksPerRow; i += 1) {
    if (!doloop && !grid) break;
    for (let j = 0; j <= blocksPerColumn; j += 1) {
      if (!doloop && !grid) break;
      // check if current unit screen element is within bounding box of active shape
      const x = [i * b, (i * b) + b];
      const y = [j * b, (j * b) + b];

      const xIncluded = (x[0] >= boundingBox[0]) && (x[1] <= boundingBox[1]);
      const yIncluded = (y[0] >= boundingBox[2]) && (y[1] <= boundingBox[3]);
      let match = false;
      if (xIncluded && yIncluded) {
        // it is within bounding box
        // find true vertices of unit element
        const elementVertices = [[i * b, j * b], [i * b, (j * b) + b],
          [(i * b) + b, (j * b) + b], [(i * b) + b, j * b]];
        const stringElementVertices = elementVertices.map(v => v.join('-'));
        /*
        Must have all 4 vertices included to verify element
        is within the shape , other wise just go to
        the next cell down in the same column
        */
        match = stringElementVertices.every(v => stringifyAbsVertices.includes(v));

        if (match) copyOfActiveShape.cells.push([i, j]);
        // all 4 blocks have been found, nothing else to do
        if (copyOfActiveShape.cells.length === 4) doloop = false;
      }
      if (grid) drawGrid(x[0], y[0], match, b, canvasContext);
      if (specialShapes) drawGridSpecial(x[0], y[0], match, b, canvasContext);
    }
  }
  return copyOfActiveShape;
};


export default shapeLocator;
