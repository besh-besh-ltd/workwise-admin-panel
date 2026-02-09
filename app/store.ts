import { configureStore } from "@reduxjs/toolkit";
import loginSlice from "./login-slice";

export const store = configureStore({
  reducer: {
    login: loginSlice
  }
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
