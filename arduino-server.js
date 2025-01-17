const { SerialPort } = require('serialport');
const WebSocket = require('ws');

const portName = '/dev/cu.usbmodem11101'; // 替换为你的串口名称

// 初始化串口
const port = new SerialPort({
  path: portName,
  baudRate: 9600,
});

// 初始化 WebSocket 服务器
const wss = new WebSocket.Server({ port: 8081 });
console.log('WebSocket server is running on ws://localhost:8081');

// 用于存储 WebSocket 客户端
let currentClient = null;
let lastState = null; // 上一次状态
let debounceTimeout = null; // 防抖定时器
let stableCount = 0; // 稳定计数
const stabilityThreshold = 2; // 稳定状态需要的连续次数
const hysteresis = { pressed: 15, released: 16 }; // 滞后阈值

wss.on('connection', (ws) => {
  console.log('WebSocket client connected');

  // 确保只处理最新的客户端
  if (currentClient) {
    currentClient.close(); // 关闭旧的客户端连接
  }
  currentClient = ws;

  // 串口数据处理
  const handleData = (data) => {
    const message = data.toString().trim();
    console.log('Received from Arduino:', message);

    // 将 Arduino 发送的距离值转换为数字
    const distance = parseFloat(message);
    if (!isNaN(distance)) {
      // 根据滞后机制判断当前状态
      const currentState =
        distance < hysteresis.pressed
          ? 'PRESSED'
          : distance > hysteresis.released && lastState === 'PRESSED'
          ? 'RELEASED'
          : lastState; // 如果在滞后区间内，保持上次状态

      // 如果状态没有变化，重置稳定计数
      if (currentState === lastState) {
        stableCount = 0;
        return;
      }

      // 增加稳定计数，只有稳定次数达到阈值才改变状态
      stableCount++;
      if (stableCount >= stabilityThreshold) {
        lastState = currentState; // 更新状态
        stableCount = 0; // 重置计数

        // 防抖：如果短时间内状态重复，不发送消息
        if (debounceTimeout) clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
          console.log(`Sending to WebSocket: ${currentState}`);
          if (currentClient && currentClient.readyState === WebSocket.OPEN) {
            currentClient.send(currentState);
          }
        }, 50); // 50ms 防抖时间
      }
    }
  };

  // 添加串口监听器
  port.on('data', handleData);

  port.on('open', () => {
    console.log('Serial port opened');
  });

  port.on('error', (err) => {
    console.error('Serial port error:', err.message);
  });

  port.on('close', () => {
    console.log('Serial port closed');
  });

  // // 定期发送心跳保持设备活跃
  // setInterval(() => {
  //   console.log('Sending ping to Arduino');
  //   port.write('ping\n', (err) => {
  //     if (err) {
  //       console.error('Failed to write to serial port:', err.message);
  //     }
  //   });
  // }, 300000);

  // 处理 WebSocket 客户端发送的消息
  ws.on('message', (message) => {
    console.log('Received from WebSocket client:', message);

    // 如果收到 "ping" 消息，回应 "pong"
    if (message === 'ping') {
      ws.send('pong');
    }
  });

  ws.on('close', () => {
    console.log('WebSocket client disconnected');
    currentClient = null;

    // 移除串口监听器
    port.off('data', handleData);
  });
});
