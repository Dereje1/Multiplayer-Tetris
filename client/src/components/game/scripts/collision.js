import tetrisShapes from './shapes';
import { gameConstants } from '../../../constants/index';

const { CELLS_PER_ROW } = gameConstants;

// Parses rubble to detect completed rows and prepare for clearing
const parseRubbleChange = (newOccupied) => {
  const parsedRubble = {};
  let hasWinners = false;
  
  newOccupied.forEach(([index, color]) => {
    const row = Math.floor(index / CELLS_PER_ROW);
    const rowEntries = parsedRubble[row] ? [...parsedRubble[row].indices, [index, color]] : [[index, color]];
    const isWinningRow = rowEntries.length === CELLS_PER_ROW;
    
    if (!hasWinners && isWinningRow) {
      hasWinners = true;
    }
    
    parsedRubble[row] = {
      indices: rowEntries,
      win: isWinningRow
    };
  });
  
  return hasWinners ? parsedRubble : null;
};

// Lowers rows above the winning rows by one position
const modifyHigherRows = (higherRows, rubble) => {
  const loweredRows = {};

  higherRows.forEach(row => {
    loweredRows[Number(row) + 1] = {
      ...rubble[row],
      indices: rubble[row].indices.map(([index, color]) => [index + CELLS_PER_ROW, color])
    };
  });

  return loweredRows;
};

// Clears completed rows and adjusts the rubble accordingly
const clearRows = (parsedRubble) => {
  let updatedRubble = { ...parsedRubble };
  const winRows = Object.keys(parsedRubble).filter(row => parsedRubble[row].win);

  winRows.sort((a, b) => Number(a) - Number(b));

  winRows.forEach(winRow => {
    const allRows = Object.keys(updatedRubble);
    const higherRows = allRows.filter(row => Number(row) < winRow);
    const loweredRows = modifyHigherRows(higherRows, updatedRubble);
    
    delete updatedRubble[allRows[0]];
    updatedRubble = {
      ...updatedRubble,
      ...loweredRows
    };
  });

  const winRubble = Object.values(updatedRubble).flatMap(row => row.indices);

  return { winRubble, winRows };
};

// Runs a collision test for the active shape
export const runCollisionTest = (state, shapeTested) => {
  const occupiedCellIndices = state.rubble.occupiedCells.map(([index]) => index);
  const testedShapeIndices = shapeTested.indices;
  const activeShapeIndices = state.activeShape.indices;
  
  const collisionDetected = testedShapeIndices.some(index => occupiedCellIndices.includes(index));
  const hitsLowerBoundary = Math.max(...testedShapeIndices) >= (200 - (state.floor.floorHeight * CELLS_PER_ROW));
  const hitsUpperBoundary = testedShapeIndices.some(index => index < 10);
  
  if (collisionDetected || hitsLowerBoundary) {
    if (hitsUpperBoundary) return 'game over';

    const coloredActiveShape = activeShapeIndices.map(index => [index, tetrisShapes.shapes[state.activeShape.name].color]);
    const newOccupied = [...state.rubble.occupiedCells, ...coloredActiveShape];
    const parsedRubble = parseRubbleChange(newOccupied);

    let collisionData = {
      rubble: { ...state.rubble, occupiedCells: newOccupied },
      points: { ...state.points },
      winRows: null
    };
    if (parsedRubble) {
      const { winRubble, winRows } = clearRows(parsedRubble);
      const totalLinesCleared = collisionData.points.totalLinesCleared + winRows.length;
      const level = Math.floor(totalLinesCleared / collisionData.points.levelUp);

      collisionData = {
        rubble: { occupiedCells: winRubble },
        points: { ...collisionData.points, totalLinesCleared, level },
        winRows
      };
    }

    return collisionData;
  }

  return null;
};

// Checks for horizontal movement obstructions
export const getSideBlock = (direction, state) => {
  const { activeShape, rubble: { occupiedCells } } = state;
  const shift = direction === 'L' ? -1 : 1;
  const forecastedIndices = activeShape.indices.map(index => index + shift);
  const occupiedIndices = occupiedCells.map(([index]) => index);

  return forecastedIndices.some(index => occupiedIndices.includes(index));
};
