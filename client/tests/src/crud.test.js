import crud from '../../src/crud';
import axios from 'axios';

jest.mock('axios')

describe('generalized crud requests', () => {
    test('will make axios requests', async () => {
        axios.get.mockImplementation(() => Promise.resolve({ data: 'data returned succesfully!' }))
        const result = await crud({ address: '/' });
        expect(result).toEqual('data returned succesfully!');
    });

    test('will reject axios requests', async () => {
        axios.get.mockImplementation(() => Promise.reject({ data: 'Axios request rejected' }))
        try {
            await crud({ address: '/' });
        } catch (error) {
            // eslint-disable-next-line jest/no-conditional-expect
            expect(error).toEqual({"data": "Axios request rejected"})
        }
    });
});