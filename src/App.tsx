import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Chat from './components/Chat'; // 第一个页面
import Projector from './components/Projector'; // 第二个页面
import { axiosInstance } from './hooks/axiosConfig';
import useFetchAndPlayAudio from './hooks/useFetchAndPlayAudio';
import { useDispatch } from 'react-redux';
import { setIdle } from './store/statusSlice';

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

  useEffect(() => {
    // 当 messages 改变时同步更新 canvasData
    // sayHello();
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev); // 切换侧边栏展开/折叠
  };

  const { fetchAudio, playAudioQueue } = useFetchAndPlayAudio();
  const dispatch = useDispatch();

  const sayHello = async () => {
    console.log('Saying hello...');
    const helloRequest = `
    请向用户介绍你自己，并用大约100字的陈述句告诉用户与你的交互流:
      1. 告诉用户你是谁。
      2. 邀请用户就海报跟你聊天。
      3. 告诉用户在之后的交流中你会回答用户的问题并进行一些反问,在右边的扩展面板上为用户提供更多信息。
      4. 邀请用户与你就海报的内容进行讨论,让用户向你提问。
      注意："highlight"部分置空，"emotion"部分选择积极情绪。

      # 约束条件
      仅回复所要求的 JSON 输出，遵守上述要求，不包含任何无关信息。
      请仅以纯文本形式回复。确保答案不包含任何代码格式或代码块，如 \`\`\`json.`;
    const response = await axiosInstance.post('/sayhello', {
      content: helloRequest,
    });

    const botReply = response.data;
    // 构造消息对象
    const botReplyMessage = {
      id: Date.now(),
      text: botReply.picker_chatmessage,
      sender: 'bot',
      emotions: botReply.emotion_number,
      positions: [
        [
          [208, 240],
          [2155, 545],
        ],
      ],
      emojiPath: ['002.svg'],
    };

    // 添加到消息队列
    setMessages((prevMessages) => [...prevMessages, botReplyMessage]);

    // 请求生成语音
    const audioQueue = await fetchAudio(
      '/startaudio',
      botReply.picker_chatmessage,
      '/sendaudio'
    );
    playAudioQueue(audioQueue);
    dispatch(setIdle());
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
      <div
        className="absolute right-0 bottom-0 w-6 h-6 bg-black rounded-full cursor-pointer"
        onClick={sayHello}
      ></div>
    </div>
  );
};

export default App;
