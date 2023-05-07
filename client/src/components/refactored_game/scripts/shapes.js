export const getCoordinatesFromIndex = ({ index, width, cellSize }) => {
  const cellsPerRow = width / cellSize;
  const row = Math.floor(index / cellsPerRow);
  const column = index % cellsPerRow;
  const x = column * cellSize;
  const y = row * cellSize;
  return [x, y];
};

// tests contiguity in x direction of tetrimino
const isContiguous = ({
  indices,
  width,
  cellSize
}) => {

  const xCoordinates = indices.map(idx => getCoordinatesFromIndex({ index: idx, width, cellSize })[0])
  xCoordinates.sort((a, b) => a - b)
  let prev = null;

  for (const xCoord of xCoordinates) {
    if (prev === null) {
      prev = xCoord;
      continue;
    }
    if ((xCoord - prev) > 30) return false
    prev = xCoord
  }

  return true
}

const tetrisShapes = {
  getRandShapeName: () => {
    const shapeList = ['shapeL', 'shapeZ', 'shapeT', 'shapeI', 'shapeJ', 'shapeO', 'shapeS'];
    const randNum = Math.floor(Math.random() * (shapeList.length));
   // return 'shapeJ'
    return shapeList[randNum];
  },
  getDims(activeShape) {
    const absoluteVertices = this.getAbsoluteVertices(
      activeShape.unitBlockSize,
      activeShape.xPosition,
      activeShape.yPosition,
      activeShape.unitVertices,
    );

    return [this.onBoundingBox(absoluteVertices), absoluteVertices];
  },
  onRotate: ({ activeShape, width }) => {
    const { name, unitVertices, rotationStage } = activeShape

    const newRotationStage = rotationStage > 2
      ? 0
      : rotationStage + 1;
    const transformation = tetrisShapes[name].rotationStages[newRotationStage]
    const transformedVertices = unitVertices.map((v, idx) => v + transformation[idx])

    if (!isContiguous({
      indices: transformedVertices,
      width,
      cellSize: activeShape.unitBlockSize
    })) return activeShape;

    return {
      ...activeShape,
      unitVertices: transformedVertices,
      rotationStage: newRotationStage
    }
  },
  onBoundingBox: (absoluteVertices) => {
    const xArr = absoluteVertices.map(v => v[0]);
    const yArr = absoluteVertices.map(v => v[1]);
    return [Math.min(...xArr), Math.max(...xArr), Math.min(...yArr), Math.max(...yArr)];
  },
  getAbsoluteVertices: (blockSize, x, y, unitVertices) => (
    unitVertices.map(v => [x + (v[0] * blockSize), y + (v[1] * blockSize)])
  ),
  initializeShape(shapeName, game) {
    // finding intital y bound so it does not get cutoff
    const x = (shapeName !== 'shapeI' && shapeName !== 'shapeO')
      ? (game.canvas.canvasMajor.width / 2) + (game.activeShape.unitBlockSize / 2)
      : game.canvas.canvasMajor.width / 2;

    const initialAbsoluteVertices = this.getAbsoluteVertices(
      game.activeShape.unitBlockSize,
      x,
      0,
      this[shapeName].vertices,
    );

    const initialBoundingBox = this.onBoundingBox(initialAbsoluteVertices);
    const activeShape = {
      name: shapeName,
      unitBlockSize: 30,
      xPosition: x,
      yPosition: -1 * initialBoundingBox[2],
      unitVertices: this[shapeName].vertices,
      absoluteVertices: initialAbsoluteVertices,
      boundingBox: initialBoundingBox,
      rotationStage: 0,
      cells: [],
    };
    return activeShape;
  },
  createNewShape(game) {
    const randomShape = game.nextShape
      ? this.initializeShape(game.nextShape, game)
      : this.initializeShape(this.getRandShapeName(), game);
    const newShapeName = this.getRandShapeName();
    const nextShapeInfo = this.initializeShape(newShapeName, game);
    return { randomShape, newShapeName, nextShapeInfo };
  },
  shapeI: {
    vertices: [3, 4, 5, 6],
    color: 'cyan',
    rotationStages: {
      0: [-2, -11, -20, -29],
      1: [2, 11, 20, 29],
      2: [-2, -11, -20, -29],
      3: [2, 11, 20, 29]
    }
  },
  shapeJ: {
    vertices: [3, 13, 14, 15],
    color: 'blue',
    rotationStages: {
      0: [-2, -2, -11, -9],
      1: [1, -8, 0, 9],
      2: [-1, -1, -9, -9],
      3: [2, 11, 20, 9]
    }
  },
  shapeL: {
    vertices: [5, 13, 14, 15],
    color: 'orange',
    rotationStages: {
      0: [1, 8, -1, -10],
      1: [-1, 1, 10, 10],
      2: [-1, -10, -19, -12],
      3: [1, 1, 10, 12]
    }
  },
  shapeO: {
    vertices: [4, 5, 14, 15],
    color: 'yellow',
    rotationStages: {
      0: [0, 0, 0, 0],
      1: [0, 0, 0, 0],
      2: [0, 0, 0, 0],
      3: [0, 0, 0, 0]
    }
  },
  shapeS: {
    vertices: [5, 6, 14, 15],
    color: 'green',
    rotationStages: {
      0: [-20, -9, 0, 11],
      1: [-1, 8, 1, 10],
      2: [1, -10, -1, -12],
      3: [20, 11, 0, -9]
    }
  },
  shapeT: {
    vertices: [4, 13, 14, 15],
    color: 'purple',
    rotationStages: {
      0: [0, 0, 0, -9],
      1: [0, 1, 1, 9],
      2: [-1, -10, -10, -10],
      3: [1, 9, 9, 10]
    }
  },
  shapeZ: {
    vertices: [4, 5, 15, 16],
    color: 'red',
    rotationStages: {
      0: [-1, -10, 1, -8],
      1: [1, 10, -1, 8],
      2: [-1, -10, 1, -8],
      3: [1, 10, -1, 8]
    }
  },
};

export default tetrisShapes;
