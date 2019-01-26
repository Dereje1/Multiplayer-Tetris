import { auth } from '../../constants/index';
const { GET_LOGIN_STATUS } = auth;
const authReducer = (state = {}, action) => {
  switch (action.type) {
    case GET_LOGIN_STATUS:
      return { profile: action.payload };
    default:
      return state;
  }
};

export default authReducer;
