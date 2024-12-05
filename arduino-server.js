const { SerialPort } = require('serialport');

const WebSocket = require('ws');

// 替换为你的 Arduino 串口名称（在 Arduino IDE 的工具 -> 端口中可以找到）
const portName = '/dev/cu.usbmodem11101'; // Windows 上可能是 COM3、COM4

// 初始化串口
const port = new SerialPort({
  path: portName, // 串口路径
  baudRate: 9600, // 波特率
});

// 初始化 WebSocket 服务器
const wss = new WebSocket.Server({ port: 8081 });
console.log('WebSocket server is running on ws://localhost:8081');

wss.on('connection', (ws) => {
  console.log('WebSocket client connected');

  // 监听 Arduino 的串口数据
  port.on('data', (data) => {
    const message = data.toString().trim();
    console.log('Received from Arduino:', message);

    // 将数据发送到 WebSocket 客户端
    ws.send(message);
  });

  ws.on('close', () => {
    console.log('WebSocket client disconnected');
  });
});
