import React, { useEffect, useRef, useState } from 'react';
import CanvasBoard from './CanvasBoard'; // 引入 CanvasBoard 组件

import mockData from './mockData_short.json'; // 引入 mockData
import { useSelector } from 'react-redux';
import { ExperimentConditions, PosterTypes } from '../store/conditionSlice';

interface cuePosition {
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

const Cue: React.FC<CueProps> = ({
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

interface ProjectorProps {
  messages: any[];
  canvasData: any;
  setCanvasData: any;
  systemStatus: {
    image: string;
    text: string;
  };
}

const Projector: React.FC<ProjectorProps> = ({
  messages,
  canvasData,
  setCanvasData,
  systemStatus,
}) => {
  const [cuePositions, setCuePositions] = useState<cuePosition[]>([]); // 处理后的位置数据
  const [positionData, setPositionData] = useState<[number, number][][]>(); // 收到的原始数据
  const [posterSize, setPosterSize] = useState({ width: 4824, height: 6800 });
  const [titlePosition, setTitlePosition] = useState<[number, number][][]>([
    [
      [0, 0],
      [0, 0],
    ],
  ]);
  const [captionPosition, setCaptionPosition] = useState<[number, number][][]>([
    [
      [0, 0],
      [0, 0],
    ],
  ]);
  const [titleCuePostion, setTitleCuePosition] = useState<cuePosition[]>([]);
  const [captionCuePosition, setCaptionCuePosition] = useState<cuePosition[]>(
    []
  );

  const imgRef = useRef<HTMLImageElement | null>(null);
  // // 使用 useRef 获取每个 input 的引用
  // const x1Ref = useRef<HTMLInputElement>(null);
  // const x2Ref = useRef<HTMLInputElement>(null);
  // const y1Ref = useRef<HTMLInputElement>(null);
  // const y2Ref = useRef<HTMLInputElement>(null);

  const projectorView = useSelector((state: any) => state.projector.view);

  const experimentCondition = useSelector(
    (state: any) => state.condition.expetimentCondition
  );

  // Function to calculate relative position based on the image size
  const calPos = (
    twoPoints: number[][],
    widthRatio: number,
    heightRatio: number
  ) => {
    const x1 = twoPoints[0][0];
    const y1 = twoPoints[0][1];
    const x2 = twoPoints[1][0];
    const y2 = twoPoints[1][1];

    // setCanvasData(mockData); // 画布测试数据

    // Ensure the widthRatio and heightRatio are not zero to avoid Infinity
    if (widthRatio === 0 || heightRatio === 0) {
      console.error('Invalid width or height ratio');
      return { x: 0, y: 0, width: 0, height: 0 };
    }

    const x = widthRatio * x1;
    const y = heightRatio * y1;
    const width = widthRatio * (x2 - x1);
    const height = heightRatio * (y2 - y1);

    return { x, y, width, height };
  };

  useEffect(() => {
    window.addEventListener('resize', updateCuePos);

    return () => {
      window.removeEventListener('resize', updateCuePos);
    };
  }, [imgRef.current]);

  // Update cue positions using calculated ratios
  const updateCuePos = () => {
    if (
      !imgRef.current ||
      posterSize.width <= 0 ||
      posterSize.height <= 0 ||
      !Array.isArray(positionData)
    ) {
      console.log('Skipping updateCuePos due to invalid data');
      return;
    }
    const widthRatio = imgRef.current.width / posterSize.width;
    const heightRatio = imgRef.current.height / posterSize.height;

    const newPositions = positionData.map((points) => {
      return calPos(points, widthRatio, heightRatio);
    });
    const titleCues = titlePosition.map((points) => {
      return calPos(points, widthRatio, heightRatio);
    });

    setTitleCuePosition(titleCues);
    const captionCues = captionPosition.map((points) => {
      return calPos(points, widthRatio, heightRatio);
    });
    setCaptionCuePosition(captionCues);
    // newPositions.push(...titleCues);
    // newPositions.push(...captionCues);

    setCuePositions(newPositions);
    console.log('Updated cue positions:', newPositions);
  };

  useEffect(() => {
    updateCuePos(); // Recalculate cue position after image load
  }, [imgRef.current, positionData]);

  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].positions) {
      setPositionData(messages[messages.length - 1].positions);
      setTitlePosition(messages[messages.length - 1].titlePosition);
      setCaptionPosition(messages[messages.length - 1].captionPosition);
    }
  }, [messages]);

  // const submitPosition = () => {
  //   const x1 = Number(x1Ref.current?.value);
  //   const x2 = Number(x2Ref.current?.value);
  //   const y1 = Number(y1Ref.current?.value);
  //   const y2 = Number(y2Ref.current?.value);

  //   if (x1 && x2 && y1 && y2) {
  //     setPositionData([
  //       [
  //         [x1, y1],
  //         [x2, y2],
  //       ],
  //     ]);
  //   }

  //   updateCuePos();
  // };

  return (
    <div className="flex h-screen bg-black text-white">
      <Cue
        cuePosition={cuePositions}
        titleCuePosition={titleCuePostion}
        captionCuePosition={captionCuePosition}
        imgRef={imgRef}
      />
      <div
        className=" border-0 border-red-500 relative"
        style={{ width: imgRef.current?.width }}
      >
        <div
          className="absolute w-48 top-2 left-2"
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <img
            src={systemStatus.image}
            alt="Status Icon"
            className="w-auto h-20"
          />
          <p>{systemStatus.text}</p>
        </div>

        <div
          style={{
            visibility:
              experimentCondition === ExperimentConditions.CueAndMaterial
                ? 'visible'
                : 'hidden',
          }}
        >
          {projectorView !== 'BOOK' ? (
            <CanvasBoard
              graphData={canvasData}
              canvasSize={{
                width: imgRef.current?.width,
                height: imgRef.current?.height,
              }}
            />
          ) : (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                width: 'auto',
                right: 0,
              }}
            >
              <img
                src="/img/book.png"
                alt="Processing"
                style={{ width: 120, height: 120, objectFit: 'contain' }}
              />
              <p>让我找找有没有更多的材料！</p>
            </div>
          )}
        </div>
      </div>
      {/* <div className="absolute right-1 bottom-1 flex space-x-2">
        <input
          type="text"
          className="w-24 bg-transparent border-b-2 border-white text-white placeholder-gray-400"
          placeholder="x1"
          ref={x1Ref}
        />
        <input
          type="text"
          className="w-24 bg-transparent border-b-2 border-white text-white placeholder-gray-400"
          placeholder="x2"
          ref={x2Ref}
        />
        <input
          type="text"
          className="w-24 bg-transparent border-b-2 border-white text-white placeholder-gray-400"
          placeholder="y1"
          ref={y1Ref}
        />
        <input
          type="text"
          className="w-24 bg-transparent border-b-2 border-white text-white placeholder-gray-400"
          placeholder="y2"
          ref={y2Ref}
        />
        <button
          className="text-white rounded bg-blue-500 hover:bg-blue-700 transition duration-300 px-1"
          onClick={submitPosition}
        >
          Submit
        </button>
      </div> */}
    </div>
  );
};

export default Projector;
