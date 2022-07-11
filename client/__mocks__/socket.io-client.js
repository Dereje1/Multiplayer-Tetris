const socketMock = {
    onAny: jest.fn()
};
export default jest.fn(() => socketMock);