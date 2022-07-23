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
                        "3-1",
                        "yellow"
                    ],
                    [
                        "4-1",
                        "yellow"
                    ],
                    [
                        "5-1",
                        "yellow"
                    ],
                    [
                        "6-1",
                        "yellow"
                    ]
                ]
            }
        }
        const updatedShapeLocation = {
            ...shapeStub,
            cells: [
                [
                    3,
                    1
                ],
                [
                    4,
                    1
                ],
                [
                    5,
                    1
                ],
                [
                    6,
                    1
                ]
            ]
        }
        args = [updatedGame, updatedShapeLocation]
        const ans = runCollisionTest(...args)
        expect(ans).toEqual([])
    })
    test('will detect a collision for no lines cleared', () => {
        const updatedShapeLocation = {
            ...shapeStub,
            cells: [
                [
                    3,
                    20
                ],
                [
                    4,
                    20
                ],
                [
                    5,
                    20
                ],
                [
                    6,
                    20
                ]
            ]
        }
        args = [gameStub, updatedShapeLocation]
        const ans = runCollisionTest(...args)
        expect(ans).toEqual([
            {
                rubble: {
                    occupiedCells: [],
                    winRows: null,
                    boundaryCells: [
                        '0-20', '1-20',
                        '2-20', '3-20',
                        '4-20', '5-20',
                        '6-20', '7-20',
                        '8-20', '9-20'
                    ]
                },
                points: { totalLinesCleared: 0, level: 0, levelUp: 5 }
            },
            null,
            4
        ])
    })
    test('will detect a collision for lines cleared', () => {
        const updatedGame = {
            ...gameStub,
            rubble: {
                ...gameStub.rubble,
                occupiedCells: [
                    [
                        "0-19",
                        "yellow"
                    ],
                    [
                        "1-19",
                        "yellow"
                    ],
                    [
                        "5-19",
                        "yellow"
                    ],
                    [
                        "0-18",
                        "yellow"
                    ],
                    [
                        "1-18",
                        "yellow"
                    ],
                    [
                        "2-18",
                        "yellow"
                    ],
                    [
                        "3-18",
                        "yellow"
                    ],
                    [
                        "4-18",
                        "yellow"
                    ],
                    [
                        "5-18",
                        "yellow"
                    ],
                    [
                        "6-18",
                        "yellow"
                    ],
                    [
                        "7-18",
                        "yellow"
                    ],
                    [
                        "8-18",
                        "yellow"
                    ],
                    [
                        "9-18",
                        "yellow"
                    ],
                    [
                        "8-17",
                        "yellow"
                    ],
                    [
                        "9-17",
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
        const updatedShapeLocation = {
            ...shapeStub,
            cells: [
                [
                    4,
                    18
                ],
                [
                    5,
                    18
                ],
                [
                    6,
                    18
                ],
                [
                    7,
                    18
                ]
            ]
        }
        args = [updatedGame, updatedShapeLocation]
        const ans = runCollisionTest(...args)
        expect(ans).toEqual([
            {
                rubble: {
                    occupiedCells: [
                        ['0-19', 'yellow'],
                        ['1-19', 'yellow'],
                        ['5-19', 'yellow'],
                        ['8-18', 'yellow'],
                        ['9-18', 'yellow'],
                        ['4-18', 'red'],
                        ['5-18', 'red'],
                        ['6-18', 'red'],
                        ['7-18', 'red']
                    ],
                    winRows: [18],
                    boundaryCells: [
                        '0-20', '1-20',
                        '2-20', '3-20',
                        '4-20', '5-20',
                        '6-20', '7-20',
                        '8-20', '9-20'
                    ]
                },
                points: { totalLinesCleared: 1, level: 0, levelUp: 5 }
            },
            [18],
            0
        ])
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
                        "3-17",
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
                        "8-17",
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