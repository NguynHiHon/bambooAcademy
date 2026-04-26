import { configureStore } from '@reduxjs/toolkit';
import {
    persistStore,
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './clices/authSlice';
import tokenReducer from './clices/tokenSlice';
import userReducer from './clices/userSlice';

// Cấu hình persist cho AUTH (user info + login status)
const authPersistConfig = {
    key: 'auth',
    version: 1,
    storage,
};

// Cấu hình persist cho TOKEN (lưu riêng accessToken)
const tokenPersistConfig = {
    key: 'token',
    version: 1,
    storage,
};

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);
const persistedTokenReducer = persistReducer(tokenPersistConfig, tokenReducer);

export const store = configureStore({
    reducer: {
        auth: persistedAuthReducer,    // Persist - lưu thông tin user
        token: persistedTokenReducer,  // Persist - lưu accessToken riêng
        user: userReducer,             // Không persist - profile sẽ fetch lại khi cần
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
});

export const persistor = persistStore(store);

