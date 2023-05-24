import { configureStore } from '@reduxjs/toolkit';
import socketSlice from './redux/socketSlice';
import userSlice from './redux/userSlice';
import gameSlice from './redux/gameSlice';

export const store = configureStore({
  reducer: {
    game: gameSlice,
    user: userSlice,
    socket: socketSlice,
  },
});

