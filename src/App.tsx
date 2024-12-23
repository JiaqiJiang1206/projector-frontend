import React, { useState, useEffect } from 'react';
import Chat from './components/Chat'; // 第一个页面
import Projector from './components/Projector'; // 第二个页面

const App = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: 'Hello! How can I help you today?',
      sender: 'bot',
      positions: [],
    },
  ]); // 共享的对话数据
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // 控制侧边栏展开或折叠

  useEffect(() => {
    console.log(messages);
  }, [messages]);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev); // 切换侧边栏展开/折叠
  };

  return (
    <div className="flex h-screen">
      {/* 侧边栏 */}
      <button
        onClick={toggleSidebar}
        className="bg-blue-500 text-white px-3 rounded-full h-6 z-30 fixed"
      >
        {/* {isSidebarOpen ? 'Close Sidebar' : 'Open Sidebar'} */}
      </button>
      <div
        className={`${
          isSidebarOpen ? 'z-20' : 'z-0'
        } bg-gray-800 text-white p-4`}
        style={{ position: 'fixed', top: 0, bottom: 0, left: 0 }}
      >
        <Chat messages={messages} setMessages={setMessages} />
      </div>

      {/* 内容区域 */}
      <div
        className={'flex-1 ml-0 z-10'} // 根据侧边栏的宽度动态调整内容区域的左边距
      >
        <Projector messages={messages} />
      </div>
    </div>
  );
};

export default App;
