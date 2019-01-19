import tetrisShapes from './shapes';


const winCheck = (newOccupied, state) => {
  // get a Ycoordinate array from occupied cells
  const yCoord = newOccupied.map(c => Number(c[0].split('-')[1]));
  // find unique y coordinates
  const yUnique = Array.from(new Set(yCoord));
  // find how amny elements per row
  const rowSize = state.canvas.canvasMajor.width / state.activeShape.unitBlockSize;
  const winners = [];
  // test if new state would have a winnable row by comparing occupation with row size
  yUnique.forEach((u) => {
    let counter = 0;
    yCoord.forEach((c) => {
      if (c === u)counter += 1;
    });
    if (counter === rowSize) winners.push(u);
  });
  return winners;
};


const fillBlankRows = (occupied, state) => {
  // Isolate cell coordinates
  const xyCoord = occupied.map(c => c[0]);
  // Isolate Y values of cell coordinates
  const yCoord = xyCoord.map(y => Number(y.split('-')[1]));
  // find max height of all the occupied cells (since canvas positive y is down use min)
  const heightOccupied = Math.min(...yCoord);
  const screenWidth = (state.canvas.canvasMajor.width / state.activeShape.unitBlockSize) - 1;
  let boundaryHeight = state.rubble.boundaryCells.map(c => Number(c.split('-')[1]));
  boundaryHeight = Math.min(...boundaryHeight) - 1;
  let blankFound;
  // scan thru all the potential cells within occupied
  for (let y = heightOccupied; y <= boundaryHeight; y += 1) {
    if (blankFound) break;
    for (let x = 0; x <= screenWidth; x += 1) {
      const testCoord = `${x}-${y}`;
      // row is not empty so just go to next row
      if (xyCoord.includes(testCoord)) break;
      // row is empty , save empty row number and exit out of loop
      if (!xyCoord.includes(testCoord) && x === screenWidth)blankFound = y;
    }
  }

  // If an emmpty row is found scoot down the next contingent row above
  if (blankFound) {
    const newOccupied = [];
    occupied.forEach((c) => {
      const oldY = Number(c[0].split('-')[1]);
      if (oldY === (blankFound - 1)) {
        const oldX = Number(c[0].split('-')[0]);
        newOccupied.push([`${oldX}-${oldY + 1}`, c[1]]);
      } else {
        newOccupied.push(c);
      }
    });
    // recursively run function again to fill any other blank rows
    return fillBlankRows(newOccupied, state);
  }

  return occupied;
};

const clearRows = (occupied, winners, state) => {
  let w = 0;
  // separated call back to avoid CRA lint error for 'calling function within while loop'
  const winnerRowcallBack = (oCell) => {
    const occupiedY = Number(oCell[0].split('-')[1]);
    return occupiedY === winners[w];
  };
    // remove all winninig rows
  while (w < winners.length) {
    // find index and splice(mutate) each cell occupied
    const indexOfOccupied = occupied.findIndex(winnerRowcallBack);
    occupied.splice(indexOfOccupied, 1);
    // check if more of the winning row cells remain
    const checkO = occupied.filter(winnerRowcallBack);
    // if all cells of winning row are removed then go to next winning row
    if (!checkO.length)w += 1;
  }
  // run function to recursively fill the blank rows
  return fillBlankRows(occupied, state);
};

export const runCollisionTest = (state, shapeTested) => {
  const occupiedCellLocations = state.rubble.occupiedCells.map(c => c[0]);
  // shape to test for collison
  const testedShape = shapeTested.cells.map(c => c.join('-'));
  // currently active shape
  let preCollisionShape = state.activeShape.cells.map(c => c.join('-'));
  // game play area occupied cells
  const isOccupied = testedShape.filter(c => (occupiedCellLocations.includes(c)));
  // bottom boundary occupied cells
  const isLowerBoundary = testedShape.filter(c => (state.rubble.boundaryCells.includes(c)));
  // upperBoundary ocupied cells
  const isUpperBoundary = shapeTested.cells.filter(c => c[1] === 0);
  if (isOccupied.length || isLowerBoundary.length) { // collision detected
    if (isUpperBoundary.length) return [];// game over
    let collisionData;
    // add color info to active shape
    preCollisionShape = preCollisionShape.map(c => [c, tetrisShapes[state.activeShape.name].color]);
    // add active shaped to occupied cells
    const newOccupied = [...state.rubble.occupiedCells, ...preCollisionShape];
    // test for winner
    const winners = winCheck(newOccupied, state);
    const copyOfRubble = Object.assign({}, state.rubble);
    const copyOfPoints = Object.assign({}, state.points);
    if (winners.length) {
      // assign points if winner found
      copyOfPoints.totalLinesCleared = state.points.totalLinesCleared + winners.length;
      copyOfPoints.level = Math.floor(copyOfPoints.totalLinesCleared /
       (state.points.levelUp));
      // assign new rubble coordinates
      copyOfRubble.occupiedCells = clearRows(newOccupied, winners, state);
      copyOfRubble.winRows = winners;

      collisionData = {
        rubble: copyOfRubble,
        points: copyOfPoints,
      };
      // winner return
      return [collisionData, winners, isLowerBoundary.length];
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
  const cellCheck = state.activeShape.cells.map((c) => {
    if (direction === 'L') {
      return [c[0] - 1, c[1]].join('-');
    }
    return [c[0] + 1, c[1]].join('-');
  });
  const occupiedCellLocations = state.rubble.occupiedCells.map(c => c[0]);
  const blocked = cellCheck.filter(c => occupiedCellLocations.includes(c));
  return !!blocked.length;
};
