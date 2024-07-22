"use client";
import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    role: "Admin",
    userName: "RSinfoTech",
    lastLogin: "",
    userID: "",
    isLoggedIn: false,
    accessToken: "",
    roleId: "",
    token: "",
  },
  reducers: {
    login: (state, action) => {
      state.role = action.payload.role;
      state.userName = action.payload.userName;
      state.lastLogin = action.payload.lastLogin;
      state.isLoggedIn = action.payload.isLoggedIn;
      state.userID = action.payload.userID;
      state.token = action.payload.token;
      state.roleId = action.payload.roleId;
    },
    setToken: (state, action) => {
      state.accessToken = action.payload;
    },
  },
});


export const { login, setToken } = userSlice.actions;

export default userSlice.reducer;


