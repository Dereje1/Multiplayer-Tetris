import axios from 'axios';
import { auth } from '../../constants/index';

const { GET_LOGIN_STATUS } = auth;

const getUser = () => dispatch => (
  axios.get('/auth/profile').then(({ data }) => {
    dispatch({
      type: GET_LOGIN_STATUS,
      payload: data,
    });
  })
);

export default getUser;
