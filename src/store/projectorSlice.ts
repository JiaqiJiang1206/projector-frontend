import { createSlice } from '@reduxjs/toolkit';

type ProjectorView = 'WELCOME' | 'BOOK' | 'GRAPH';

const initialState: { view: ProjectorView } = {
  view: 'WELCOME',
};

const projectorSlice = createSlice({
  name: 'projector',
  initialState,
  reducers: {
    setWelcome: (state) => {
      state.view = 'WELCOME';
    },
    setBook: (state) => {
      state.view = 'BOOK';
    },
    setGraph: (state) => {
      state.view = 'GRAPH';
    },
  },
});

export const { setWelcome, setBook, setGraph } = projectorSlice.actions;
export default projectorSlice.reducer;
