import drawScreen from "../../../../../src/components/game/scripts/drawscreen";
import * as collision from '../../../../../src/components/game/scripts/collision';
import { gameStub, shapeStub, noWinCollisionStub, winCollisionStub } from '../../../../stub';

jest.useFakeTimers();
collision.runCollisionTest = jest.fn()

describe('drawing the screen', () => {
    let args;

    beforeEach(() => {
        args = {
            audio: {
                lineCleared: jest.fn(),
                maxLinesCleared: jest.fn()
            },
            canvasContextMajor: {
                canvas: {
                    width: 300
                },
                clearRect: jest.fn(),
                beginPath: jest.fn(),
                moveTo: jest.fn(),
                lineTo: jest.fn(),
                fill: jest.fn(),
                rect: jest.fn(),
                stroke: jest.fn(),
                fillRect: jest.fn()
            },
            endTick: jest.fn(),
            gameOver: jest.fn(),
            redux: {
                game: { ...gameStub },
                collide: jest.fn(),
                updateScreen: jest.fn()
            },
            startTick: jest.fn(),
            updatedShape: { ...shapeStub }
        }
    })

    afterEach(() => {
        args = null
    })

    test('will end game if no collision result detected', () => {
        collision.runCollisionTest.mockImplementation(() => [])
        drawScreen(args)
        expect(args.endTick).toHaveBeenCalledWith('collision check - Game Over')
        expect(args.gameOver).toHaveBeenCalled()
    })

    test('will draw screen for a no win collision', () => {
        collision.runCollisionTest.mockImplementation(() => noWinCollisionStub)
        const ans = drawScreen(args)
        expect(args.endTick).toHaveBeenCalledWith('collision check - No Win')
        expect(args.redux.collide).toHaveBeenCalledWith(noWinCollisionStub[0])
        expect(args.startTick).toHaveBeenCalled()
        expect(ans).toBe(null)
    })

    test('will draw screen for a single line win collision and play audio', () => {
        collision.runCollisionTest.mockImplementation(() => winCollisionStub)
        const ans = drawScreen(args)
        jest.advanceTimersByTime(250);
        expect(args.endTick).toHaveBeenCalledWith('collision check - Win')
        expect(args.redux.collide).toHaveBeenCalledWith(winCollisionStub[0])
        expect(args.audio.lineCleared).toHaveBeenCalled()
        expect(args.startTick).toHaveBeenCalled()
        expect(ans).toBe(null)
    })

    test('will draw screen for a multi line win collision and play audio', () => {
        const updatedStub = [winCollisionStub[0], [16, 17, 18, 19], 2]
        collision.runCollisionTest.mockImplementation(() => updatedStub)
        const ans = drawScreen(args)
        jest.advanceTimersByTime(250);
        expect(args.endTick).toHaveBeenCalledWith('collision check - Win')
        expect(args.redux.collide).toHaveBeenCalledWith(winCollisionStub[0])
        expect(args.audio.maxLinesCleared).toHaveBeenCalled()
        expect(args.startTick).toHaveBeenCalled()
        expect(ans).toBe(null)
    })

    test('will only refresh screen if no collision found', () => {
        collision.runCollisionTest.mockImplementation(() => null)
        const ans = drawScreen(args)
        expect(args.endTick).not.toHaveBeenCalled()
        expect(args.redux.collide).not.toHaveBeenCalled()
        expect(args.redux.updateScreen).toHaveBeenCalledWith({
            rubble: gameStub.rubble,
            paused: false,
            activeShape: {
                ...shapeStub,
            },
            floor: {
                floorHeight: 0,
                floorIndices: []
            }
        })
        expect(ans).toBe(undefined)
    })
})