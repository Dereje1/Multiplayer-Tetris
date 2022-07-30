export const gameStub = {
    "timerInterval": 700,
    "paused": true,
    "nextShape": "",
    "canvas": {
        "canvasMajor": {
            "width": 300,
            "height": 600
        },
        "canvasMinor": {
            "width": 210,
            "height": 150
        }
    },
    "points": {
        "totalLinesCleared": 0,
        "level": 0,
        "levelUp": 5
    },
    "rubble": {
        "occupiedCells": [],
        "winRows": null,
        "boundaryCells": [
            "0-20",
            "1-20",
            "2-20",
            "3-20",
            "4-20",
            "5-20",
            "6-20",
            "7-20",
            "8-20",
            "9-20"
        ]
    },
    "activeShape": {
        "name": "shapeZ",
        "unitBlockSize": 30,
        "xPosition": 0,
        "yPosition": 0,
        "unitVertices": [],
        "absoluteVertices": [],
        "boundingBox": [],
        "rotationStage": 0,
        "cells": []
    }
}

export const shapeStub = {
    "name": "shapeI",
    "unitBlockSize": 30,
    "xPosition": 150,
    "yPosition": 60,
    "unitVertices": [
        [
            -1,
            0
        ],
        [
            -2,
            0
        ],
        [
            -2,
            -1
        ],
        [
            -1,
            -1
        ],
        [
            0,
            -1
        ],
        [
            1,
            -1
        ],
        [
            2,
            -1
        ],
        [
            2,
            0
        ],
        [
            1,
            0
        ]
    ],
    "absoluteVertices": [
        [
            120,
            30
        ],
        [
            90,
            30
        ],
        [
            90,
            0
        ],
        [
            120,
            0
        ],
        [
            150,
            0
        ],
        [
            180,
            0
        ],
        [
            210,
            0
        ],
        [
            210,
            30
        ],
        [
            180,
            30
        ]
    ],
    "boundingBox": [
        90,
        210,
        0,
        30
    ],
    "rotationStage": 0,
    "cells": [
        [
            3,
            0
        ],
        [
            4,
            0
        ],
        [
            5,
            0
        ],
        [
            6,
            0
        ]
    ]
}

export const noWinCollisionStub = [
    {
        "rubble": {
            "occupiedCells": [
                [
                    "4-18",
                    "yellow"
                ],
                [
                    "4-19",
                    "yellow"
                ],
                [
                    "5-18",
                    "yellow"
                ],
                [
                    "5-19",
                    "yellow"
                ]
            ],
            "winRows": null,
            "boundaryCells": [
                "0-20",
                "1-20",
                "2-20",
                "3-20",
                "4-20",
                "5-20",
                "6-20",
                "7-20",
                "8-20",
                "9-20"
            ]
        },
        "points": {
            "totalLinesCleared": 0,
            "level": 0,
            "levelUp": 5
        }
    },
    null,
    2
]

export const winCollisionStub = [
    {
        "rubble": {
            "occupiedCells": [
                [
                    "0-19",
                    "blue"
                ],
                [
                    "8-18",
                    "green"
                ],
                [
                    "8-19",
                    "green"
                ],
                [
                    "9-19",
                    "green"
                ],
                [
                    "8-17",
                    "purple"
                ],
                [
                    "9-16",
                    "purple"
                ],
                [
                    "9-17",
                    "purple"
                ],
                [
                    "9-18",
                    "purple"
                ],
                [
                    "3-18",
                    "orange"
                ],
                [
                    "3-19",
                    "orange"
                ]
            ],
            "winRows": [
                19
            ],
            "boundaryCells": [
                "0-20",
                "1-20",
                "2-20",
                "3-20",
                "4-20",
                "5-20",
                "6-20",
                "7-20",
                "8-20",
                "9-20"
            ]
        },
        "points": {
            "totalLinesCleared": 1,
            "level": 0,
            "levelUp": 5
        }
    },
    [
        19
    ],
    2
]

export const stubShapeI = {
    "name": "shapeI",
    "unitBlockSize": 30,
    "xPosition": 150,
    "yPosition": 30,
    "unitVertices": [
        [
            -1,
            0
        ],
        [
            -2,
            0
        ],
        [
            -2,
            -1
        ],
        [
            -1,
            -1
        ],
        [
            0,
            -1
        ],
        [
            1,
            -1
        ],
        [
            2,
            -1
        ],
        [
            2,
            0
        ],
        [
            1,
            0
        ]
    ],
    "absoluteVertices": [
        [
            120,
            30
        ],
        [
            90,
            30
        ],
        [
            90,
            0
        ],
        [
            120,
            0
        ],
        [
            150,
            0
        ],
        [
            180,
            0
        ],
        [
            210,
            0
        ],
        [
            210,
            30
        ],
        [
            180,
            30
        ]
    ],
    "boundingBox": [
        90,
        210,
        0,
        30
    ],
    "rotationStage": 0,
    "cells": [
        [
            3,
            0
        ],
        [
            4,
            0
        ],
        [
            5,
            0
        ],
        [
            6,
            0
        ]
    ]
}

export const stubProfile = {
    user: {
        profile: {
            authenticated: true,
            userip: "::ffff:127.0.0.1",
            username: "0001",
            displayname: "Stub Display Name"
        }
    },
    userProfileResponse: {
        singleStats: [
            {
                "_id": "62e3f935616501f9bd180a71",
                "googleId": "0001",
                "linesCleared": 49,
                "levelReached": 9,
                "createdAt": "2022-07-29T15:13:57.976Z",
                "updatedAt": "2022-07-29T15:13:57.976Z",
                "__v": 0
            },
            {
                "_id": "62dfd050d218114e5c901c43",
                "googleId": "0001",
                "linesCleared": 60,
                "levelReached": 12,
                "createdAt": "2022-07-26T11:30:24.576Z",
                "updatedAt": "2022-07-26T11:30:24.576Z",
                "__v": 0
            },
        ],
        matchStats: [
            {
                "_id": "62dd04cb1a1a257ead39a1ea",
                "winnerGoogleId": "0001",
                "looserGoogleId": "0002",
                "difficulty": 2,
                "winnerLinesCleared": 0,
                "winnerFloorsRaised": 0,
                "looserLinesCleared": 0,
                "looserFloorsRaised": 0,
                "looserDisqualified": true,
                "createdAt": "2022-07-24T08:37:31.809Z",
                "updatedAt": "2022-07-24T08:37:31.809Z",
                "__v": 0
            },
            {
                "_id": "62dc633b2464e19567160cb3",
                "winnerGoogleId": "0002",
                "looserGoogleId": "0001",
                "difficulty": 4,
                "winnerLinesCleared": 2,
                "winnerFloorsRaised": 1,
                "looserLinesCleared": 0,
                "looserFloorsRaised": 0,
                "looserDisqualified": false,
                "createdAt": "2022-07-23T21:08:11.812Z",
                "updatedAt": "2022-07-23T21:08:11.812Z",
                "__v": 0
            },
        ],
        opponentNames: {
            "0002": "Stub oponent name"
        }
    }
}