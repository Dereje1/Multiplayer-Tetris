const testReducer = (state = {}, action) => {
  switch (action.type) {
    case 'test':
      return { a: action.payload };
    default:
      return state;
  }
};

export default testReducer;
