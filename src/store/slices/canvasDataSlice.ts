import { createSlice } from '@reduxjs/toolkit';

const canvasDataSlice = createSlice({
  name: 'canvasData',
  initialState: null,
  reducers: {
    // 设置画布数据
    setCanvasData: (state, action) => {
      return action.payload;
    },
    // 清空画布数据
    clearCanvasData: (state) => {
      return null;
    },
  },
});

export const { setCanvasData, clearCanvasData } = canvasDataSlice.actions;
export default canvasDataSlice.reducer;
