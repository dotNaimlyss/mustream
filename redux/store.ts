// src/redux/store.ts

import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux"; // Import combineReducers
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web
import userReducer from "./userSlice";

// Define the root reducer with all reducers combined, if you have more than one reducer
const rootReducer = combineReducers({
  user: userReducer,
  // Add other reducers here when needed
});

// Configuration for redux-persist
const persistConfig = {
  key: "root", // The key for the redux store in the storage
  storage, // The storage to use, in this case, localStorage
  // whitelist: ['user'], // You can specify which reducers to store, if not set, all reducers will be stored
};

// Create a persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure the store to use the persisted reducer
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// Export the store's type
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Create and export the persistor
export const persistor = persistStore(store);

export default store;
