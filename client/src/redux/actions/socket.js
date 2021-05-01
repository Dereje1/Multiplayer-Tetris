import { socket as socketConstants } from '../../constants/index';

const {
  GAME_COUNTDOWN,
} = socketConstants;


export const startCountDown = counter => (dispatch) => {
  let secondsOfTimer = counter; // linter complaing on param reassignment
  const intervalId = setInterval(() => {
    secondsOfTimer -= 1;
    if (secondsOfTimer <= 0) clearInterval(intervalId);
    dispatch({
      type: GAME_COUNTDOWN,
      payload: secondsOfTimer,
    });
  }, 1000);
};

export const socketDataAction = ({ type, payload }) => ({ type, payload });
