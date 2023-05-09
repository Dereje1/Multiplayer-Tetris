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
    return shapeList[randNum];
  },
  onRotate: ({ activeShape, width }) => {
    const { name, indices, rotationStage } = activeShape

    const newRotationStage = rotationStage > 2 ? 0 : rotationStage + 1;
    const transformation = tetrisShapes[name].rotationStages[newRotationStage]
    const transformedIndices = indices.map((v, idx) => v + transformation[idx])

    if (!isContiguous({
      indices: transformedIndices,
      width,
      cellSize: activeShape.unitBlockSize
    })) return activeShape;

    return {
      ...activeShape,
      indices: transformedIndices,
      rotationStage: newRotationStage
    }
  },
  initializeShape(shapeName, game) {
    // finding intital y bound so it does not get cutoff
    const x = (shapeName !== 'shapeI' && shapeName !== 'shapeO')
      ? (game.canvas.canvasMajor.width / 2) + (game.activeShape.unitBlockSize / 2)
      : game.canvas.canvasMajor.width / 2;

    const activeShape = {
      name: shapeName,
      unitBlockSize: 30,
      indices: this[shapeName].indices,
      rotationStage: 0,
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
    indices: [3, 4, 5, 6],
    color: 'cyan',
    rotationStages: {
      0: [-2, -11, -20, -29],
      1: [2, 11, 20, 29],
      2: [-2, -11, -20, -29],
      3: [2, 11, 20, 29]
    }
  },
  shapeJ: {
    indices: [3, 13, 14, 15],
    color: 'blue',
    rotationStages: {
      0: [-2, -2, -11, -9],
      1: [1, -8, 0, 9],
      2: [-1, -1, -9, -9],
      3: [2, 11, 20, 9]
    }
  },
  shapeL: {
    indices: [5, 13, 14, 15],
    color: 'orange',
    rotationStages: {
      0: [1, 8, -1, -10],
      1: [-1, 1, 10, 10],
      2: [-1, -10, -19, -12],
      3: [1, 1, 10, 12]
    }
  },
  shapeO: {
    indices: [4, 5, 14, 15],
    color: 'yellow',
    rotationStages: {
      0: [0, 0, 0, 0],
      1: [0, 0, 0, 0],
      2: [0, 0, 0, 0],
      3: [0, 0, 0, 0]
    }
  },
  shapeS: {
    indices: [5, 6, 14, 15],
    color: 'green',
    rotationStages: {
      0: [-20, -9, 0, 11],
      1: [-1, 8, 1, 10],
      2: [1, -10, -1, -12],
      3: [20, 11, 0, -9]
    }
  },
  shapeT: {
    indices: [4, 13, 14, 15],
    color: 'purple',
    rotationStages: {
      0: [0, 0, 0, -9],
      1: [0, 1, 1, 9],
      2: [-1, -10, -10, -10],
      3: [1, 9, 9, 10]
    }
  },
  shapeZ: {
    indices: [4, 5, 15, 16],
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
