const gamePlay = require('../../socket/game')
const util = require('../../socket/utility')

const stubUsers = () => [
    {
        userId: 'stub_user_ID_1',
        displayName: 'stub_display_name_1',
        userip: 'stub_IP_1',
        socketId: 'stub_socket_ID_1',
        oponnentId: null,
        pending: null
    },
    {
        userId: 'stub_user_ID_2',
        displayName: 'stub_display_name_2',
        userip: 'stub_IP_2',
        socketId: 'stub_socket_ID_2',
        oponnentId: null,
        pending: null
    }
]

describe('Game play', () => {
    let socketMock, gameCallback
    afterEach(() => {
        socketMock = null;
        gameCallback = null;
        util.setUsers([])
    })
    test('will look for opponents', () => {
        socketMock = {
            on: jest.fn((a, cb) => {
                if (a === 'LOOK_FOR_OPPONENTS') {
                    cb()
                }
            }),
            id: 'stub_socket_ID_3'
        }
        util.setUsers(stubUsers())
        gameCallback = jest.fn()
        gamePlay(socketMock, gameCallback)
        expect(gameCallback).toHaveBeenCalledWith(null, {
            data: [
                {
                    displayName: 'stub_display_name_1',
                    socketId: 'stub_socket_ID_1'
                },
                {
                    displayName: 'stub_display_name_2',
                    socketId: 'stub_socket_ID_2'
                }
            ], operation: "generateOpponentPool"
        })
    })

    test('will handle opponent unmounting with no pending invitations', () => {
        socketMock = {
            on: jest.fn((a, cb) => {
                if (a === 'OPPONENT_UNMOUNTED') {
                    cb()
                }
            }),
            emit: jest.fn()
        }
        gameCallback = jest.fn()
        gamePlay(socketMock, gameCallback)
        expect(gameCallback).toHaveBeenCalledWith(null, null)
        expect(socketMock.emit).toHaveBeenCalledWith('UNMOUNT_OPPONENT', null)
    })

    test('will handle opponent unmounting with pending invitations', () => {
        socketMock = {
            on: jest.fn((a, cb) => {
                if (a === 'OPPONENT_UNMOUNTED') {
                    cb({ invitationTo: { socketIdReciever: 'reciever ID' } })
                }
            }),
            emit: jest.fn()
        }
        gameCallback = jest.fn()
        gamePlay(socketMock, gameCallback)
        expect(gameCallback).toHaveBeenCalledWith(null, { operation: "revokeInvite", recieverId: "reciever ID" })
    })

    test('will send an invitation from player 1 to player 2', () => {
        socketMock = {
            on: jest.fn((a, cb) => {
                if (a === 'INVITATION_SENT') {
                    cb({ sentTo: 'stub_socket_ID_2', difficulty: 3 })
                }
            }),
            id: 'stub_socket_ID_1'
        }
        util.setUsers(stubUsers())
        gameCallback = jest.fn()
        gamePlay(socketMock, gameCallback)
        expect(gameCallback).toHaveBeenCalledWith(
            null,
            {
                operation: 'recieveInvite',
                data: {
                    sender: {
                        displayName: 'stub_display_name_1',
                        socketId: 'stub_socket_ID_1',
                        difficulty: 3
                    },
                    reciever: {
                        displaynameReciever: 'stub_display_name_2',
                        socketIdReciever: 'stub_socket_ID_2'
                    }
                }
            }
        )
    })

    test('will revoke an invitation if reciever is no longer available', () => {
        socketMock = {
            on: jest.fn((a, cb) => {
                if (a === 'INVITATION_SENT') {
                    cb({ sentTo: 'stub_socket_ID_3', difficulty: 3 })
                }
            }),
            id: 'stub_socket_ID_1'
        }
        util.setUsers(stubUsers())
        gameCallback = jest.fn()
        gamePlay(socketMock, gameCallback)
        expect(gameCallback).toHaveBeenCalledWith(null, { operation: 'revokeInvite' })
    })

    test('will handle a declined invitation', () => {
        socketMock = {
            on: jest.fn((a, cb) => {
                if (a === 'INVITATION_DECLINED') {
                    cb({ invitationFrom: { socketId: 'stub_socket_ID_1' } })
                }
            }),
            id: 'stub_socket_ID_2'
        }
        util.setUsers(stubUsers())
        gameCallback = jest.fn()
        gamePlay(socketMock, gameCallback)
        expect(gameCallback).toHaveBeenCalledWith(null, { operation: 'declinedInvite', data: { sender: 'stub_socket_ID_1' } })
    })

    test('will handle an accepted invitation', () => {
        socketMock = {
            on: jest.fn((a, cb) => {
                if (a === 'INVITATION_ACCEPTED') {
                    cb({ invitationFrom: { socketId: 'stub_socket_ID_1', difficulty: 3 } })
                }
            }),
            id: 'stub_socket_ID_2'
        }
        util.setUsers(stubUsers())
        gameCallback = jest.fn()
        gamePlay(socketMock, gameCallback)
        expect(gameCallback).toHaveBeenCalledWith(null, {
            operation: 'acceptedInvite',
            data: {
                sender: {
                    countdown: 10,
                    difficulty: 3,
                    opponentSID: 'stub_socket_ID_2',
                    opponnetDisplayname: 'stub_display_name_2'
                },
                reciever: {
                    countdown: 10,
                    difficulty: 3,
                    opponnetDisplayname: 'stub_display_name_1',
                    opponentSID: 'stub_socket_ID_1'
                }
            }
        })
    })

    test('will start a game', () => {
        socketMock = {
            on: jest.fn((a, cb) => {
                if (a === 'START_GAME') {
                    cb({ opponentInfo: { opponentSID: 'stub_socket_ID_2' }, clientScreen: 'client screen' })
                }
            }),
            id: 'stub_socket_ID_1'
        }
        util.setUsers(stubUsers())
        gameCallback = jest.fn()
        gamePlay(socketMock, gameCallback)
        expect(gameCallback).toHaveBeenCalledWith(null,
            {
                operation: 'gamestart',
                data: {
                    opponentInfo: { opponentSID: 'stub_socket_ID_2' },
                    clientScreen: 'client screen'
                }
            }
        )
    })

    test('will cancel game start if opponent no longer exists', () => {
        socketMock = {
            on: jest.fn((a, cb) => {
                if (a === 'START_GAME') {
                    cb({ opponentInfo: { opponentSID: 'stub_socket_ID_3' }, clientScreen: 'client screen' })
                }
            }),
            id: 'stub_socket_ID_1'
        }
        util.setUsers(stubUsers())
        gameCallback = jest.fn()
        gamePlay(socketMock, gameCallback)
        expect(gameCallback).toHaveBeenCalledWith(null, { operation: 'revokeInvite' })
    })

    test('will send an updated client screen', () => {
        socketMock = {
            on: jest.fn((a, cb) => {
                if (a === 'UPDATED_CLIENT_SCREEN') {
                    cb('updated  client screen')
                }
            }),
            id: 'stub_socket_ID_1'
        }
        const users = stubUsers();
        users[0].oponnentId = 'stub_socket_ID_2'
        util.setUsers(users)
        gameCallback = jest.fn()
        gamePlay(socketMock, gameCallback)
        expect(gameCallback).toHaveBeenCalledWith(null,
            {
                operation: 'gameinprogress',
                data: 'updated  client screen'
            }
        )
    })

    test('will handle game over', () => {
        socketMock = {
            on: jest.fn((a, cb) => {
                if (a === 'GAME_OVER') {
                    cb({ temp: { gameInProgress: { info: { opponentSID: 'stub_socket_ID_1' } } }, mySocketId: 'stub_socket_ID_2' })
                }
            })
        }
        util.setUsers(stubUsers())
        gameCallback = jest.fn()
        gamePlay(socketMock, gameCallback)
        expect(gameCallback).toHaveBeenCalledWith(null,
            {
                operation: 'gameFinished',
                data: {
                    winnerSID: 'stub_socket_ID_1',
                    loosingSID: 'stub_socket_ID_2',
                    winnerGoogleID: 'stub_user_ID_1',
                    looserGoogleID: 'stub_user_ID_2'
                }
            }
        )
    })
})