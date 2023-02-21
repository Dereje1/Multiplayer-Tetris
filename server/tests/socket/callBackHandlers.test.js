const { handleGameCallBack, handleConnectedUsersCallBack, handleDisconnectedUsersCallBack } = require('../../socket/callBackHandlers')

describe('Handling Game play callbacks', () => {
    let io, socket
    let ioEmit = jest.fn()
    let socketEmit = jest.fn()
    beforeEach(() => {
        io = {
            to: jest.fn(() => ({ emit: ioEmit }))
        }
        socket = {
            emit: socketEmit
        }
    })
    afterEach(() => {
        io = null
        socket = null
        ioEmit.mockClear()
        socketEmit.mockClear()
    })

    test('will do nothing if no returned data', () => {
        const ans = handleGameCallBack(null, null, io, socket)
        expect(ans).toBe(undefined)
    })

    test('will handle generateOpponentPool operation', () => {
        handleGameCallBack(
            null,
            { operation: 'generateOpponentPool', data: 'returned data' },
            io,
            socket
        )
        expect(socketEmit).toHaveBeenCalledWith("OPPONENT_POOL", "returned data")
    })

    test('will handle recieveInvite operation', () => {
        handleGameCallBack(
            null,
            {
                operation: 'recieveInvite',
                data: {
                    reciever: { socketIdReciever: 'stub_socket_ID_2' },
                    sender: 'stub_socket_ID_1'
                }
            },
            io,
            socket
        )
        expect(io.to).toHaveBeenCalledWith("stub_socket_ID_2")
        expect(ioEmit).toHaveBeenCalledWith("INVITE_RECIEVED", "stub_socket_ID_1")
        expect(socketEmit).toHaveBeenCalledWith("INVITE_SENT", { socketIdReciever: "stub_socket_ID_2" })
    })

    test('will handle declinedInvite operation', () => {
        handleGameCallBack(
            null,
            {
                operation: 'declinedInvite',
                data: {
                    reciever: { socketIdReciever: 'stub_socket_ID_2' },
                    sender: 'stub_socket_ID_1'
                }
            },
            io,
            socket
        )
        expect(io.to).toHaveBeenCalledWith("stub_socket_ID_1")
        expect(ioEmit).toHaveBeenCalledWith("DECLINED_INVITATION", null)
    })

    test('will handle acceptedInvite operation', () => {
        handleGameCallBack(
            null,
            {
                operation: 'acceptedInvite',
                data: {
                    reciever: { opponentSID: 'stub_socket_ID_2' },
                    sender: 'stub_socket_ID_1'
                }
            },
            io,
            socket
        )
        expect(io.to).toHaveBeenCalledWith("stub_socket_ID_2")
        expect(ioEmit).toHaveBeenCalledWith("ACCEPTED_INVITATION", 'stub_socket_ID_1')
        expect(socketEmit).toHaveBeenCalledWith("ACCEPTED_INVITATION", { opponentSID: 'stub_socket_ID_2' })
    })

    test('will handle gamestart operation', () => {
        handleGameCallBack(
            null,
            {
                operation: 'gamestart',
                data: {
                    opponentInfo: { opponentSID: 'stub_socket_ID_2' },
                    clientScreen: 'client Screen'
                }
            },
            io,
            socket
        )
        const [operation, data, callback] = socketEmit.mock.calls[0]
        expect(operation).toBe("GAME_STARTED")
        expect(data).toEqual({ info: { opponentSID: 'stub_socket_ID_2' } })
        //run callback to get to io to/emit
        callback()
        expect(io.to).toHaveBeenCalledWith("stub_socket_ID_2")
        expect(ioEmit).toHaveBeenCalledWith("OPPONENT_SCREEN", 'client Screen')
    })

    test('will handle gameinprogress operation', () => {
        handleGameCallBack(
            null,
            {
                operation: 'gameinprogress',
                data: {
                    opponentSID: 'stub_socket_ID_2',
                    clientScreen: 'client Screen'
                }
            },
            io,
            socket
        )
        expect(io.to).toHaveBeenCalledWith("stub_socket_ID_2")
        expect(ioEmit).toHaveBeenCalledWith("OPPONENT_SCREEN", 'client Screen')
    })

    test('will handle gameFinished operation', () => {
        handleGameCallBack(
            null,
            {
                operation: 'gameFinished',
                data: {
                    winnerSID: 'stub_socket_ID_1',
                    loosingSID: 'stub_socket_ID_2'
                }
            },
            io,
            socket
        )
        expect(io.to).toHaveBeenCalledWith("stub_socket_ID_1")
        expect(ioEmit).toHaveBeenCalledWith("FINISH_GAME", { winnerSID: 'stub_socket_ID_1', loosingSID: 'stub_socket_ID_2' })
        expect(socketEmit).toHaveBeenCalledWith("FINISH_GAME", { winnerSID: 'stub_socket_ID_1', loosingSID: 'stub_socket_ID_2' })
    })

    test('will handle revokeInvite operation', () => {
        handleGameCallBack(
            null,
            {
                operation: 'revokeInvite',
                recieverId: 'stub_socket_ID_1'
            },
            io,
            socket
        )
        expect(io.to).toHaveBeenCalledWith("stub_socket_ID_1")
        expect(ioEmit).toHaveBeenCalledWith('UNMOUNT_OPPONENT', null)
        expect(socketEmit).toHaveBeenCalledWith('UNMOUNT_OPPONENT', null)
    })

    test('will handle errors', () => {
        try {
            handleGameCallBack(
                'An Error',
                {
                    operation: 'revokeInvite',
                    recieverId: 'stub_socket_ID_1'
                },
                io,
                socket
            )
        } catch (error) {
            expect(error).toBe('An Error')
        }
    })
})

