import React, { useEffect, useRef, useState } from 'react';
import CanvasBoard from './CanvasBoard'; // 引入 CanvasBoard 组件
import { useSelector } from 'react-redux';
import mockData from './mockData_short.json'; // 引入 mockData

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

function groupCues(cues: cuePosition[], threshold = 3) {
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
    <div
      className="border-0 border-white"
      style={{ width: imgRef.current?.width }}
    >
      <div
        className="flex fixed"
        style={{ visibility: isShowPoster ? 'visible' : 'hidden' }}
      >
        <img
          ref={imgRef} // Assigning ref to the image
          src="/img/poster.png"
          alt="Poster"
          className=" w-auto h-screen opacity-30"
        />
        <img
          ref={imgRef} // Assigning ref to the image
          src="/img/poster.png"
          alt="Poster"
          className=" w-auto h-screen opacity-30"
        />
      </div>
      {groupedCues.map((pos, index) => (
        <div
          key={index}
          className="absolute bg-white rounded-full opacity-90"
          style={{
            top: `${pos.y + 1}px`,
            left: `${pos.x - 3}px`,
            width: `${pos.width}px`,
            height: `${pos.height}px`,
            // animation: 'breathing 4.2s infinite',
          }}
        ></div>
      ))}
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
  const [cuePositions, setCuePositions] = useState<cuePosition[]>([]);
  const [positionData, setPositionData] = useState<[number, number][][]>();
  const [posterSize, setPosterSize] = useState({ width: 4824, height: 6800 });

  const imgRef = useRef<HTMLImageElement | null>(null);
  // // 使用 useRef 获取每个 input 的引用
  // const x1Ref = useRef<HTMLInputElement>(null);
  // const x2Ref = useRef<HTMLInputElement>(null);
  // const y1Ref = useRef<HTMLInputElement>(null);
  // const y2Ref = useRef<HTMLInputElement>(null);

  const projectorView = useSelector((state: any) => state.projector.view);

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
      imgRef.current &&
      posterSize.width > 0 &&
      posterSize.height > 0 &&
      positionData
    ) {
      const widthRatio = imgRef.current.width / posterSize.width;
      const heightRatio = imgRef.current.height / posterSize.height;

      const newPositions = positionData.map((points) => {
        return calPos(points, widthRatio, heightRatio);
      });
      setCuePositions(newPositions);
      console.log('Updated cue positions:', newPositions);
    } else {
      console.log('not update cue pos', posterSize, positionData);
    }
  };

  useEffect(() => {
    updateCuePos(); // Recalculate cue position after image load
  }, [imgRef.current, positionData]);

  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].positions) {
      setPositionData(messages[messages.length - 1].positions);
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

  const lastMessage = messages[messages.length - 1] || {};
  const hasEmojiPath = lastMessage.emojiPath;
  console.log('hasEmojiPath:', lastMessage.emojiPath);

  return (
    <div className="flex h-screen bg-black text-white">
      <Cue cuePosition={cuePositions} imgRef={imgRef} />

      {hasEmojiPath && (
        <div className="relative flex flex-wrap">
          <img
            src={`/img/emoji/${lastMessage.emojiPath}`}
            alt="emoji"
            style={{
              position: 'absolute',
              top: '0',
              right: imgRef.current?.width * 0.2,
              width: 100,
              height: 100,
              animation: 'swing 2s ease-in-out infinite',
            }}
          />
        </div>
      )}
      <div
        className=" border-0 border-red-500 relative"
        style={{ width: imgRef.current?.width }}
      >
        <div className="absolute w-48 top-2 left-2">
          <img
            src={systemStatus.image}
            alt="Status Icon"
            className="w-auto h-20"
          />
          <p>{systemStatus.text}</p>
        </div>
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
              height: '100%',
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
