const socketMock = {
    onAny: jest.fn(),
    emit: jest.fn()
};
export default jest.fn(() => socketMock);