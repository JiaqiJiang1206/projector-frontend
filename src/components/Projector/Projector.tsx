import React, { useEffect, useRef, useState } from 'react';

import CanvasBoard from './CanvasBoard';
import StatusIndicator from '../StatusIndicator';
import { Cue, cuePosition } from './Cue';

import mockData from '../../assets/mockData_short.json'; // 引入 mockData

import { useSelector } from 'react-redux';
import { ExperimentConditions } from '../../store/slices/conditionSlice';

import { calPos } from './projectorHelper';

interface ProjectorProps {
  messages: any[];
  canvasData: any;
}

const Projector: React.FC<ProjectorProps> = ({ messages, canvasData }) => {
  const [cuePositions, setCuePositions] = useState<cuePosition[]>([]); // 处理后的位置数据
  const [positionData, setPositionData] = useState<[number, number][][]>(); // 收到的原始数据
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

  const projectorView = useSelector((state: any) => state.projector.view);
  const status = useSelector((state: any) => state.status.status);

  const experimentCondition = useSelector(
    (state: any) => state.condition.expetimentCondition
  );
  const posterSize = { width: 4824, height: 6800 };

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

  return (
    <div className="flex h-screen bg-black text-white">
      <div
        style={{
          width:
            imgRef.current && imgRef.current.width > 100
              ? imgRef.current.width
              : '580px',
        }}
      >
        <Cue
          cuePosition={cuePositions}
          titleCuePosition={titleCuePostion}
          captionCuePosition={captionCuePosition}
          imgRef={imgRef}
        />
      </div>
      <div
        className=" border-0 border-red-500 relative"
        style={{
          width:
            imgRef.current && imgRef.current.width > 100
              ? imgRef.current.width
              : '580px',
        }}
      >
        <div
          className="top-3 left-2"
          style={{
            position: 'relative',
            justifyContent: 'center',
            alignItems: 'center',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <StatusIndicator status={status} />
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
                height: 600,
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
              {/* <img
                src="/img/book.png"
                alt="Processing"
                style={{ width: 120, height: 120, objectFit: 'contain' }}
              />
              <p>让我找找有没有更多的材料！</p> */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Projector;
