import { useEffect, useRef } from 'react';

const useWebSocket = (url, onMessage, reconnectInterval = 1000) => {
  const wsRef = useRef(null); // 保存 WebSocket 实例
  const reconnectTimer = useRef(null); // 保存重连定时器
  const isManualClose = useRef(false); // 标记是否为手动关闭

  useEffect(() => {
    // 建立 WebSocket 连接
    const connectWebSocket = () => {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        clearTimeout(reconnectTimer.current); // 清理重连定时器
      };

      ws.onmessage = (event) => {
        if (onMessage) onMessage(event.data);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        if (!isManualClose.current) {
          console.log('Attempting to reconnect...');
          reconnectTimer.current = setTimeout(() => {
            connectWebSocket(); // 重新连接
          }, reconnectInterval);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        ws.close(); // 出现错误时关闭连接
      };
    };

    connectWebSocket(); // 初始化连接

    // 清理函数
    return () => {
      isManualClose.current = true; // 标记为手动关闭
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current); // 清理重连定时器
      if (wsRef.current) wsRef.current.close(); // 关闭 WebSocket
    };
  }, [url, onMessage, reconnectInterval]);

  // 手动发送消息的接口
  const sendMessage = (message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(message);
    } else {
      console.warn('WebSocket is not open. Message not sent:', message);
    }
  };

  return { sendMessage };
};

export default useWebSocket;
