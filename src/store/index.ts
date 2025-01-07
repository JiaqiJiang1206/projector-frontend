import { configureStore } from '@reduxjs/toolkit';
import statusReducer from './statusSlice';
import projectorReducer from './projectorSlice';
import { conditionSlice } from './conditionSlice';
import messageReducer from './messagesSlice';

// 创建 Redux store
const store = configureStore({
  reducer: {
    status: statusReducer,
    projector: projectorReducer,
    condition: conditionSlice.reducer,
    messages: messageReducer,
  },
});

export default store;
