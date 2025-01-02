import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Chat from './components/Chat'; // 第一个页面
import Projector from './components/Projector'; // 第二个页面

const App = () => {
  const [messages, setMessages] = useState([
    {
      id: 0,
      text: 'Hello! How can I help you today?',
      sender: 'bot',
      positions: [
        [
          [208, 240],
          [2155, 545],
        ],
      ],
      emojiPath: ['002.svg'],
    },
  ]); // 共享的对话数据
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // 控制侧边栏展开或折叠
  const [canvasData, setCanvasData] = useState(null); // 画布数据

  const status = useSelector((state: any) => state.status.status);
  const [systemStatus, setSystemStatus] = useState({
    image: '/img/button.png',
    text: '请按下按钮开始对话哦！',
  });

  const getStatusImage = () => {
    console.log('Status:', status);
    switch (status) {
      case 'Recording':
        return '/img/listening.gif';
      case 'Processing':
        return '/img/thinking.gif';
      case 'Speaking':
        return '/img/bubble-chat.png';
      default:
        return '/img/button.png';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'Recording':
        return '我在认真听你说话哦！';
      case 'Processing':
        return '我需要一点时间来思考，请先不要打断我哦～';
      case 'Speaking':
        return '啊！我终于想出来啦！请听我说，这个过程中请不要打断我哟～';
      default:
        return '请按下按钮开始对话哦！';
    }
  };

  useEffect(() => {
    console.log(messages);
  }, [messages]);

  useEffect(() => {
    // 当 status 改变时同步更新 systemStatus
    const updatedImage = getStatusImage();
    const updatedText = getStatusText();
    setSystemStatus({ image: updatedImage, text: updatedText });
  }, [status]);

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
          isSidebarOpen ? 'visible' : 'hidden'
        } bg-gray-800 text-white p-4 z-10`}
        style={{ position: 'fixed', top: 0, bottom: 0, left: 0 }}
      >
        <Chat
          messages={messages}
          setMessages={setMessages}
          setCanvasData={setCanvasData}
        />
      </div>

      {/* 内容区域 */}
      <div
        className={'flex-1 ml-0 '} // 根据侧边栏的宽度动态调整内容区域的左边距
      >
        <Projector
          messages={messages}
          canvasData={canvasData}
          setCanvasData={setCanvasData}
          systemStatus={systemStatus}
        />
        {/* <div className="absolute" style={{ left: 800, top: 10 }}>
          <img src={getStatusImage()} alt="Status Icon" className="w-16 h-16" />
          <p className="text-white text-sm">{getStatusText()}</p>
        </div> */}
      </div>
    </div>
  );
};

export default App;
