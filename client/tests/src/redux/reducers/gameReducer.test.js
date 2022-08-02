import gameReducer from '../../../../src/redux/reducers/gameReducer'
import { game } from '../../../../src/constants/index'

describe('The game reducer', () => {
    test('will update for a new game initialization', () => {
        const state = gameReducer({}, { type: game.INITIALIZE_GAME, payload: 'game initialization' })
        expect(state).toEqual('game initialization')
    })
    test('will update for a level up', () => {
        const state = gameReducer({ timerInterval: 200 }, { type: game.LEVEL_UP, payload: 50 })
        expect(state).toEqual({ timerInterval: 150 })
    })
    test('will update for a game paused', () => {
        const state = gameReducer({}, { type: game.PAUSE, payload: 'game paused' })
        expect(state).toEqual({ paused: 'game paused' })
    })
    test('will update for a new shape', () => {
        const state = gameReducer({}, { type: game.SET_NEXT_SHAPE, payload: 'new shape' })
        expect(state).toEqual({ nextShape: 'new shape' })
    })
    test('will update for a new screen', () => {
        const state = gameReducer({}, { type: game.SCREEN_UPDATE, payload: { activeShape: 'activeShape', paused: 'paused', rubble: 'rubble' } })
        expect(state).toEqual({ activeShape: 'activeShape', paused: 'paused', rubble: 'rubble' })
    })
    test('will update for a raised floor', () => {
        const state = gameReducer({}, { type: game.RAISE_FLOOR, payload: 'new rubble' })
        expect(state).toEqual({ rubble: 'new rubble' })
    })
    test('will update for a collision', () => {
        const state = gameReducer({}, { type: game.COLLISION, payload: { points: 10, rubble: 'rubble' } })
        expect(state).toEqual({  points: 10, rubble: 'rubble' })
    })
    test('will return existing state for everything else', () => {
        const state = gameReducer({}, {})
        expect(state).toEqual({})
    })
})