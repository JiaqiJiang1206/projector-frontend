import { useEffect, useRef } from 'react';

const useWebSocket = (url, onMessage) => {
  const wsRef = useRef<any>(null); // 保存 WebSocket 实例

  useEffect(() => {
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      if (onMessage) onMessage(event.data);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    // 清理函数
    return () => {
      if (wsRef.current) {
        wsRef.current.close(); // 关闭 WebSocket
        wsRef.current = null; // 清空引用
      }
    };
  }, []);

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