describe('Handling connected users callbacks', () => {
    let io, socket
    let ioEmit = jest.fn()
    let socketEmit = jest.fn()
    beforeEach(() => {
        io = {
            emit: ioEmit
        }
        socket = {
            emit: socketEmit,
            id: 'stub_socket_ID_1'
        }
    })
    afterEach(() => {
        io = null
        socket = null
        ioEmit.mockClear()
        socketEmit.mockClear()
    })

    test('will update and emit on a new connected user', () => {
        handleConnectedUsersCallBack(null, ['new user'], io, socket)
        expect(ioEmit).toHaveBeenCalledWith("LOGGED_IN_USERS", 1)
        expect(socketEmit).toHaveBeenCalledWith("SOCKET_ID", 'stub_socket_ID_1')
    })

    test('will handle errors', () => {
        try {
            handleConnectedUsersCallBack(
                'An Error',
                ['new user'],
                io,
                socket
            )
        } catch (error) {
            expect(error).toBe('An Error')
        }
    })
})

describe('Handling disconnected users callbacks', () => {
    let io, socket
    let ioEmit = jest.fn()
    let socketEmit = jest.fn()
    beforeEach(() => {
        io = {
            to: jest.fn(() => ({ emit: ioEmit })),
            emit: jest.fn()
        }
        socket = {
            emit: socketEmit,
            id: 'stub_socket_ID_2'
        }
    })
    afterEach(() => {
        io = null
        socket = null
        ioEmit.mockClear()
        socketEmit.mockClear()
    })

    test('will handle errors', () => {
        try {
            handleDisconnectedUsersCallBack(
                'An Error',
                null,
                io,
                socket
            )
        } catch (error) {
            expect(error).toBe('An Error')
        }
    })

    test('will handle disqualified players by disconnection', () => {
        handleDisconnectedUsersCallBack(
            null,
            {
                disconnectionStatus: {
                    inGame: true,
                    connection: 'stub_socket_ID_1',
                    looserUserId: 'stub_user_ID_2',
                    winnerUserId: 'stub_user_ID_1'
                },
                data: []
            },
            io,
            socket
        )
        expect(io.to).toHaveBeenCalledWith("stub_socket_ID_1")
        expect(ioEmit).toHaveBeenCalledWith("FINISH_GAME",
            {
                "disqualified": true,
                "looserUserId": "stub_user_ID_2",
                "loosingSID": "stub_socket_ID_2",
                "winnerUserId": "stub_user_ID_1",
                "winnerSID": "stub_socket_ID_1"
            })
        expect(io.emit).toHaveBeenCalledWith("LOGGED_IN_USERS", 0)
    })

    test('will handle pending invites by disconnection', () => {
        handleDisconnectedUsersCallBack(
            null,
            {
                disconnectionStatus: {
                    pending: true,
                    connection: 'stub_socket_ID_1',
                    looserUserId: 'stub_user_ID_2',
                    winnerUserId: 'stub_user_ID_1'
                },
                data: []
            },
            io,
            socket
        )
        expect(io.to).toHaveBeenCalledWith("stub_socket_ID_1")
        expect(ioEmit).toHaveBeenCalledWith("OPPONENT_POOL",[])
    })

})