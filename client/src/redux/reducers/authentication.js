import { GET_LOGIN_STATUS } from '../../constants/index';

const authReducer = (state = {}, action) => {
  switch (action.type) {
    case GET_LOGIN_STATUS:
      return { profile: action.payload };
    default:
      return state;
  }
};

export default authReducer;
