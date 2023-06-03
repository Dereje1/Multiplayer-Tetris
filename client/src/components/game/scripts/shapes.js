import { gameConstants } from "../../../constants";

const { CELLS_PER_ROW } = gameConstants

const tetrisShapes = {
  getRandShapeName() {
    const shapeList = Object.keys(this.shapes);
    const randNum = Math.floor(Math.random() * (shapeList.length));
    return shapeList[randNum];
  },
  // given an index will return coordinates on canvas
  getCoordinatesFromIndex({ index, cellSize }) {
    const row = Math.floor(index / CELLS_PER_ROW);
    const column = index % CELLS_PER_ROW;
    const x = column * cellSize;
    const y = row * cellSize;
    return [x, y];
  },
  // tests contiguity in x direction of tetrimino
  isContiguous({
    indices,
    cellSize
  }) {

    const xCoordinates = indices.map(idx => this.getCoordinatesFromIndex({ index: idx, cellSize })[0])
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
  },
  onRotate({ activeShape }) {
    const { name, indices, rotationStage } = activeShape

    const newRotationStage = rotationStage > 2 ? 0 : rotationStage + 1;
    const transformation = this.shapes[name].rotationStages[newRotationStage]
    const transformedIndices = indices.map((v, idx) => v + transformation[idx])

    if (!this.isContiguous({
      indices: transformedIndices,
      cellSize: activeShape.unitBlockSize
    })) return activeShape;

    return {
      ...activeShape,
      indices: transformedIndices,
      rotationStage: newRotationStage
    }
  },
  initializeShape(shapeName) {
    const activeShape = {
      name: shapeName,
      unitBlockSize: 30,
      indices: this.shapes[shapeName].indices.map(idx => idx - 10), // move cells up to start at canvas top
      rotationStage: 0,
    };
    return activeShape;
  },
  createNewShape(game) {
    const randomShape = game.nextShape
      ? this.initializeShape(game.nextShape)
      : this.initializeShape(this.getRandShapeName());
    const newShapeName = this.getRandShapeName();
    const nextShapeInfo = this.initializeShape(newShapeName);
    return { randomShape, newShapeName, nextShapeInfo };
  },
  shapes: {
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
  },
};

export default tetrisShapes;
