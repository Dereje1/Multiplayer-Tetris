import { GameActions } from '../../../../src/redux/actions/tetris'
import { gameStub } from '../../../stub'

describe('Game actions', () => {
    test('will create any action with no transformations', () => {
        const ans = GameActions('ANY', 'any')
        expect(ans).toEqual({ payload: "any", type: "ANY" })
    })
    test('will create an action with a RAISE_FLOOR transformation', () => {
        const ans = GameActions('RAISE_FLOOR', gameStub.rubble, { raiseBy: 1 })
        expect(ans).toEqual({
            type: 'RAISE_FLOOR',
            payload: {
                occupiedCells: [],
                boundaryCells: [
                    '0-20', '1-20', '2-20',
                    '3-20', '4-20', '5-20',
                    '6-20', '7-20', '8-20',
                    '9-20', '0-19', '1-19',
                    '2-19', '3-19', '4-19',
                    '5-19', '6-19', '7-19',
                    '8-19', '9-19'
                ],
                winRows: null
            }
        })
    })
    test('will create an action with a INITIALIZE_GAME transformation', () => {
        const ans = GameActions('INITIALIZE_GAME', {}, true)
        expect(ans).toEqual({
            type: 'INITIALIZE_GAME',
            payload: {
                ...gameStub,
                rubble:{
                    ...gameStub.rubble,
                    boundaryCells:[]
                }
            }
        })
    })
})