import { configureStore } from "@reduxjs/toolkit";
import loginSlice from "./login-slice";
export const store = configureStore({
  reducer: {
    login: loginSlice
  }
});
