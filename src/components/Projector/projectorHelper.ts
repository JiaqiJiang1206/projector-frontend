// 根据图像大小计算相对位置的函数
export const calPos = (
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
