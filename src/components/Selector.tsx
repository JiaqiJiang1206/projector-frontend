import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  ExperimentConditions,
  PosterTypes,
  conditionSlice,
} from '../store/conditionSlice';
import { useNavigate } from 'react-router-dom';

const Selector = () => {
  const dispatch = useDispatch();
  const experimentCondition = useSelector(
    (state: any) => state.condition.expetimentCondition
  );
  const posterType = useSelector((state: any) => state.condition.posterType);

  const experimentConditions = [
    {
      id: ExperimentConditions.Baseline,
      img: '/img/icons/robot.png',
      text: 'Baseline',
    },
    {
      id: ExperimentConditions.Cue,
      img: '/img/icons/highlighter.png',
      text: 'Cue Only',
    },
    {
      id: ExperimentConditions.CueAndMaterial,
      img: '/img/icons/image-and-text.png',
      text: 'Cue & Material',
    },
  ];

  const posterTypes = [
    {
      id: PosterTypes.PosterOne,
      img: '/img/posters/posterOne.png',
      text: 'Poster One',
    },
    {
      id: PosterTypes.PosterTwo,
      img: '/img/posters/posterTwo.png',
      text: 'Poster Two',
    },
    {
      id: PosterTypes.PosterThree,
      img: '/img/posters/posterThree.png',
      text: 'Poster Three',
    },
  ];

  const handleExperimentConditionChange = (id: ExperimentConditions) => {
    dispatch(conditionSlice.actions.setExperimentCondition(id));
  };

  const handlePosterTypeChange = (id: PosterTypes) => {
    dispatch(conditionSlice.actions.setPosterType(id));
  };
  const navigate = useNavigate();

  const goToApp = () => {
    sessionStorage.clear();
    navigate('/app');
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="absolute text-3xl left-8 top-8">
        👉选择实验所需的
        <span style={{ color: '#4682B4' }}>海报</span>与
        <span style={{ color: '#4682B4' }}>条件</span>
      </div>

      {/* 显示海报 */}
      <div
        className="mt-24 gap-24"
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {posterTypes.map((poster) => (
          <img
            key={poster.id}
            src={poster.img}
            alt={poster.text}
            className={`rounded cursor-pointer shadow-md transition-transform duration-200 ${
              posterType === poster.id
                ? 'outline outline-4 outline-blue-700 scale-105'
                : ''
            } hover:scale-105 w-60 h-auto `}
            onClick={() => handlePosterTypeChange(poster.id)}
          />
        ))}
      </div>

      {/* 显示实验条件 */}
      <div className="mt-8 flex justify-center">
        <div className="flex gap-24">
          {experimentConditions.map((condition) => (
            <div
              key={condition.id}
              className={`w-60 h-60 flex-col rounded-2xl cursor-pointer shadow-md transition-transform duration-200 ${
                experimentCondition === condition.id
                  ? 'border-4 border-blue-700 scale-105'
                  : ''
              } hover:scale-105`}
              style={{
                backgroundColor: '#C7FAA8',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onClick={() => handleExperimentConditionChange(condition.id)}
            >
              <img
                src={condition.img}
                alt={condition.text}
                className="w-36 h-auto object-cover"
              />
              <p className="mt-2 flex justify-center text-2xl">
                {condition.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 提交按钮 */}
      <div className="flex justify-center">
        <button
          className="mt-8 px-4 py-2 bg-blue-500 text-white rounded w-24 "
          onClick={goToApp}
        >
          提交选择
        </button>
      </div>
    </div>
  );
};

export default Selector;
