import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  token: ""
};

export const loginSlice = createSlice({
  name: "login",
  initialState,
  reducers: {
    saveToken: (state, action) => {
      state.token = action.payload;
      localStorage.setItem("token", action.payload);
    },
    removeToken: (state, action) => {
      state.token = "";
      localStorage.removeItem("token");
    }
  }
});

// Action creators are generated for each case reducer function
export const { saveToken, removeToken } = loginSlice.actions;

export default loginSlice.reducer;
