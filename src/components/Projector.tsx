import React, { useEffect, useRef, useState } from 'react';
import CanvasBoard from './CanvasBoard'; // 引入 CanvasBoard 组件
import { useSelector } from 'react-redux';
// import mockData from './mockData.json'; // 引入 mockData

interface cuePosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CueProps {
  cuePosition: cuePosition[];
  imgRef: React.RefObject<HTMLImageElement>;
}

const Cue: React.FC<CueProps> = ({ cuePosition, imgRef }) => {
  const [isShowPoster, setIsShowPoster] = useState(true);

  const changeVisibility = () => {
    setIsShowPoster(!isShowPoster); // Toggle visibility
  };

  return (
    <div className="relative flex-1">
      {isShowPoster && (
        <img
          ref={imgRef} // Assigning ref to the image
          src="/img/poster.png"
          alt="Poster"
          className="absolute w-auto h-screen max-w-none object-contain opacity-30"
        />
      )}
      {cuePosition.map((pos, index) => (
        <div
          key={index}
          className="absolute bg-yellow-200 rounded-full opacity-20"
          style={{
            top: `${pos.y + 3}px`,
            left: `${pos.x + 3}px`,
            width: `${pos.width}px`,
            height: `${pos.height}px`,
            animation: 'breathing 4.2s infinite',
          }}
        ></div>
      ))}
      <div
        className="absolute left-0 bottom-0 w-8 h-8 bg-black rounded-full cursor-pointer"
        onClick={changeVisibility}
      ></div>
    </div>
  );
};

const Projector = ({ messages, canvasData, setCanvasData }) => {
  const [cuePositions, setCuePositions] = useState<cuePosition[]>([]);
  const [positionData, setPositionData] = useState([
    [
      [208, 240],
      [2155, 545],
    ],
  ]);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  const imgRef = useRef<HTMLImageElement | null>(null);
  // 使用 useRef 获取每个 input 的引用
  const x1Ref = useRef<HTMLInputElement>(null);
  const x2Ref = useRef<HTMLInputElement>(null);
  const y1Ref = useRef<HTMLInputElement>(null);
  const y2Ref = useRef<HTMLInputElement>(null);

  const projectorView = useSelector((state: any) => state.projector.view);

  const posterSize = { width: 4824, height: 6800 };

  const calculateCanvasSize = () => {
    if (imgRef.current) {
      const imgWidth = imgRef.current.width;
      const screenHeight = window.innerHeight;
      const screenWidth = window.innerWidth;

      const canvasHeight = screenHeight;
      const canvasWidth = screenWidth - imgWidth;

      setCanvasSize({ width: canvasWidth, height: canvasHeight });
    }
  };

  // Function to calculate relative position based on the image size
  function calPos(
    twoPoints: number[][],
    widthRatio: number,
    heightRatio: number
  ) {
    const x1 = twoPoints[0][0];
    const y1 = twoPoints[0][1];
    const x2 = twoPoints[1][0];
    const y2 = twoPoints[1][1];

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
  }

  // Update cue positions using calculated ratios
  const updateCuePos = () => {
    if (
      imgRef.current &&
      posterSize.width > 0 &&
      posterSize.height > 0 &&
      positionData.length > 0
    ) {
      const widthRatio = imgRef.current.width / posterSize.width;
      const heightRatio = imgRef.current.height / posterSize.height;

      const newPositions = positionData.map((points) => {
        return calPos(points, widthRatio, heightRatio);
      });
      setCuePositions(newPositions);
      console.log('Updated cue positions:', newPositions);
    } else {
      console.log('not update cue pos');
    }
  };

  useEffect(() => {
    updateCuePos(); // Recalculate cue position after image load
    calculateCanvasSize();
  }, [imgRef.current, positionData]);

  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].positions) {
      setPositionData(messages[messages.length - 1].positions);
    }
  }, [messages]);

  useEffect(() => {
    window.addEventListener('resize', updateCuePos);
    calculateCanvasSize();

    return () => {
      window.removeEventListener('resize', updateCuePos);
    };
  }, []);

  const submitPosition = () => {
    const x1 = Number(x1Ref.current?.value);
    const x2 = Number(x2Ref.current?.value);
    const y1 = Number(y1Ref.current?.value);
    const y2 = Number(y2Ref.current?.value);

    if (x1 && x2 && y1 && y2) {
      setPositionData([
        [
          [x1, y1],
          [x2, y2],
        ],
      ]);
    }

    updateCuePos();
  };

  return (
    <div className="flex h-screen bg-black text-white">
      <Cue cuePosition={cuePositions} imgRef={imgRef} />
      {projectorView !== 'BOOK' ? (
        <CanvasBoard
          graphData={canvasData}
          canvasWidth={800}
          canvasHeight={canvasSize.height}
          setCanvasData={setCanvasData}
        />
      ) : (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            width: 800,
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
      <div className="absolute right-1 bottom-1 flex space-x-2">
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
      </div>
    </div>
  );
};

export default Projector;
