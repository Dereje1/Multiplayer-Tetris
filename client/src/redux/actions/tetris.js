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
  },
  activeShape: { // all geometric info of active shape
    name: 'shapeZ',
    unitBlockSize: 30,
    indices: [],
    rotationStage: 0,
  },
  floor: {
    floorHeight: 0,
    floorIndices: []
  }
};

export const getFloorRaiseBoundry = (game, raiseBy = 1) => {
  const { rubble, floor: { floorHeight } } = game;
  const newFloorHeight = floorHeight + raiseBy;
  const raisedOccupiedCells = rubble.occupiedCells.map(([index, color]) => {
    const newIndex = index - (10 * raiseBy)
    return [newIndex, color];
  });

  const floorIndices = [];
  const maxCells = 199;
  for (let indices = maxCells; indices > (maxCells - (newFloorHeight * 10)); indices -= 1) {
    floorIndices.push(indices)
  }
  return { raisedOccupiedCells, floorIndices, floorHeight: newFloorHeight };
};
// Actions with transform != null will update payload here
const updatePayload = (type, payload) => {
  switch (type) {
    case RAISE_FLOOR: {
      const { raisedOccupiedCells, floorIndices, floorHeight } = getFloorRaiseBoundry(payload);
      return {
        rubble: {
          occupiedCells: raisedOccupiedCells,
        },
        floor: {
          floorHeight,
          floorIndices
        }
      };
    }
    case INITIALIZE_GAME: {
      return {
        ...initialState,
        ...payload
      };
    }
    default:
      return payload;
  }
};

export const GameActions = (type, payload) => (
  {
    type,
    payload: updatePayload(type, payload),
  }
);
