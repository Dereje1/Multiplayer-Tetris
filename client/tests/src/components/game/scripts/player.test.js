import player from "../../../../../src/components/game/scripts/player";
import * as collision from '../../../../../src/components/game/scripts/collision';
import { gameStub, stubShapeI } from '../../../../stub';

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
                indices: [10, 11, 12, 13]
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
                indices: [16, 17, 18, 19]
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
            activeShape: {
                ...gameStub.activeShape,
                indices: [3, 4, 5, 6]
            },
            paused: false
        }
        collision.getSideBlock.mockImplementation(() => false)
        const ans = player(37, updatedGameStub, {})
        expect(ans.indices).toEqual([2, 3, 4, 5])
    })

    test('will handle right move', () => {
        const updatedGameStub = {
            ...gameStub,
            activeShape: {
                ...gameStub.activeShape,
                indices: [3, 4, 5, 6]
            },
            paused: false
        }
        collision.getSideBlock.mockImplementation(() => false)
        const ans = player(39, updatedGameStub, {})
        expect(ans.indices).toEqual([4, 5, 6, 7])
    })

    test('will handle down move for no collision', () => {
        const updatedGameStub = {
            ...gameStub,
            paused: false
        }
        collision.getSideBlock.mockImplementation(() => false)
        collision.runCollisionTest.mockImplementation(() => false)
        const ans = player(40, updatedGameStub, {})
        expect(ans).toBe('forcedown')
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
        expect(ans).toEqual({ "indices": [1, 2, 3, 4], "name": "shapeI", "rotationStage": 0, "unitBlockSize": 30 })
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
            rotationStage: 1,
            indices: [3, 13, 23, 33]
        })
    })
})