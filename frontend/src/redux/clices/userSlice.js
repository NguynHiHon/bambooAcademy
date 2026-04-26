import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
    name: "user",
    initialState: {
        profile: null,
        isFetching: false,
        usersList: [],
        error: false,
        message: null,
    },
    reducers: {
        // Get user profile actions
        getUserProfileStart: (state) => {
            state.isFetching = true;
            state.error = false;
            state.message = null;
        },
        getUserProfileSuccess: (state, action) => {
            state.isFetching = false;
            state.profile = action.payload;
            state.error = false;
        },
        getUserProfileFailure: (state, action) => {
            state.isFetching = false;
            state.error = true;
            state.message = action.payload;
        },

        // Clear user profile (khi logout)
        clearUserProfile: (state) => {
            state.profile = null;
            state.isFetching = false;
            state.error = false;
            state.message = null;
        },

        // Update user profile
        updateUserProfile: (state, action) => {
            if (state.profile) {
                state.profile = {
                    ...state.profile,
                    ...action.payload,
                };
            }
        },

        //lấy danh sách người dùng (admin) 
        getUsersListStart: (state) => {
            state.isFetching = true;
            state.error = false;
            state.message = null;
        },
        getUsersListSuccess: (state, action) => {
            state.isFetching = false;
            state.usersList = action.payload.users;
            state.error = false;
        },
        getUsersListFailure: (state, action) => {
            state.isFetching = false;
            state.error = true;
            state.message = action.payload.message;
        },
    },
});

export const {
    getUserProfileStart,
    getUserProfileSuccess,
    getUserProfileFailure,
    clearUserProfile,
    updateUserProfile,
    getUsersListStart,
    getUsersListSuccess,
    getUsersListFailure,
} = userSlice.actions;

export default userSlice.reducer;
