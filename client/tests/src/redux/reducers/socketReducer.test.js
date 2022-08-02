import socketReducer from '../../../../src/redux/reducers/socketReducer'
import { socket as socketConstants } from '../../../../src/constants/index'

const { serverEmit, GAME_COUNTDOWN } = socketConstants;

describe('The socket reducer', () => {
    test('will update the # of logged in users', () => {
        const state = socketReducer({}, { type: serverEmit.LOGGED_IN_USERS, payload: 3 })
        expect(state).toEqual({ usersLoggedIn: 3 })
    })
    test('will update the socket Id of the client', () => {
        const state = socketReducer({}, { type: serverEmit.SOCKET_ID, payload: 'stub_socket_id' })
        expect(state).toEqual({ mySocketId: 'stub_socket_id' })
    })
    test('will update the opponent pool', () => {
        const state = socketReducer({}, { type: serverEmit.OPPONENT_POOL, payload: ['stub_opponent_1', 'stub_opponent_2'] })
        expect(state).toEqual({ temp: { opponents: ['stub_opponent_1', 'stub_opponent_2'] } })
    })
    test('will update for an unmounted opponent', () => {
        const state = socketReducer({ temp: { opponents: ['stub_opponent_1'] } }, { type: serverEmit.UNMOUNT_OPPONENT })
        expect(state).toEqual({})
    })
    test('will update for an invite sent', () => {
        const state = socketReducer({}, { type: serverEmit.INVITE_SENT, payload: 'stub_socket_id' })
        expect(state).toEqual({ temp: { invitationTo: 'stub_socket_id' } })
    })
    test('will update for an invite recieved', () => {
        const state = socketReducer({}, { type: serverEmit.INVITE_RECIEVED, payload: 'stub_socket_id' })
        expect(state).toEqual({ temp: { invitationFrom: 'stub_socket_id' } })
    })
    test('will update for a declined invitation', () => {
        const state = socketReducer({}, { type: serverEmit.DECLINED_INVITATION })
        expect(state).toEqual({ temp: { declinedInvitation: true } })
    })
    test('will update for an accepted invitation', () => {
        const state = socketReducer({}, { type: serverEmit.ACCEPTED_INVITATION, payload: 'stub_socket_id' })
        expect(state).toEqual({ temp: { acceptedInvitation: 'stub_socket_id' } })
    })
    test('will update a game count down', () => {
        const state = socketReducer({ temp: { acceptedInvitation: true } }, { type: GAME_COUNTDOWN, payload: 6 })
        expect(state).toEqual({
            temp:
            {
                acceptedInvitation: {
                    countdown: 6
                }
            }
        })
    })
    test('will update for a game started', () => {
        const state = socketReducer({}, { type: serverEmit.GAME_STARTED, payload: 'stub_socket_id' })
        expect(state).toEqual({ temp: { gameInProgress: 'stub_socket_id' } })
    })
    test('will update the opponent screen', () => {
        const state = socketReducer({ temp: { gameInProgress: { game: {} } } }, { type: serverEmit.OPPONENT_SCREEN, payload: 'opponent screem' })
        expect(state).toEqual({ temp: { gameInProgress: { game: {}, opponentScreen: 'opponent screem' } } })
    })
    test('will update for a game over', () => {
        const state = socketReducer({}, { type: serverEmit.FINISH_GAME, payload: 'game over' })
        expect(state).toEqual({ temp: { gameOver: 'game over' } })
    })
    test('will return existing state for everything else', () => {
        const state = socketReducer({}, {})
        expect(state).toEqual({})
    })
})