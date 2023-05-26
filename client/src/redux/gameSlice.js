import { createSlice } from '@reduxjs/toolkit';
import { game } from '../constants/index';

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
const {
  INITIALIZE_GAME, RAISE_FLOOR,
} = game;

export const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    INITIALIZE_GAME: (state, action) => action.payload,
    LEVEL_UP: (state, action) => {
      state.timerInterval = state.timerInterval - action.payload
    },
    PAUSE: (state, action) => {
      state.paused = action.payload
    },
    SET_NEXT_SHAPE: (state, action) => {
      state.nextShape = action.payload
    },
    SCREEN_UPDATE: (state, action) => ({ ...state, ...action.payload }),
    RAISE_FLOOR: (state, action) => {
      state.rubble = action.payload.rubble
      state.floor = action.payload.floor
    },
    COLLISION: (state, action) => {
      state.rubble = action.payload.rubble
      state.points = action.payload.points
    },
  },
});

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

export const GameActions = (type, payload) => gameSlice.actions[type](updatePayload(type, payload));



export default gameSlice.reducer;