"use client"
import { createSlice } from '@reduxjs/toolkit'

const subMenuActiveReducer = createSlice({
    name: 'menu',
    initialState: {
        subMenuActive: "",
    },
    reducers: {
        setSubMenuActive: (state, action) => {
            state.subMenuActive = action?.payload;
        }
    },
});

export const { setSubMenuActive } = subMenuActiveReducer.actions

export default subMenuActiveReducer.reducer