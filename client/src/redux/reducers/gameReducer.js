import {
  INITIALIZE_GAME, LEVEL_UP, PAUSE,
  GET_NEXT_SHAPE, SCREEN_UPDATE, RAISE_FLOOR, COLLISION,
} from '../constants/index';

const gameReducer = (state = {}, action) => {
  switch (action.type) {
    case INITIALIZE_GAME:
      return action.payload;
    case LEVEL_UP:
      return Object.assign({}, state, {
        timerInterval: state.timerInterval - action.payload,
      });
    case PAUSE:
      return Object.assign({}, state, {
        paused: action.payload,
      });
    case GET_NEXT_SHAPE:
      return Object.assign({}, state, {
        nextShape: action.payload,
      });
    case SCREEN_UPDATE:
      return Object.assign({}, state, {
        activeShape: action.payload.activeShape,
        rubble: action.payload.rubble,
        paused: action.payload.paused,
      });
    case RAISE_FLOOR:
      return Object.assign({}, state, {
        rubble: action.payload,
      });
    case COLLISION:
      return Object.assign({}, state, {
        rubble: action.payload.rubble,
        points: action.payload.points,
      });
    default:
      break;
  }
  return state;
};

export default gameReducer;
