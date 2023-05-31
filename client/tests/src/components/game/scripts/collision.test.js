import { gameStub, shapeStub } from '../../../../stub';
import { runCollisionTest, getSideBlock } from "../../../../../src/components/game/scripts/collision";

describe('collisions', () => {
    let args;
    afterEach(() => {
        args = null
    })
    test('will return null if no collision detected', () => {
        args = [gameStub, shapeStub]
        const ans = runCollisionTest(...args)
        expect(ans).toBe(null)
    })
    test('will detect a collision for game over', () => {
        const updatedGame = {
            ...gameStub,
            rubble: {
                ...gameStub.rubble,
                occupiedCells: [
                    [
                        1,
                        "yellow"
                    ],
                    [
                        11,
                        "yellow"
                    ],
                    [
                        21,
                        "yellow"
                    ],
                    [
                        31,
                        "yellow"
                    ]
                ]
            }
        }
        const updatedShapeLocation = {
            ...shapeStub,
        }
        args = [updatedGame, updatedShapeLocation]
        const ans = runCollisionTest(...args)
        expect(ans).toEqual('game over')
    })
    test('will detect a collision for no lines cleared', () => {
        const updatedShapeLocation = {
            ...shapeStub,
            indices: [201, 202, 203, 204]
        }
        args = [gameStub, updatedShapeLocation]
        const ans = runCollisionTest(...args)
        expect(ans).toEqual(
            {
                rubble: {
                    occupiedCells: [],
                },
                points: { totalLinesCleared: 0, level: 0, levelUp: 5 },
                winRows: null
            },
        )
    })
    test('will detect a collision for lines cleared', () => {
        const updatedGame = {
            ...gameStub,
            rubble: {
                ...gameStub.rubble,
                occupiedCells: [
                    [
                        190,
                        "yellow"
                    ],
                    [
                        191,
                        "yellow"
                    ],
                    [
                        192,
                        "yellow"
                    ],
                    [
                        193,
                        "yellow"
                    ],
                    [
                        194,
                        "yellow"
                    ],
                    [
                        195,
                        "yellow"
                    ],
                    [
                        196,
                        "yellow"
                    ],
                    [
                        197,
                        "yellow"
                    ],
                    [
                        198,
                        "yellow"
                    ],
                ]
            },
            activeShape: {
                ...gameStub.activeShape,
                indices: [159, 169, 179, 199]
            }
        }
        const updatedShapeLocation = {
            ...shapeStub,
            indices: [179, 189, 199, 209]
        }
        args = [updatedGame, updatedShapeLocation]
        const ans = runCollisionTest(...args)
        expect(ans).toEqual(
            {
                rubble: {
                    occupiedCells: [
                        [169, 'red'],
                        [179, 'red'],
                        [189, 'red'],
                        [190, 'yellow'],
                        [191, 'yellow'],
                        [192, 'yellow'],
                        [193, 'yellow'],
                        [194, 'yellow'],
                        [195, 'yellow'],
                        [196, 'yellow'],
                        [197, 'yellow'],
                        [198, 'yellow'],
                        [199, 'red']
                    ],
                },
                points: { totalLinesCleared: 1, level: 0, levelUp: 5 },
                winRows: ['19']
            }
        )
    })
})

describe('side block obstructions', () => {
    test('will detect left move obstructions', () => {
        const updatedGame = {
            ...gameStub,
            rubble: {
                ...gameStub.rubble,
                occupiedCells: [
                    [
                        180,
                        "yellow"
                    ],
                    [
                        190,
                        "yellow"
                    ]
                ]
            },
            activeShape: {
                ...gameStub.activeShape,
                indices: [181, 182, 183, 184]
            }
        }
        const ans = getSideBlock('L', updatedGame)
        expect(ans).toBe(true)
    })
    test('will detect right move obstructions', () => {
        const updatedGame = {
            ...gameStub,
            rubble: {
                ...gameStub.rubble,
                occupiedCells: [
                    [
                        185,
                        "yellow"
                    ],
                    [
                        195,
                        "yellow"
                    ]
                ]
            },
            activeShape: {
                ...gameStub.activeShape,
                indices: [181, 182, 183, 184]
            }
        }
        const ans = getSideBlock('R', updatedGame)
        expect(ans).toBe(true)
    })
    test('will detect no obstructions', () => {
        const updatedGame = {
            ...gameStub,
            rubble: {
                ...gameStub.rubble,
                occupiedCells: [
                    [
                        "8-16",
                        "yellow"
                    ]
                ]
            },
            activeShape: {
                ...gameStub.activeShape,
                cells: [
                    [
                        4,
                        17
                    ],
                    [
                        5,
                        17
                    ],
                    [
                        6,
                        17
                    ],
                    [
                        7,
                        17
                    ]
                ]
            }
        }
        const ans = getSideBlock('R', updatedGame)
        expect(ans).toBe(false)
    })
})