const { SerialPort } = require('serialport');
const WebSocket = require('ws');

const portName = '/dev/cu.usbmodem11101'; // 替换为串口名称

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

  port.on('open', () => {
    console.log('Serial port opened');
  });

  port.on('error', (err) => {
    console.error('Serial port error:', err.message);
  });

  port.on('close', () => {
    console.log('Serial port closed');
  });

  // 定期发送心跳保持设备活跃
  setInterval(() => {
    console.log('Sending ping to Arduino');
    port.write('ping\n', (err) => {
      if (err) {
        console.error('Failed to write to serial port:', err.message);
      }
    });
  }, 300000);

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
