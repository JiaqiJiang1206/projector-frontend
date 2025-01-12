import React, { useEffect, useState } from 'react';

interface ToastProps {
  message: string; // 提示信息
  duration?: number; // 提示显示的时长，单位为毫秒
  onClose?: () => void; // 关闭提示时的回调函数
}

const Toast: React.FC<ToastProps> = ({ message, duration = 1000, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // 自动隐藏提示
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) {
        onClose(); // 调用回调函数
      }
    }, duration);

    return () => clearTimeout(timer); // 清理定时器
  }, [duration, onClose]);

  if (!visible) return null;

  return (
    <div
      className={`fixed top-5 right-5 bg-yellow-500 text-white px-4 py-2 rounded shadow-lg 
      transition-opacity transition-transform duration-500 ease-in-out 
      opacity-30 transform translate-y-0`}
    >
      {message}
    </div>
  );
};

export default Toast;
