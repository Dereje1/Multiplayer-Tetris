import { game } from '../../constants/index';

const {
  INITIALIZE_GAME, RAISE_FLOOR,
} = game;

const initialState = { // determine what needs to go into state, a very small portion here
  timerInterval: 700,
  paused: true,
  nextShape: '',
  canvas: {
    canvasMajor: {
      width: 300,
      height: 600,
    },
    canvasMinor: {
      width: 210,
      height: 150,
    },
  },
  points: {
    totalLinesCleared: 0,
    level: 0,
    levelUp: 5,
  },
  rubble: { // all screen info of rubble
    occupiedCells: [],
    winRows: null,
  },
  activeShape: { // all geometric info of active shape
    name: 'shapeZ',
    unitBlockSize: 30,
    xPosition: 0,
    yPosition: 0,
    unitVertices: [],
    absoluteVertices: [],
    boundingBox: [],
    rotationStage: 0,
    cells: [],
  },
};

// Utility functions to transform payload
const setBoundry = (unitBlockSize, width, height, boundryRowHeight) => {
  const boundry = [];
  const blocksPerRow = width / unitBlockSize;
  for (let i = 0; i < blocksPerRow; i += 1) {
    boundry.push(200 + i);
  }
  return boundry;
};

export const getFloorRaiseBoundry = (oldRubble, raiseBy = 1) => {
  const newOccupied = oldRubble.occupiedCells.map((c) => {
    const oldY = Number(c[0].split('-')[1]);
    const oldX = Number(c[0].split('-')[0]);
    return ([`${oldX}-${oldY - raiseBy}`, c[1]]);
  });

  const yBoundary = oldRubble.boundaryCells.map(c => Number(c.split('-')[1]));
  const oldHeight = Array.from(new Set(yBoundary)).length;
  const newBoundary = setBoundry(
    initialState.activeShape.unitBlockSize,
    initialState.canvas.canvasMajor.width,
    initialState.canvas.canvasMajor.height,
    oldHeight + raiseBy,
  );
  return [newOccupied, newBoundary];
};
// Actions with transform != null will update payload here
const updatePayload = (type, payload, transfom) => {
  switch (type) {
    case RAISE_FLOOR: {
      const newFloor = getFloorRaiseBoundry(payload, transfom.raiseBy);
      return {
        occupiedCells: newFloor[0],
        boundaryCells: newFloor[1],
        winRows: null,
      };
    }
    case INITIALIZE_GAME: {
      initialState.rubble.boundaryCells = setBoundry(
        initialState.activeShape.unitBlockSize,
        initialState.canvas.canvasMajor.width,
        initialState.canvas.canvasMajor.height,
        payload,
      );
      return initialState;
    }
    default:
      return payload;
  }
};

export const GameActions = (type, payload, transfom = null) => (
  {
    type,
    payload: transfom ? updatePayload(type, payload, transfom) : payload,
  }
);
