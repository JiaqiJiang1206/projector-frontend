import { configureStore } from '@reduxjs/toolkit';
import statusReducer from './slices/statusSlice';
import projectorReducer from './slices/projectorSlice';
import { conditionSlice } from './slices/conditionSlice';
import messageReducer from './slices/messagesSlice';
import canvasDataReducer from './slices/canvasDataSlice';

// 创建 Redux store
const store = configureStore({
  reducer: {
    status: statusReducer,
    projector: projectorReducer,
    condition: conditionSlice.reducer,
    messages: messageReducer,
    canvasData: canvasDataReducer,
  },
});

export default store;
