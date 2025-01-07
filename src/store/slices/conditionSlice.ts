import { createSlice } from '@reduxjs/toolkit';

export enum ExperimentConditions {
  Baseline = 'Baseline',
  Cue = 'Cue Only',
  CueAndMaterial = 'Cue & Material',
}

export enum PosterTypes {
  PosterOne = 'posterOne',
  PosterTwo = 'posterTwo',
  PosterThree = 'posterThree',
}

// 从 localStorage 读取
const savedExpCondition = localStorage.getItem(
  'experimentCondition'
) as ExperimentConditions | null;
const savedPosterType = localStorage.getItem(
  'posterType'
) as PosterTypes | null;

export const conditionSlice = createSlice({
  name: 'condition',
  initialState: {
    expetimentCondition: savedExpCondition ?? ExperimentConditions.Baseline,
    posterType: savedPosterType ?? PosterTypes.PosterOne,
  },
  reducers: {
    setExperimentCondition: (state, action) => {
      state.expetimentCondition = action.payload;
      localStorage.setItem('experimentCondition', action.payload);
    },
    setPosterType: (state, action) => {
      state.posterType = action.payload;
      localStorage.setItem('posterType', action.payload);
    },
  },
});
