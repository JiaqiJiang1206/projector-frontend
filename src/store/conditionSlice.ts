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

export const conditionSlice = createSlice({
  name: 'condition',
  initialState: {
    expetimentCondition: ExperimentConditions.Baseline,
    posterType: PosterTypes.PosterOne,
  },
  reducers: {
    setExperimentCondition: (state, action) => {
      state.expetimentCondition = action.payload;
    },
    setPosterType: (state, action) => {
      state.posterType = action.payload;
    },
  },
});
