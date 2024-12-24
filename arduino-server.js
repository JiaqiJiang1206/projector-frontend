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

    // 发送数据到 WebSocket 客户端
    if (currentClient && currentClient.readyState === WebSocket.OPEN) {
      currentClient.send(message);
    }
  };

  // 添加串口监听器
  port.on('data', handleData);

  ws.on('close', () => {
    console.log('WebSocket client disconnected');
    currentClient = null;

    // 移除串口监听器
    port.off('data', handleData);
  });
});
