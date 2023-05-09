import tetrisShapes from './shapes';


const parseRubbleChange = (newOccupied) => {
  const CELLS_PER_ROW = 10;
  const parsedRubble = {}
  newOccupied.forEach((cell) => {
    const row = Math.floor(cell[0] / CELLS_PER_ROW);
    const indices = parsedRubble[row] ? [...parsedRubble[row].indices, cell] : [cell]
    parsedRubble[row] = {
      indices,
      win: indices.length === CELLS_PER_ROW ? true : false
    }
  });

  let hasWinners = false;
  for (const row of Object.keys(parsedRubble)) {
    if (parsedRubble[row].win) {
      hasWinners = true;
      break;
    }
  }

  return hasWinners && parsedRubble;
};


const modifyHigherRows = (higherRows, rubble) => {
  const loweredRows = Object.keys(rubble)
    .filter(key => higherRows.includes(key))
    .reduce((acc, key) => {
      acc[Number(key) + 1] = {
        ...rubble[key],
        indices: rubble[key].indices.map(val => [val[0] + 10, val[1]])
      }
      return acc;
    }, {})

  return loweredRows;
}

const clearRows = (parsedRubble) => {
  let updatedRubble = { ...parsedRubble };
  const winRows = Object.keys(parsedRubble).filter(row => Boolean(parsedRubble[row].win))
  for (const row of winRows) {
    const allRows = Object.keys(updatedRubble)
    const higherRows = allRows.filter(r => r < row)
    if (higherRows.length) {
      const loweredRows = modifyHigherRows(higherRows, updatedRubble);
      delete updatedRubble[allRows[0]]
      updatedRubble = {
        ...updatedRubble,
        ...loweredRows
      }
    } else {
      delete updatedRubble[allRows[0]]
    }
  }

  const newRubble = Object.keys(updatedRubble).reduce((acc, row) => {
    const { indices } = updatedRubble[row]
    return [...acc, ...indices]
  }, [])

  return {
    newRubble,
    winRows
  };
};

export const runCollisionTest = (state, shapeTested, floorTest = false) => {
  const occupiedCellLocations = floorTest
    ? floorTest[0].map(c => c[0])
    : state.rubble.occupiedCells.map((o) => o[0]);
  // shape to test for collison
  const testedShape = [...shapeTested.indices];
  // currently active shape
  let preCollisionShape = [...state.activeShape.indices];
  // game play area occupied cells
  const isOccupied = testedShape.filter(c => (occupiedCellLocations.includes(c)));
  // bottom boundary occupied cells
  const isLowerBoundary = Math.max(...testedShape) > 199;
  // upperBoundary ocupied cells
  const isUpperBoundary = testedShape.filter(c => c >= 0 && c <= 19);
  if (isOccupied.length || isLowerBoundary) { // collision detected
    if (isUpperBoundary.length) return [];// game over
    let collisionData;
    // add color info to active shape
    preCollisionShape = preCollisionShape.map(c => [c, tetrisShapes[state.activeShape.name].color]);
    // add active shaped to occupied cells
    const newOccupied = [...state.rubble.occupiedCells, ...preCollisionShape];
    const parsedRubble = parseRubbleChange(newOccupied);
    const copyOfRubble = Object.assign({}, state.rubble);
    const copyOfPoints = Object.assign({}, state.points);
    if (parsedRubble) {
      // assign points if winner found
      const {
        newRubble,
        winRows
      } = clearRows(parsedRubble);

      copyOfRubble.occupiedCells = newRubble
      copyOfPoints.totalLinesCleared = state.points.totalLinesCleared + winRows.length;
      copyOfPoints.level = Math.floor(copyOfPoints.totalLinesCleared / (state.points.levelUp));

      collisionData = {
        rubble: copyOfRubble,
        points: copyOfPoints,
      };
      // winner return
      return [collisionData, winRows, isLowerBoundary.length];
    }
    copyOfRubble.occupiedCells = newOccupied;
    collisionData = {
      rubble: copyOfRubble,
      points: copyOfPoints, // unchanged
    };
    // plain collision return
    return [collisionData, null, isLowerBoundary.length];
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
