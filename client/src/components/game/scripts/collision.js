import tetrisShapes from './shapes';

// turn rubble into object to ease parsing of winners
const parseRubbleChange = (newOccupied) => {
  const CELLS_PER_ROW = 10;
  const parsedRubble = {}
  let hasWinners = false;
  newOccupied.forEach((cell) => {
    const row = Math.floor(cell[0] / CELLS_PER_ROW);
    const indices = parsedRubble[row] ? [...parsedRubble[row].indices, cell] : [cell]
    const win = indices.length === CELLS_PER_ROW
    // turn true for first winner in occupied cells
    if (!hasWinners && win) {
      hasWinners = true;
    }
    parsedRubble[row] = {
      indices,
      win
    }
  });
  return hasWinners && parsedRubble;
};

// lowers all rows that are higher than the winning row
const modifyHigherRows = (higherRows, rubble) => {
  const loweredRows = Object.keys(rubble)
    .filter(key => higherRows.includes(key))
    .reduce((acc, key) => {
      acc[Number(key) + 1] = {
        ...rubble[key],
        indices: rubble[key].indices.map(([index, color]) => [index + 10, color])
      }
      return acc;
    }, {})
  return loweredRows;
}

const clearRows = (parsedRubble) => {
  let updatedRubble = { ...parsedRubble };
  const winRows = Object.keys(parsedRubble).filter(row => Boolean(parsedRubble[row].win))
  winRows.sort((a, b) => Number(a) - Number(b))
  for (const winRow of winRows) {
    const allRows = Object.keys(updatedRubble)
    const higherRows = allRows.filter(r => Number(r) < winRow)
    const loweredRows = modifyHigherRows(higherRows, updatedRubble);
    // delete top row and merge lowered rows
    delete updatedRubble[allRows[0]]
    updatedRubble = {
      ...updatedRubble,
      ...loweredRows
    }
  }
  // reassemble rubble into original config
  const winRubble = Object.keys(updatedRubble).reduce((acc, row) => {
    const { indices } = updatedRubble[row]
    return [...acc, ...indices]
  }, [])

  return {
    winRubble,
    winRows
  };
};

export const runCollisionTest = (state, shapeTested) => {
  const occupiedCellLocations = state.rubble.occupiedCells.map(([index]) => index);
  // shape to test for collison
  const testedShape = [...shapeTested.indices];
  // currently active shape
  let preCollisionShape = [...state.activeShape.indices];
  // game play area occupied cells
  const isOccupied = testedShape.filter(c => (occupiedCellLocations.includes(c)));
  // bottom boundary occupied cells
  const isLowerBoundary = Math.max(...testedShape) > (199 - (state.floor.floorHeight * 10));
  // upperBoundary ocupied cells
  const isUpperBoundary = testedShape.filter(c => c <= 9);
  if (isOccupied.length || isLowerBoundary) { // collision detected
    if (isUpperBoundary.length) return 'game over';// game over
    // add color info to active shape
    preCollisionShape = preCollisionShape.map(c => [c, tetrisShapes[state.activeShape.name].color]);
    // add active shape to occupied cells
    const newOccupied = [...state.rubble.occupiedCells, ...preCollisionShape];

    const parsedRubble = parseRubbleChange(newOccupied);
    //object to update redux store with
    // plain collision return
    let collisionData = {
      rubble: {
        ...state.rubble,
        occupiedCells: newOccupied
      },
      points: { ...state.points }, // unchanged
      winRows: null
    };

    if (parsedRubble) { // winning row/s found
      const {
        winRubble,
        winRows
      } = clearRows(parsedRubble);

      const totalLinesCleared = collisionData.points.totalLinesCleared + winRows.length;
      const level = Math.floor(totalLinesCleared / (collisionData.points.levelUp))
       // winner return
      collisionData = {
        rubble: {
          occupiedCells: winRubble
        },
        points: {
          ...collisionData.points,
          totalLinesCleared,
          level
        },
        winRows
      };      
    }
    return collisionData;
  }
  return null; // no collision return
};


export const getSideBlock = (direction, state) => {
  // checks for player x-direction movement obstructions
  const { activeShape, rubble: { occupiedCells } } = state;
  const foreCastedIndices = activeShape.indices.map((idx) => direction === 'L' ? idx - 1 : idx + 1);
  const occupiedIndices = occupiedCells.map(c => c[0])
  for (const index of foreCastedIndices) {
    if (occupiedIndices.includes(index)) return true
  }
  return false
};
