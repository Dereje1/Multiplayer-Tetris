import player from "../../../../../src/components/game/scripts/player";
import * as collision from '../../../../../src/components/game/scripts/collision';
import { gameStub, stubShapeI } from '../../../../stub';
import * as shapeLocator from '../../../../../src/components/game/scripts/locateShape';

collision.runCollisionTest = jest.fn();
collision.getSideBlock = jest.fn()

describe('Player moves', () => {
    test('will do nothing if game is paused', () => {
        const ans = player({}, gameStub)
        expect(ans).toBe(null)
    })
    test('will handle non-arrow keys', () => {
        const ans = player(44, { ...gameStub, paused: false })
        expect(ans).toBe(null)
    })

    test('will handle left out of bounds', () => {
        const updatedGameStub = {
            ...gameStub,
            activeShape: {
                ...gameStub.activeShape,
                boundingBox: [
                    20,
                    210,
                    0,
                    30
                ]
            },
            paused: false
        }
        const ans = player(37, updatedGameStub, {})
        expect(ans).toBe(null)
    })

    test('will handle right out of bounds', () => {
        const updatedGameStub = {
            ...gameStub,
            activeShape: {
                ...gameStub.activeShape,
                boundingBox: [
                    20,
                    280,
                    0,
                    30
                ]
            },
            paused: false
        }
        const ans = player(39, updatedGameStub, {})
        expect(ans).toBe(null)
    })

    test('will handle left and right side collision blocks', () => {
        const updatedGameStub = {
            ...gameStub,
            paused: false
        }
        collision.getSideBlock.mockImplementation(() => true)
        let ans = player(37, updatedGameStub, {})
        expect(ans).toBe(null)
        ans = player(39, updatedGameStub, {})
        expect(ans).toBe(null)
    })

    test('will handle left move', () => {
        const updatedGameStub = {
            ...gameStub,
            paused: false
        }
        collision.getSideBlock.mockImplementation(() => false)
        const ans = player(37, updatedGameStub, {})
        expect(ans.xPosition).toBe(-1 * gameStub.activeShape.unitBlockSize)
    })

    test('will handle right move', () => {
        const updatedGameStub = {
            ...gameStub,
            paused: false
        }
        collision.getSideBlock.mockImplementation(() => false)
        const ans = player(39, updatedGameStub, {})
        expect(ans.xPosition).toBe(gameStub.activeShape.unitBlockSize)
    })

    test('will handle down move for no collision', () => {
        const updatedGameStub = {
            ...gameStub,
            paused: false
        }
        const spy1 = jest.spyOn(shapeLocator, 'default');
        collision.getSideBlock.mockImplementation(() => false)
        collision.runCollisionTest.mockImplementation(() => false)
        const ans = player(40, updatedGameStub, {})
        expect(ans).toBe('forcedown')
        expect(spy1.mock.calls[0][3].yPosition).toBe(gameStub.activeShape.unitBlockSize)
    })

    test('will handle down move for collision', () => {
        const updatedGameStub = {
            ...gameStub,
            paused: false
        }
        collision.getSideBlock.mockImplementation(() => false)
        collision.runCollisionTest.mockImplementation(() => true)
        const ans = player(40, updatedGameStub, {})
        expect(ans).toBe(null)
    })

    test('will cancel rotation on collision', () => {
        const updatedGameStub = {
            ...gameStub,
            activeShape: stubShapeI,
            paused: false
        }
        const ans = player(38, updatedGameStub, {})
        expect(ans).toBe(null)
    })

    test('will handle rotation when no collision', () => {
        const updatedGameStub = {
            ...gameStub,
            activeShape: stubShapeI,
            paused: false
        }
        collision.runCollisionTest.mockImplementation(() => false)
        const ans = player(38, updatedGameStub, {})
        expect(ans).toEqual({
            name: 'shapeI',
            unitBlockSize: 30,
            xPosition: 150,
            yPosition: 30,
            unitVertices: [
                [-0, -1], [-0, -2],
                [1, -2], [1, -1],
                [1, 0], [1, 1],
                [1, 2], [-0, 2],
                [-0, 1]
            ],
            absoluteVertices: [
                [150, 0], [150, -30],
                [180, -30], [180, 0],
                [180, 30], [180, 60],
                [180, 90], [150, 90],
                [150, 60]
            ],
            boundingBox: [150, 180, -30, 90],
            rotationStage: 1,
            cells: []
        })
    })

    test('will handle wall kicks on rotation', () => {
        const updatedGameStub = {
            ...gameStub,
            activeShape: {
                "name": "shapeI",
                "unitBlockSize": 30,
                "xPosition": 0,
                "yPosition": 300,
                "unitVertices": [
                    [
                        0,
                        -1
                    ],
                    [
                        0,
                        -2
                    ],
                    [
                        1,
                        -2
                    ],
                    [
                        1,
                        -1
                    ],
                    [
                        1,
                        0
                    ],
                    [
                        1,
                        1
                    ],
                    [
                        1,
                        2
                    ],
                    [
                        0,
                        2
                    ],
                    [
                        0,
                        1
                    ]
                ],
                "absoluteVertices": [
                    [
                        0,
                        270
                    ],
                    [
                        0,
                        240
                    ],
                    [
                        30,
                        240
                    ],
                    [
                        30,
                        270
                    ],
                    [
                        30,
                        300
                    ],
                    [
                        30,
                        330
                    ],
                    [
                        30,
                        360
                    ],
                    [
                        0,
                        360
                    ],
                    [
                        0,
                        330
                    ]
                ],
                "boundingBox": [
                    0,
                    30,
                    240,
                    360
                ],
                "rotationStage": 1,
                "cells": [
                    [
                        0,
                        8
                    ],
                    [
                        0,
                        9
                    ],
                    [
                        0,
                        10
                    ],
                    [
                        0,
                        11
                    ]
                ]
            },
            paused: false
        }
        collision.runCollisionTest.mockImplementation(() => false)
        const ans = player(38, updatedGameStub, {})
        expect(ans).toEqual({
            name: 'shapeI',
            unitBlockSize: 30,
            xPosition: 60,
            yPosition: 300,
            unitVertices: [
                [1, 0], [2, 0],
                [2, 1], [1, 1],
                [-0, 1], [-1, 1],
                [-2, 1], [-2, 0],
                [-1, 0]
            ],
            absoluteVertices: [
                [30, 300],
                [60, 300],
                [60, 330],
                [30, 330],
                [0, 330],
                [-30, 330],
                [-60, 330],
                [-60, 300],
                [-30, 300]
            ],
            boundingBox: [-60, 60, 300, 330],
            rotationStage: 2,
            cells: []
        })
    })

})