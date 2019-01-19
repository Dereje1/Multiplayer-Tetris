const tetrisShapes = {
  getRandShapeName: () => {
    const shapeList = ['shapeL', 'shapeZ', 'shapeT', 'shapeI', 'shapeJ', 'shapeO', 'shapeS'];
    const randNum = Math.floor(Math.random() * (shapeList.length));
    return shapeList[randNum];
  },
  getDims: (activeShape) => {
    const absoluteVertices = tetrisShapes.getAbsoluteVertices(
      activeShape.unitBlockSize,
      activeShape.xPosition,
      activeShape.yPosition,
      activeShape.unitVertices,
    );

    return [tetrisShapes.onBoundingBox(absoluteVertices), absoluteVertices];
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
  shapeI: {
    vertices: [[-1, 0], [-2, 0], [-2, -1], [-1, -1], [0, -1], [1, -1], [2, -1], [2, 0], [1, 0]],
    color: 'cyan',
  },
  shapeJ: {
    vertices: [[-0.5, 0.5], [-1.5, 0.5], [-1.5, -0.5], [-1.5, -1.5],
      [-0.5, -1.5], [-0.5, -0.5], [0.5, -0.5], [1.5, -0.5], [1.5, 0.5], [0.5, 0.5], [-0.5, 0.5]],
    color: 'blue',
  },
  shapeL: {
    vertices: [[0.5, 0.5], [1.5, 0.5], [1.5, -0.5], [1.5, -1.5],
      [0.5, -1.5], [0.5, -0.5], [-0.5, -0.5], [-1.5, -0.5], [-1.5, 0.5], [-0.5, 0.5], [0.5, 0.5]],
    color: 'orange',
  },
  shapeO: {
    vertices: [[0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1]],
    color: 'yellow',
  },
  shapeS: {
    vertices: [[-0.5, 0.5], [-1.5, 0.5], [-1.5, -0.5], [-0.5, -0.5],
      [-0.5, -1.5], [0.5, -1.5], [1.5, -1.5], [1.5, -0.5], [0.5, -0.5], [0.5, 0.5], [-0.5, 0.5]],
    color: 'green',
  },
  shapeT: {
    vertices: [[0, 0.5], [0.5, 0.5], [1.5, 0.5], [1.5, -0.5],
      [0.5, -0.5], [0.5, -1.5], [-0.5, -1.5], [-0.5, -0.5],
      [-1.5, -0.5], [-1.5, 0.5], [-0.5, 0.5], [0, 0.5]],
    color: 'purple',
  },
  shapeZ: {
    vertices: [[0.5, 0.5], [1.5, 0.5], [1.5, -0.5], [0.5, -0.5],
      [0.5, -1.5], [-0.5, -1.5], [-1.5, -1.5], [-1.5, -0.5],
      [-0.5, -0.5], [-0.5, 0.5], [0.5, 0.5]],
    color: 'red',
  },
};

export default tetrisShapes;
