import axios from 'axios';
import { game } from '../../constants/index';

const {INITIALIZE_GAME, LEVEL_UP, PAUSE,
  SET_NEXT_SHAPE, SCREEN_UPDATE, RAISE_FLOOR, COLLISION,} = game;

const setBoundry = (unitBlockSize, width, height, boundryRowHeight) => {
  const boundry = [];
  const blocksPerRow = width / unitBlockSize;
  const blocksPerColumn = height / unitBlockSize;
  for (let j = 0; j < boundryRowHeight; j += 1) {
    for (let i = 0; i < blocksPerRow; i += 1) {
      boundry.push(`${i}-${blocksPerColumn - j}`);
    }
  }
  return boundry;
};

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
  rubble: {// all screen info of rubble
    occupiedCells: [],
    winRows: null,
  },
  activeShape: {// all geometric info of active shape
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

export const gameReset = (floorHeight) => {
  initialState.rubble.boundaryCells = setBoundry(
    initialState.activeShape.unitBlockSize,
    initialState.canvas.canvasMajor.width,
    initialState.canvas.canvasMajor.height,
    floorHeight,
  );
  return (
    {
      type: INITIALIZE_GAME,
      payload: initialState,
    }
  );
};

export const speedUp = () => (
  {
    type: LEVEL_UP,
    payload: 150,
  }
);

export const pause = status => (
  {
    type: PAUSE,
    payload: status,
  }
);

export const nextShape = shape => (
  {
    type: SET_NEXT_SHAPE,
    payload: shape,
  }
);

export const updateScreen = data => (
  {
    type: SCREEN_UPDATE,
    payload: data,
  }
);

export const raiseFloor = (oldRubble, raiseBy = 1) => {
  const newFloor = getFloorRaiseBoundry(oldRubble, raiseBy);
  return (
    {
      type: RAISE_FLOOR,
      payload: {
        occupiedCells: newFloor[0],
        boundaryCells: newFloor[1],
        winRows: null,
      },
    }
  );
};

export const collide = data => (
  {
    type: COLLISION,
    payload: data,
  }
);

export const upDatedb = matchData => new Promise((resolve, reject) => {
  axios
    .post('/api/save_match', matchData)
    .then(({ data }) => {
      console.log('Data has been posted succesfully');
      resolve(data);
    })
    .catch((err) => {
      console.log(`Data has failed to post: ${err}`);
      reject(err);
    });
});
