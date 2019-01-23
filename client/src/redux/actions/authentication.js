import axios from 'axios';
import { GET_LOGIN_STATUS } from '../../constants/index';

const getUser = () => dispatch => (
  axios.get('/auth/profile').then(({ data }) => {
    dispatch({
      type: GET_LOGIN_STATUS,
      payload: data,
    });
  })
);

export default getUser;
