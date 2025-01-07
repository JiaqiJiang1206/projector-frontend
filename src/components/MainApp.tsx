import React, { useState, useEffect } from 'react';

// 引入组件
import { Chat } from './Chat';
import { Projector } from './Projector';
import Sidebar from './SideBar';

// 引入 hooks
import useFetchAndPlayAudio from '../hooks/useFetchAndPlayAudio';

// 引入 redux
import { useSelector, useDispatch } from 'react-redux';
import { setIdle } from '../store/slices/statusSlice';
import { addMessage, setMessages } from '../store/slices/messagesSlice';
import { setCanvasData } from '../store/slices/canvasDataSlice';

// service
import { sayHelloService } from '../services/chatService';

const MainApp = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // 控制侧边栏展开或折叠

  // 来自 redux 的数据
  const posterType = useSelector((state: any) => state.condition.posterType);
  const experimentCondition = useSelector(
    (state: any) => state.condition.expetimentCondition
  );
  const messages = useSelector((state: any) => state.messages);
  const canvasData = useSelector((state: any) => state.canvasData);

  const dispatch = useDispatch();

  useEffect(() => {
    // 从 sessionStorage 恢复消息
    const savedMessages = sessionStorage.getItem('messages');
    if (savedMessages) {
      dispatch(setMessages(JSON.parse(savedMessages)));
    }
    // 从 sessionStorage 恢复画布数据
    const savedCanvasData = sessionStorage.getItem('canvasData');
    if (savedCanvasData) {
      setCanvasData(JSON.parse(savedCanvasData));
    }
  }, [dispatch]);

  useEffect(() => {
    console.log('messages:', messages);
    sessionStorage.setItem('messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    // 当 messages 改变时同步更新 canvasData
    // sayHello();
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev); // 切换侧边栏展开/折叠
  };

  const { fetchAudio, playAudioQueue } = useFetchAndPlayAudio();

  async function sayHello() {
    console.log('Saying hello...');

    const response = await sayHelloService(experimentCondition, posterType);

    const botReply = response.data;
    // 构造消息对象
    const botReplyMessage = {
      id: Date.now(),
      text: botReply.picker_chatmessage,
      sender: 'bot',
      emotions: botReply.emotion_number,
      positions: [
        [
          [0, 0],
          [0, 0],
        ],
      ],
      emojiPath: ['002.svg'],
      titlePosition: botReply.title,
      captionPosition: botReply.caption,
    };

    // 添加到消息队列
    dispatch(addMessage(botReplyMessage));

    // 请求生成语音
    const audioQueue = await fetchAudio(
      '/startaudio',
      botReply.picker_chatmessage,
      '/sendaudio'
    );
    playAudioQueue(audioQueue);
    dispatch(setIdle());
  }

  return (
    <div className="flex h-screen">
      {/* 侧边栏 */}
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        children={<Chat />}
      />

      {/* 内容区域 */}
      <div
        className={'flex-1 ml-0 '} // 根据侧边栏的宽度动态调整内容区域的左边距
      >
        <Projector messages={messages} canvasData={canvasData} />
      </div>
      <div
        className="absolute right-0 bottom-0 w-6 h-6 bg-black rounded-full cursor-pointer"
        onClick={sayHello}
      ></div>
    </div>
  );
};

export default MainApp;
