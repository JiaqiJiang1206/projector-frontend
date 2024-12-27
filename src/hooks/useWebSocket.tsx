import { useEffect, useRef } from 'react';

const useWebSocket = (url, onMessage) => {
  const wsRef = useRef<any>(null); // 保存 WebSocket 实例

  useEffect(() => {
    if (!wsRef.current) {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');

        // 心跳连接
        // const heartbeat = () => {
        //   if (ws.readyState === WebSocket.OPEN) {
        //     ws.send('ping');
        //   }
        // };
        // const heartbeatInterval = setInterval(heartbeat, 30000); // 每30秒发送一次心跳
        // wsRef.current.heartbeatInterval = heartbeatInterval;
      };

      ws.onmessage = (event) => {
        console.log('WebSocket message received:', event.data);
        if (event.data === 'pong') {
          // 处理心跳回应
          console.log('Heartbeat response received');
        } else {
          if (onMessage) onMessage(event.data);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        // 清除心跳定时器
        // clearInterval(wsRef.current.heartbeatInterval);
        // 重连
        setTimeout(() => {
          wsRef.current = new WebSocket(url);
        }, 1000); // 1秒后重连
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } else {
      console.warn('WebSocket already initialized');
    }

    // 清理函数
    return () => {
      if (wsRef.current) {
        // clearInterval(wsRef.current.heartbeatInterval); // 清除心跳定时器
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
