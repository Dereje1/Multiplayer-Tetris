const master = require('../../socket/index')

describe('The index', () => {
    const emit = jest.fn()
    test('will', () => {
        const socketMock = {
            on: jest.fn((a, cb) => { }),
            emit,
            id: 'stub_socket_ID_1'
        }
        const io = {
            on: jest.fn((a, cb) => {
                cb(socketMock)
            })
        }
        master(io);
        expect(emit).toHaveBeenCalledWith("SERVER_RESET", "get users")
    })
})