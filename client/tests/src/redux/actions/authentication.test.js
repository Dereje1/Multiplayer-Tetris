import { getUser } from '../../../../src/redux/actions/authentication';
import {stubProfile} from '../../../stub'
import RESTcall from '../../../../src/crud'

jest.mock('../../../../src/crud');

describe('authentication', () => {
    let dispatch;
    beforeEach(() => {
        dispatch = jest.fn();
    });
    afterEach(() => {
        dispatch.mockClear();
        RESTcall.mockClear()
    });
    test('will dispatch the status for a logged in user', async () => {
        RESTcall.mockImplementation(() => Promise.resolve({...stubProfile.user.profile}))
        const profile = getUser('/auth/profile');
        await profile(dispatch);
        expect(dispatch).toHaveBeenCalledWith({
            payload: {...stubProfile.user.profile},
            type: 'GET_LOGIN_STATUS',
        });
    });

    test('will dispatch the status for a rejected logged in user request', async () => {
        RESTcall.mockImplementation(() => Promise.reject(new Error('Requested method:get and path: profile_get_reject not mocked!!')))
        const profile = getUser('profile_get_reject');
        await profile(dispatch);
        expect(dispatch).toHaveBeenCalledWith({
            payload: Error('Requested method:get and path: profile_get_reject not mocked!!'),
            type: 'GET_USER_STATUS_REJECTED',
        });
    });

});