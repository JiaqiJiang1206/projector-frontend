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

function groupCues(cues: cuePosition[], threshold = 5) {
  const grouped: cuePosition[] = [];
  cues.forEach((cue) => {
    // 在 grouped 中寻找 y 值接近的分组
    const existing = grouped.find((g) => Math.abs(g.y - cue.y) < threshold);
    if (existing) {
      // 更新分组的 x、width，height 仅取最大值或保持
      const minX = Math.min(existing.x, cue.x);
      const maxX = Math.max(existing.x + existing.width, cue.x + cue.width);
      existing.x = minX;
      existing.width = maxX - minX;
      existing.height = Math.max(existing.height, cue.height);
    } else {
      grouped.push({ ...cue });
    }
  });
  return grouped;
}

const Cue: React.FC<CueProps> = ({ cuePosition, imgRef }) => {
  const [isShowPoster, setIsShowPoster] = useState(true);

  const changeVisibility = () => {
    setIsShowPoster(!isShowPoster); // Toggle visibility
  };

  const groupedCues = groupCues(cuePosition);

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
      {groupedCues.map((pos, index) => (
        <div
          key={index}
          className="absolute bg-yellow-200 rounded-full opacity-50"
          style={{
            top: `${pos.y + 1}px`,
            left: `${pos.x + 0}px`,
            width: `${pos.width}px`,
            height: `${pos.height}px`,
            // animation: 'breathing 4.2s infinite',
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

  const lastMessage = messages[messages.length - 1] || {};
  const hasEmojiPaths = Array.isArray(lastMessage.emojiPaths);
  console.log('hasEmojiPaths:', lastMessage.emojiPaths);

  return (
    <div className="flex h-screen bg-black text-white">
      <Cue cuePosition={cuePositions} imgRef={imgRef} />
      {hasEmojiPaths && (
        <div className="absolute flex flex-wrap">
          {lastMessage.emojiPaths.map((path: string, idx: number) => {
            const cue = cuePositions[idx];
            if (!cue) return null;

            const imgWidth = 100;
            const imgHeight = 100;
            const offsetX = 90;
            const offsetY = 90;

            let top = cue.y - offsetY;
            let left = cue.x - offsetX;

            // Adjust position to avoid going out of bounds
            if (left < 0) {
              left = cue.x + offsetX;
            } else if (left + imgWidth > window.innerWidth) {
              left = cue.x - imgWidth - offsetX;
            }

            if (top < 0) {
              top = cue.y + offsetY;
            } else if (top + imgHeight > window.innerHeight) {
              top = cue.y - imgHeight - offsetY;
            }

            return (
              <img
                key={idx}
                src={`/img/emoji/${path}`}
                alt="emoji"
                style={{
                  position: 'absolute',
                  top: `${top}px`,
                  left: `${left}px`,
                  width: imgWidth,
                  height: imgHeight,
                  animation: 'swing 2s ease-in-out infinite',
                }}
              />
            );
          })}
        </div>
      )}
      {projectorView !== 'BOOK' ? (
        <CanvasBoard graphData={canvasData} />
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
