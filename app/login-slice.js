import { createSlice } from "@reduxjs/toolkit";
import { setAuthCookie, removeAuthCookie } from "@/utils/cookies";

const initialState = {
  token: ""
};

export const loginSlice = createSlice({
  name: "login",
  initialState,
  reducers: {
    saveToken: (state, action) => {
      state.token = action.payload;
      setAuthCookie(action.payload);
    },
    removeToken: (state) => {
      state.token = "";
      removeAuthCookie();
    }
  }
});

// Action creators are generated for each case reducer function
export const { saveToken, removeToken } = loginSlice.actions;

export default loginSlice.reducer;
