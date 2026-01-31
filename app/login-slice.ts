import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface LoginState {
  token: string;
}

const initialState: LoginState = {
  token: ""
};

export const loginSlice = createSlice({
  name: "login",
  initialState,
  reducers: {
    saveToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      localStorage.setItem("token", action.payload);
    },
    removeToken: (state) => {
      state.token = "";
      localStorage.removeItem("token");
    }
  }
});

// Action creators are generated for each case reducer function
export const { saveToken, removeToken } = loginSlice.actions;

export default loginSlice.reducer;
