import { configureStore } from '@reduxjs/toolkit';
import statusReducer from './statusSlice';
import projectorReducer from './projectorSlice';

const store = configureStore({
  reducer: {
    status: statusReducer,
    projector: projectorReducer,
  },
});

export default store;
