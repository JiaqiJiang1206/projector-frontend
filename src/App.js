import React, { useState, useEffect } from 'react';
import Chat from './components/Chat'; // 第一个页面
import HiddenPage from './components/Projector'; // 第二个页面

const App = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: {
        part: 0,
        text: 'Hello! How can I help you today?',
      },
      sender: 'bot',
    },
  ]); // 共享的对话数据
  const [botPart, setBotPart] = useState(0); // 当前 bot 提到的 part
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // 控制侧边栏展开或折叠

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    console.log(messages);

    if (lastMessage && lastMessage.sender === 'bot') {
      // 确保 lastMessage.text 是对象并直接访问 part
      if (lastMessage.text) {
        const part = lastMessage.text.part;
        setBotPart(part); // 更新 botPart
        console.log(part);
      }
    }
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
        } bg-gray-800 text-white p-4 z-10`}
        style={{ position: 'fixed', top: 0, bottom: 0, left: 0 }}
      >
        <Chat messages={messages} setMessages={setMessages} />
      </div>

      {/* 内容区域 */}
      <div
        className={'flex-1 ml-0 z-10'} // 根据侧边栏的宽度动态调整内容区域的左边距
      >
        <HiddenPage part={botPart} />
      </div>
    </div>
  );
};

export default App;
