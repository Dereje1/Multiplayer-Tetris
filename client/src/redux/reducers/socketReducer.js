const socketReducer = (state = {}, action) => {
  switch (action.type) {
    case 'LOGGED_IN_USERS':
      return { usersLoggedIn: action.payload };
    default:
      return state;
  }
};

export default socketReducer;
