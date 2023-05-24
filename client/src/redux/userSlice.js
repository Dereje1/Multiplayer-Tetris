import { createSlice } from '@reduxjs/toolkit';
import RESTcall from '../crud';

const initialState = {};

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        getLoginStatus: (state, action) => ({ profile: action.payload }),
        rejectAuthentication: () => initialState,
    },
});


export const getUser = path => async (dispatch) => {
    try {
        const payload = await RESTcall({ address: '/auth/profile' });
        dispatch(userSlice.actions.getLoginStatus(payload));
    } catch (err) {
        dispatch(userSlice.actions.rejectAuthentication());
    }
};

export default userSlice.reducer;