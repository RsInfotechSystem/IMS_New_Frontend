"use client";
import { configureStore } from "@reduxjs/toolkit";
import userSlice from "../redux-store/useReducer"

const store = configureStore({
  reducer: {
    user: userSlice
  },
});
export default store;
