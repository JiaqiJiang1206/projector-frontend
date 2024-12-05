import React, { useState, useEffect, useRef } from 'react';

const HiddenPage = ({ part }) => {
  const [rectangles, setRectangles] = useState([]); // 存储所有矩形框
  const [previewRectangle, setPreviewRectangle] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const drawingRef = useRef(false);
  const startPointRef = useRef(null);
  const containerRef = useRef(null);
  const containerRect = useRef(null);

  // 从 localStorage 加载数据
  useEffect(() => {
    if (containerRef.current) {
      containerRect.current = containerRef.current.getBoundingClientRect();
    }
    const savedRectangles = localStorage.getItem('rectangles');
    if (savedRectangles) setRectangles(JSON.parse(savedRectangles));
  }, []);

  const handleMouseDown = (e) => {
    if (!editMode) return;
    drawingRef.current = true;
    // 每次按下时重新计算容器边界
    containerRect.current = containerRef.current.getBoundingClientRect();

    const startPoint = {
      x: e.clientX - containerRect.current.left,
      y: e.clientY - containerRect.current.top,
    };
    startPointRef.current = startPoint;
  };

  const handleMouseMove = (e) => {
    if (!editMode) return;
    if (!drawingRef.current || !startPointRef.current) return;
    const currentPoint = {
      x: e.clientX,
      y: e.clientY,
    };

    const preview = {
      left: Math.min(startPointRef.current.x, currentPoint.x),
      top: Math.min(startPointRef.current.y, currentPoint.y),
      width: Math.abs(currentPoint.x - startPointRef.current.x),
      height: Math.abs(currentPoint.y - startPointRef.current.y),
    };

    setPreviewRectangle(preview);
  };

  const handleMouseUp = (e) => {
    if (!editMode) return;
    if (!drawingRef.current || !startPointRef.current) return;
    // 获取用户输入的 part
    const inputPart = prompt('Enter part number for this rectangle:');
    previewRectangle &&
      setRectangles((prev) => {
        const updated = [
          ...prev,
          { ...previewRectangle, part: Number(inputPart) },
        ];
        localStorage.setItem('rectangles', JSON.stringify(updated));
        return updated;
      });

    setPreviewRectangle(null);
    drawingRef.current = false;
    startPointRef.current = null;
  };

  const clearRectangles = () => {
    setRectangles(() => {
      const cleared = []; // 新的状态
      localStorage.setItem('rectangles', JSON.stringify(cleared)); // 更新 localStorage
      return cleared; // 更新状态
    });
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-col h-screen bg-black text-white relative overflow-hidden"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
    >
      <div className="flex justify-between p-4">
        <button
          onClick={() => setEditMode((prev) => !prev)} // 切换状态
          className={`px-4 py-2 rounded-lg ${
            editMode ? 'bg-red-500' : 'bg-green-500'
          } text-white`}
        >
          {editMode ? 'Stop Editing' : 'Edit Boxes'}
        </button>
        {!editMode &&
          rectangles.map((rect, index) => (
            <div
              key={index}
              style={{
                position: 'absolute',
                left: `${rect.left}px`,
                top: `${rect.top}px`,
                width: `${rect.width}px`,
                height: `${rect.height}px`,
                borderRadius: '50%',
                background:
                  'radial-gradient(circle, rgba(255,255,0,0.6) 50%, rgba(255,255,0,0) 100%)',
                opacity: rect.part === part ? 1 : 0, // 控制透明度
                transform: rect.part === part ? 'scale(1)' : 'scale(0.8)', // 渐变大小
                transition: 'opacity 0.5s ease, transform 0.5s ease', // 添加渐变动画
                animation:
                  rect.part === part
                    ? 'breathing 5s ease-in-out infinite'
                    : 'none',
                pointerEvents: 'none', // 确保不影响交互
              }}
            ></div>
          ))}
        {editMode && (
          <button
            onClick={clearRectangles}
            className="bg-red-500 text-white px-4 py-2 rounded-lg"
          >
            Clear Rectangles
          </button>
        )}
      </div>
      {editMode && (
        <div>
          {/* 预览中的矩形 */}
          {previewRectangle && (
            <div
              style={{
                position: 'absolute',
                left: `${previewRectangle.left}px`,
                top: `${previewRectangle.top}px`,
                width: `${previewRectangle.width}px`,
                height: `${previewRectangle.height}px`,
                border: '2px dashed white',
              }}
            ></div>
          )}
          {/* 绘制的矩形 */}
          {rectangles &&
            rectangles.map((rect, index) => (
              <div
                key={index}
                style={{
                  position: 'absolute',
                  left: `${rect.left}px`,
                  top: `${rect.top}px`,
                  width: `${rect.width}px`,
                  height: `${rect.height}px`,
                  border: '2px solid white',
                }}
              ></div>
            ))}
        </div>
      )}
    </div>
  );
};

export default HiddenPage;
