// eslint-disable-next-line import/prefer-default-export
export const getLoggedInUsers = data => dispatch => (
  dispatch({
    type: 'LOGGED_IN_USERS',
    payload: data,
  })
);
