import React, { useEffect, useRef, useState } from 'react';
import CanvasBoard from './CanvasBoard'; // 引入 CanvasBoard 组件

import mockData from './mockData_short.json'; // 引入 mockData
import { useSelector } from 'react-redux';
import { ExperimentConditions, PosterTypes } from '../store/conditionSlice';

export interface cuePosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CueProps {
  cuePosition: cuePosition[];
  titleCuePosition: cuePosition[];
  captionCuePosition: cuePosition[];
  imgRef: React.RefObject<HTMLImageElement>;
}

function groupCues(cues: cuePosition[], yThreshold = 3, xThreshold = 3) {
  const grouped: cuePosition[] = [];

  // 按 y 值排序，确保从上到下处理
  cues.sort((a, b) => (a.y === b.y ? a.x - b.x : a.y - b.y));

  const rows: cuePosition[][] = [];

  // Step 1: 按行分组
  cues.forEach((cue) => {
    const existingRow = rows.find(
      (row) => Math.abs(row[0].y - cue.y) < yThreshold // 判断是否属于同一行
    );
    if (existingRow) {
      existingRow.push(cue);
    } else {
      rows.push([cue]);
    }
  });

  // Step 2: 合并同一行的 cues
  rows.forEach((row) => {
    row.sort((a, b) => a.x - b.x); // 按 x 排序，确保从左到右
    let currentGroup = { ...row[0] };

    for (let i = 1; i < row.length; i++) {
      const cue = row[i];
      if (cue.x <= currentGroup.x + currentGroup.width + xThreshold) {
        // 合并到当前分组
        const maxX = Math.max(
          currentGroup.x + currentGroup.width,
          cue.x + cue.width
        );
        currentGroup.width = maxX - currentGroup.x;
        currentGroup.height = Math.max(currentGroup.height, cue.height);
      } else {
        // 新建一个分组
        grouped.push(currentGroup);
        currentGroup = { ...cue };
      }
    }
    grouped.push(currentGroup); // 最后一组
  });

  return grouped;
}

export const Cue: React.FC<CueProps> = ({
  cuePosition,
  titleCuePosition,
  captionCuePosition,
  imgRef,
}) => {
  const [isShowPoster, setIsShowPoster] = useState(true);

  const changeVisibility = () => {
    setIsShowPoster(!isShowPoster); // Toggle visibility
  };

  const groupedCues = groupCues(cuePosition);

  const posterType = useSelector((state: any) => state.condition.posterType);
  const experimentCondition = useSelector(
    (state: any) => state.condition.expetimentCondition
  );

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

  return (
    <div>
      <div
        className="border-0 border-white"
        style={{
          width: imgRef.current?.width,
          visibility:
            experimentCondition !== ExperimentConditions.Baseline
              ? 'visible'
              : 'hidden',
        }}
      >
        <div
          className="flex fixed"
          style={{ visibility: isShowPoster ? 'visible' : 'hidden' }}
        >
          {posterTypes
            .filter((poster) => poster.id === posterType)
            .map((poster) => (
              <img
                key={poster.id}
                ref={imgRef} // Assigning ref to the image
                src={poster.img}
                alt={poster.text}
                className="w-auto h-screen opacity-30"
              />
            ))}
          {posterTypes
            .filter((poster) => poster.id === posterType)
            .map((poster) => (
              <img
                key={poster.id}
                ref={imgRef} // Assigning ref to the image
                src={poster.img}
                alt={poster.text}
                className="w-auto h-screen opacity-30"
              />
            ))}
        </div>
        {groupedCues.map((pos, index) => (
          <div
            key={index}
            className="absolute bg-white rounded-full opacity-90"
            style={{
              top: `${pos.y + 6}px`,
              left: `${pos.x - 0}px`,
              width: `${pos.width}px`,
              height: `${pos.height}px`,
              // animation: 'breathing 4.2s infinite',
            }}
          ></div>
        ))}
        {titleCuePosition.map((pos, index) => (
          <div
            key={index}
            className="absolute"
            style={{
              top: `${pos.y}px`,
              left: `${pos.x}px`,
              width: `${pos.width}px`,
              height: `${pos.height}px`,
            }}
          >
            <img
              src="/img/icons/titleright.gif"
              alt="Left Top GIF"
              className="absolute -top-3 -left-6 w-8 h-8"
              style={{
                animation: 'infinite-loop 1s linear infinite',
                transform: 'scaleX(-1) rotate(-45deg)',
              }}
            />
            <img
              src="/img/icons/titleright.gif"
              alt="Right Top GIF"
              className="absolute -top-3 w-8 h-8 -right-8"
              style={{
                animation: 'infinite-loop 1s linear infinite',
                transform: 'rotate(-45deg)',
              }}
            />
          </div>
        ))}
        {captionCuePosition.map((pos, index) => (
          <div
            key={index}
            className="absolute"
            style={{
              top: `${pos.y}px`,
              left: `${pos.x}px`,
              width: `${pos.width}px`,
              height: `${pos.height}px`,
            }}
          >
            <img
              src="/img/icons/picleft.gif"
              alt="Left Top GIF"
              className="absolute top-0 -left-10 w-16 h-auto"
              style={{
                animation: 'infinite-loop 1s linear infinite',
              }}
            />
            <img
              src="/img/icons/picright.gif"
              alt="Right Top GIF"
              className="absolute w-auto h-16 bottom-0 -right-20"
              style={{
                animation: 'infinite-loop 1s linear infinite',
                transform: 'rotate(270deg) scaleX(-1)',
              }}
            />
          </div>
        ))}
      </div>
      <div
        className="absolute left-0 bottom-0 w-6 h-6 bg-black rounded-full cursor-pointer"
        onClick={changeVisibility}
      ></div>
    </div>
  );
};
