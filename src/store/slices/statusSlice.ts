import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState = {
  status: 'Idle' as 'Idle' | 'Recording' | 'Processing' | 'Speaking',
};

const statusSlice = createSlice({
  name: 'status',
  initialState,
  reducers: {
    setIdle: (state) => {
      state.status = 'Idle';
    },
    setRecording: (state) => {
      state.status = 'Recording';
    },
    setProcessing: (state) => {
      state.status = 'Processing';
    },
    setSpeaking: (state) => {
      state.status = 'Speaking';
    },
  },
});

export const { setIdle, setRecording, setProcessing, setSpeaking } =
  statusSlice.actions;

export default statusSlice.reducer;
