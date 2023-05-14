import { GameActions } from '../../../../src/redux/actions/tetris'
import { gameStub } from '../../../stub'

describe('Game actions', () => {
    test('will create any action with no transformations', () => {
        const ans = GameActions('ANY', 'any')
        expect(ans).toEqual({ payload: "any", type: "ANY" })
    })
    test('will create an action with a RAISE_FLOOR transformation', () => {
        const ans = GameActions('RAISE_FLOOR', gameStub, { raiseBy: 1 })
        expect(ans).toEqual({
            type: 'RAISE_FLOOR',
            payload: {
                rubble: {
                    occupiedCells: []
                },
                floor: {
                    floorHeight: 1,
                    floorIndices: [199, 198, 197, 196, 195, 194, 193, 192, 191, 190]
                }
            }
        })
    })
    test('will create an action with a INITIALIZE_GAME transformation', () => {
        const ans = GameActions('INITIALIZE_GAME', {}, true)
        expect(ans).toEqual({
            type: 'INITIALIZE_GAME',
            payload: {
                ...gameStub,
                rubble: {
                    ...gameStub.rubble,
                }
            }
        })
    })
})