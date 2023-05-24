import { createSlice } from '@reduxjs/toolkit';

const initialState = {};

export const socketSlice = createSlice({
    name: 'socket',
    initialState,
    reducers: {
        LOGGED_IN_USERS: (state, action) => {
            state.usersLoggedIn = action.payload
        },
        SOCKET_ID: (state, action) => {
            state.mySocketId = action.payload
        },
        OPPONENT_POOL: (state, action) => {
            const { temp, ...rest } = state;
            return {
                ...rest,
                temp: {
                    opponents: action.payload,
                }
            }
        },
        UNMOUNT_OPPONENT: (state, action) => {
            const { temp, ...rest } = state;
            return rest;
        },
        INVITE_SENT: (state, action) => {
            const { temp, ...rest } = state;
            return {
                ...rest,
                temp: {
                    invitationTo: action.payload,
                }
            }
        },
        INVITE_RECIEVED: (state, action) => {
            const { temp, ...rest } = state;
            return {
                ...rest,
                temp: {
                    invitationFrom: action.payload,
                }
            }
        },
        DECLINED_INVITATION: (state) => {
            const { temp, ...rest } = state;
            return {
                ...rest,
                temp: {
                    declinedInvitation: true,
                }
            }
        },
        ACCEPTED_INVITATION: (state, action) => {
            const { temp, ...rest } = state;
            return {
                ...rest,
                temp: {
                    acceptedInvitation: action.payload,
                }
            }
        },
        GAME_COUNTDOWN: (state, action) => {
            state.temp.acceptedInvitation.countdown = action.payload
        },
        GAME_STARTED: (state, action) => {
            const { temp, ...rest } = state;
            return {
                ...rest,
                temp: {
                    gameInProgress: action.payload,
                }
            }
        },
        OPPONENT_SCREEN: (state, action) => {
            state.temp.gameInProgress.opponentScreen = action.payload
        },
        FINISH_GAME: (state, action) => {
            const { temp, ...rest } = state;
            return {
                ...rest,
                temp: {
                    gameOver: action.payload,
                }
            }
        },
    },
});

export default socketSlice.reducer;