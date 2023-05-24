import { handleServerSocketResponses } from '../../src/sockethandler'
import { socket as socketConstants } from '../../src/constants/index';
import {store} from '../../src/store';

const {
    serverEmit: {
        SERVER_RESET, ACCEPTED_INVITATION, GAME_STARTED, OPPONENT_SCREEN,
    }
} = socketConstants;


jest.mock('../../src/store');

describe('Handling the server socket responses', () => {
    afterEach(() => {
        store.dispatch.mockClear()
    })
    test('will do nothing on server reset if the socket object is empty', () => {
        store.getState.mockImplementation(() => ({
            socket: {},
            user: {}
        }))
        const ans = handleServerSocketResponses(SERVER_RESET)
        expect(ans).toBe(null)
    })
    test('will reset the server if the socket object is not empty', () => {
        store.getState.mockImplementation(() => ({
            socket: {
                usersLoggedIn: 2,
                mySocketId: "stub_socket_Id"
            },
            user: { profile: { authenticated: true } }
        }))
        const ans = handleServerSocketResponses(SERVER_RESET)
        expect(ans).toBe(true)
    })

    test('will accept an invitation', () => {
        store.dispatch.mockImplementationOnce(() => ({
            payload: {
                countdown: 2
            }
        }))
        handleServerSocketResponses(ACCEPTED_INVITATION, 2)
        expect(store.dispatch).toHaveBeenNthCalledWith(1, { payload: 2, type: "socket/ACCEPTED_INVITATION" })
    })

    test('will start a game', () => {
        store.dispatch.mockImplementationOnce(() => jest.fn())
        const cb = jest.fn()
        handleServerSocketResponses(GAME_STARTED, 'opponent data', cb)
        expect(store.dispatch).toHaveBeenCalledWith({ payload: 'opponent data', type: "socket/GAME_STARTED" })
        expect(cb).toHaveBeenCalledWith('Game Start Recieved and dispacthed by Client!!')
    })

    test('will update the opponent screen data', () => {
        store.getState.mockImplementation(() => ({
            socket: {
                temp: { gameInProgress: true },
            }
        }))
        store.dispatch.mockImplementationOnce(() => jest.fn())
        handleServerSocketResponses(OPPONENT_SCREEN, 'opponent screen data')
        expect(store.dispatch).toHaveBeenCalledWith({ payload: 'opponent screen data', type: "socket/OPPONENT_SCREEN" })
    })

    test('will dispatch all other allowed server events', () => {
        store.dispatch.mockImplementationOnce(() => jest.fn())
        handleServerSocketResponses(socketConstants.serverEmit.OPPONENT_POOL, 'opponent pool data')
        expect(store.dispatch).toHaveBeenCalledWith({ payload: 'opponent pool data', type: "socket/OPPONENT_POOL" })
    })

    test('will do nothing on server events that are not allowed', () => {
        store.dispatch.mockImplementationOnce(() => jest.fn())
        const ans = handleServerSocketResponses('Non allowed event', 'opponent pool data')
        expect(store.dispatch).not.toHaveBeenCalled()
        expect(ans).toBe(undefined)
    })

})