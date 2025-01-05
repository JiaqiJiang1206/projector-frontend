import React, { useState, useEffect, useRef } from 'react';
import { axiosInstance } from '../hooks/axiosConfig';
import { useDispatch } from 'react-redux';
import { setIdle, setRecording, setProcessing } from '../store/statusSlice';
import { setBook, setGraph } from '../store/projectorSlice';

import useWebSocket from '../hooks/useWebSocket';
import useFetchAndPlayAudio from '../hooks/useFetchAndPlayAudio';
import useWhisper from '../hooks/useWhisper';
import { ExperimentConditions, PosterTypes } from '../store/conditionSlice';
import { useSelector } from 'react-redux';

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

  const { fetchAudio, playAudioQueue } = useFetchAndPlayAudio();

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // useEffect(() => {
  //   handleSend('你好，我们从头开始聊这个学术项目吧，你先给我大概介绍一下。');
  // }, []);

  // 将原先用于随机选取表情的逻辑抽到 Chat 中
  function getRandomEmojiPaths(emotion: string) {
    // 此处可改成自动检索文件夹
    const allEmojis = [
      '065.svg',
      '064.svg',
      '063.svg',
      '062.svg',
      '061.svg',
      '012.svg',
      '013.svg',
      '011.svg',
      '005.svg',
      '004.svg',
      '014.svg',
      '001.svg',
      '015.svg',
      '003.svg',
      '002.svg',
      '033.svg',
      '032.svg',
      '024.svg',
      '025.svg',
      '031.svg',
      '035.svg',
      '021.svg',
      '034.svg',
      '022.svg',
      '023.svg',
      '044.svg',
      '051.svg',
      '045.svg',
      '053.svg',
      '052.svg',
      '042.svg',
      '043.svg',
      '041.svg',
      '055.svg',
      '054.svg',
    ];
    const matches = allEmojis.filter((item) => item.startsWith(emotion));
    if (!matches.length) return allEmojis[0];
    return matches[Math.floor(Math.random() * matches.length)];
  }

  const posterType = useSelector((state: any) => state.condition.posterType);
  const experimentCondition = useSelector(
    (state: any) => state.condition.expetimentCondition
  );

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
      - 请仅以纯文本形式回复，确保答案中不包含任何代码格式或块，例如 \`\`\`json。
      - 所说的内容要具体，如果有例子尽量提供相应的例子。
      - 你的输出需要严格按照json格式输出，并考虑到可能的转义字符问题，不要在字符串中再包含英文引号，以防json解析失败。
      - Dialogue 的值是一个只包含纯文本和中文标点符号的字符串，不要包含任何可能导致 json 解析失败的特殊字符。
      ${
        experimentCondition === ExperimentConditions.CueAndMaterial
          ? '- 请不要说海报右侧有内容。'
          : ''
      }
      `;

      const poster =
        posterType === PosterTypes.PosterOne
          ? '1'
          : posterType === PosterTypes.PosterTwo
          ? '2'
          : '3';

      const pickerResponse = await axiosInstance.post('/picker', {
        content: pickerMessage,
        poster,
      });

      const botReply = pickerResponse.data;

      // 在生成最终消息对象前，将随机表情路径数组存入 emojiPath
      const emojiPath = botReply.emotion_number
        ? getRandomEmojiPaths(botReply.emotion_number)
        : '';

      // 构造消息对象
      const botReplyMessage = {
        id: Date.now(),
        text: botReply.picker_chatmessage,
        sender: 'bot',
        positions: botReply.highlight_point,
        emotions: botReply.emotion_number,
        emojiPath, // 新增一个字段以存储最终选取的表情文件
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
      - 请仅以纯文本形式回复，确保答案中不包含任何代码格式或块，例如 \`\`\`json。
      - 每个节点生成的字数不超过二十个字。`;
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
      console.log('Relationship response:', relationshipResponse.data);
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
      dispatch(setProcessing());
      dispatch(setBook());
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
