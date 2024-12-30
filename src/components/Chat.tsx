import React, { useState, useEffect, useRef } from 'react';
import { axiosInstance } from '../hooks/axiosConfig';
import { useDispatch } from 'react-redux';
import { setIdle, setRecording, setProcessing } from '../store/statusSlice';
import { setBook, setGraph } from '../store/projectorSlice';

import useWebSocket from '../hooks/useWebSocket';
import useFetchAndPlayAudio from '../hooks/useFetchAndPlayAudio';
import useWhisper from '../hooks/useWhisper';

const Chat = ({ messages, setMessages, setCanvasData }) => {
  const [input, setInput] = useState<any>('');
  const [loading, setLoading] = useState<any>(false);

  const messagesEndRef = useRef<any>(null);

  const {
    transcription,
    isRecording,
    audioUrl,
    startRecording,
    stopRecording,
  } = useWhisper();

  const dispatch = useDispatch();

  useEffect(() => {
    if (transcription) {
      handleSend(transcription);
    }
  }, [transcription]);

  const handleSocketMessage = (data) => {
    if (data === 'PRESSED') {
      console.log('Recording started');
      startRecording();
      dispatch(setRecording());
    } else if (data === 'RELEASED') {
      console.log('Recording stopped');
      stopRecording();
      dispatch(setProcessing());
      dispatch(setBook());
    }
  };

  useWebSocket('ws://localhost:8081', handleSocketMessage);

  const { isPlaying, fetchAudio, playAudioQueue } = useFetchAndPlayAudio();

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // useEffect(() => {
  //   handleSend('你好，我们从头开始聊这个学术项目吧，你先给我大概介绍一下。');
  // }, []);

  // 将原先用于随机选取表情的逻辑抽到 Chat 中
  function getRandomEmojiPaths(emotions: string[]) {
    // 此处可改成自动检索文件夹
    const allEmojis = [
      '052.gif',
      '053.gif',
      '092.gif',
      '101.svg',
      '023.gif',
      '022.gif',
      '011.svg',
      '025.gif',
      '024.gif',
      '026.gif',
      '016.svg',
      '002.svg',
      '027.gif',
      '003.gif',
      '029.gif',
      '001.gif',
      '015.gif',
      '014.gif',
      '028.gif',
      '004.gif',
      '021.svg',
      '005.gif',
      '013.gif',
      '012.gif',
      '061.gif',
      '051.svg',
      '062.gif',
      '091.svg',
      '063.gif',
      '113.gif',
      '073.gif',
      '081.svg',
      '072.gif',
      '112.gif',
      '041.svg',
      '065.gif',
      '071.gif',
      '111.gif',
    ];
    return emotions.map((em) => {
      const matches = allEmojis.filter((item) => item.startsWith(em));
      if (!matches.length) return allEmojis[0];
      return matches[Math.floor(Math.random() * matches.length)];
    });
  }

  const handleSend = async (messageText = input) => {
    dispatch(setProcessing());
    console.log('Message:', messageText);
    if (!messageText.trim()) return;

    const userMessage = { id: Date.now(), text: messageText, sender: 'user' };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // 发送消息给 /picker 接口
      const pickerMessage = `${messageText}\n
      - 仅以所要求的 JSON 输出进行回复，不包含任何无关信息。\n
      - 请仅以纯文本形式回复，确保答案中不包含任何代码格式或块，例如 \`\`\`json。`;
      const pickerResponse = await axiosInstance.post('/picker', {
        content: pickerMessage,
      });

      const botReply = pickerResponse.data;

      // 在生成最终消息对象前，将随机表情路径数组存入 emojiPaths
      const emojiPaths = botReply.emotion_number
        ? getRandomEmojiPaths(botReply.emotion_number)
        : [];

      // 构造消息对象
      const botReplyMessage = {
        id: Date.now(),
        text: botReply.picker_chatmessage,
        sender: 'bot',
        positions: botReply.highlight_point,
        emotions: botReply.emotion_number,
        emojiPaths, // 新增一个字段以存储最终选取的表情文件
      };

      // 添加到消息队列
      setMessages((prevMessages) => [...prevMessages, botReplyMessage]);

      // 请求生成语音
      const audioQueue = await fetchAudio(
        '/startaudio',
        botReply.picker_chatmessage,
        '/sendaudio'
      );

      // 请求 pickertogenerator（并行执行）
      const toRelationshipMessage = `${botReply.picker_chatmessage} + \n
      - 仅以所要求的 JSON 输出进行回复，不包含任何无关信息。\n
      - 请仅以纯文本形式回复，确保答案中不包含任何代码格式或块，例如 \`\`\`json。`;
      const relationshipResponsePromise = axiosInstance.post(
        '/pickertogenerator',
        {
          content: toRelationshipMessage,
        }
      );

      // 播放第一条语音并立即请求 relationshipResponse
      playAudioQueue(audioQueue).then(async () => {
        try {
          // // 请求第二条语音
          // const generatorAudioQueue = await fetchAudio(
          //   '/startaudio',
          //   relationshipResponse.data.generator_chat,
          //   '/sendaudio'
          // );
          // // 播放第二条语音
          // playAudioQueue(generatorAudioQueue).then(() => {

          // });
          dispatch(setIdle());
        } catch (error) {
          console.error('Error processing relationship response:', error);
        }
      });

      // 等待 relationshipResponse 完成
      const relationshipResponse = await relationshipResponsePromise;
      // 立即更新画布数据
      setCanvasData(relationshipResponse.data.generator_draw);
      dispatch(setGraph());
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  const changeRecordingState = () => {
    if (isRecording) {
      stopRecording();
      dispatch(setIdle());
    } else {
      startRecording();
      dispatch(setRecording());
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 w-96">
      <div className="overflow-y-auto p-4 flex-1">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-4 ${message.sender === 'user' ? 'text-right' : ''}`}
          >
            <div
              className={`${
                message.sender === 'user'
                  ? 'bg-gray-300 text-black ml-auto'
                  : 'bg-blue-500 text-white'
              } p-3 rounded-lg max-w-md`}
            >
              {message.sender === 'user' ? message.text : message.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="text-left">
            <div className="bg-gray-300 text-black p-3 rounded-lg max-w-md">
              Typing...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t">
        <div className="flex">
          <input
            type="text"
            className="flex-1 border rounded-lg p-2 focus:outline-none text-slate-700"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
          />
          <button
            className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            onClick={() => {
              handleSend(input.current);
            }}
            disabled={loading}
          >
            Send
          </button>
        </div>
      </div>

      <div className="p-4 bg-white border-t">
        <button
          className={`px-4 py-2 rounded-lg ${
            isRecording ? 'bg-red-500' : 'bg-blue-500'
          } text-white`}
          onClick={changeRecordingState}
        >
          {isRecording ? 'Recording...' : 'Record'}
        </button>
        {audioUrl && (
          <audio controls src={audioUrl} className="mt-2">
            Your browser does not support the audio element.
          </audio>
        )}
      </div>
    </div>
  );
};

export default Chat;
