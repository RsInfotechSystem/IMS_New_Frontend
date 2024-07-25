"use client"
import { configureStore } from "@reduxjs/toolkit";
import subMenuActiveReducer from "./subMenuActiveReducer";

export const store = configureStore({
    reducer: {
        subMenuActiveReducer: subMenuActiveReducer
    }
})