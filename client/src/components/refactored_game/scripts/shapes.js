const tetrisShapes = {
  getRandShapeName: () => {
    const shapeList = ['shapeL', 'shapeZ', 'shapeT', 'shapeI', 'shapeJ', 'shapeO', 'shapeS'];
    const randNum = Math.floor(Math.random() * (shapeList.length));
    return shapeList[randNum];
  },
  getDims(activeShape) {
    const absoluteVertices = this.getAbsoluteVertices(
      activeShape.unitBlockSize,
      activeShape.xPosition,
      activeShape.yPosition,
      activeShape.unitVertices,
    );

    return [this.onBoundingBox(absoluteVertices), absoluteVertices];
  },
  onRotate: (oldVertices) => {
    /*
        Trig coordinate transformation formula
        x′=(x−p)cos(θ)−(y−q)sin(θ)+p,
        y′=(x−p)sin(θ)+(y−q)cos(θ)+q.
        where (p,q) point of rotation, and (x,y) are the pre-transformed points
        https://math.stackexchange.com/questions/270194/how-to-find-the-vertices-angle-after-rotation

        can reduce above formula since θ will always = 90 , so,
        x′= q - y + p
        y′= x − p + q
        and since canvas will start drawing at origin = point of rotation, (p,q) = (0,0)
        x′= -y
        y′= x
    */
    const newVertices = oldVertices.map((v) => {
      const xPrime = -v[1];
      const yPrime = v[0];
      return [xPrime, yPrime];
    });
    return newVertices;
  },
  onBoundingBox: (absoluteVertices) => {
    const xArr = absoluteVertices.map(v => v[0]);
    const yArr = absoluteVertices.map(v => v[1]);
    return [Math.min(...xArr), Math.max(...xArr), Math.min(...yArr), Math.max(...yArr)];
  },
  getAbsoluteVertices: (blockSize, x, y, unitVertices) => (
    unitVertices.map(v => [x + (v[0] * blockSize), y + (v[1] * blockSize)])
  ),
  initializeShape(shapeName, game) {
    // finding intital y bound so it does not get cutoff
    const x = (shapeName !== 'shapeI' && shapeName !== 'shapeO')
      ? (game.canvas.canvasMajor.width / 2) + (game.activeShape.unitBlockSize / 2)
      : game.canvas.canvasMajor.width / 2;

    const initialAbsoluteVertices = this.getAbsoluteVertices(
      game.activeShape.unitBlockSize,
      x,
      0,
      this[shapeName].vertices,
    );

    const initialBoundingBox = this.onBoundingBox(initialAbsoluteVertices);
    const activeShape = {
      name: shapeName,
      unitBlockSize: 30,
      xPosition: x,
      yPosition: -1 * initialBoundingBox[2],
      unitVertices: this[shapeName].vertices,
      absoluteVertices: initialAbsoluteVertices,
      boundingBox: initialBoundingBox,
      rotationStage: 0,
      cells: [],
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
    vertices: [3,4,5,6],
    color: 'cyan',
  },
  shapeJ: {
    vertices: [3,13,14,15],
    color: 'blue',
  },
  shapeL: {
    vertices: [5,13,14,15],
    color: 'orange',
  },
  shapeO: {
    vertices: [4,5,14,15],
    color: 'yellow',
  },
  shapeS: {
    vertices: [5,6,14,15],
    color: 'green',
  },
  shapeT: {
    vertices: [4,13,14,15],
    color: 'purple',
  },
  shapeZ: {
    vertices: [3,4,14,15],
    color: 'red',
  },
};

export default tetrisShapes;
