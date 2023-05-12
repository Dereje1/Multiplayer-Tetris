import RESTcall from '../../crud';
import { auth } from '../../constants/index';

const { GET_LOGIN_STATUS } = auth;

export const getUser = path => async (dispatch) => {
  try {
    const payload = await RESTcall({ address: '/auth/profile' });
    dispatch({
      type: GET_LOGIN_STATUS,
      payload,
    });
  } catch (err) {
    dispatch({
      type: 'GET_USER_STATUS_REJECTED',
      payload: {
        authenticated: false
      },
    });
  }
};

export default getUser;
