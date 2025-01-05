import { configureStore } from '@reduxjs/toolkit';
import statusReducer from './statusSlice';
import projectorReducer from './projectorSlice';
import { conditionSlice } from './conditionSlice';

const store = configureStore({
  reducer: {
    status: statusReducer,
    projector: projectorReducer,
    condition: conditionSlice.reducer,
  },
});

export default store;
