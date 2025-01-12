import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';

// Services
import {
  getPickerMessage,
  getRelationshipMessage,
} from '../../services/chatService';

// Hooks
import useFetchAndPlayAudio from '../../hooks/useFetchAndPlayAudio';
import useWhisper from '../../hooks/useWhisper';

// Store slices
import {
  setIdle,
  setRecording,
  setProcessing,
} from '../../store/slices/statusSlice';
import { setBook, setGraph } from '../../store/slices/projectorSlice';
import { addMessage } from '../../store/slices/messagesSlice';
import { setCanvasData } from '../../store/slices/canvasDataSlice';

// Helper functions
import { getRandomEmojiPaths, useWebSocketHandler } from './chatHelper';
import Toast from './Toast';

const Chat = () => {
  const [input, setInput] = useState<any>('');
  const [loading, setLoading] = useState<any>(false);
  const [showToast, setShowToast] = useState(false);

  const messagesEndRef = useRef<any>(null);

  const dispatch = useDispatch();
  const messages = useSelector((state: any) => state.messages);
  const posterType = useSelector((state: any) => state.condition.posterType);
  const experimentCondition = useSelector(
    (state: any) => state.condition.expetimentCondition
  );

  const {
    transcription,
    isRecording,
    audioUrl,
    startRecording,
    stopRecording,
  } = useWhisper();
  const { fetchAudio, playAudioQueue } = useFetchAndPlayAudio();
  const status = useSelector((state: any) => state.status);

  useEffect(() => {
    if (transcription) {
      handleSend(transcription);
    }
  }, [transcription]);

  useWebSocketHandler(
    'ws://localhost:8081',
    dispatch,
    startRecording,
    stopRecording,
    status
  );

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async (messageText = input) => {
    dispatch(setProcessing());
    dispatch(setBook());
    console.log('Message:', messageText);
    if (!messageText.trim()) return;

    const userMessage = { id: Date.now(), text: messageText, sender: 'user' };
    dispatch(addMessage(userMessage));
    setInput('');
    setLoading(true);

    try {
      const pickerResponse = await getPickerMessage(
        messageText,
        experimentCondition,
        posterType
      );
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
        positions: botReply.highlight_point.flat(), // 打平数组
        emotions: botReply.emotion_number,
        emojiPath, // 新增一个字段以存储最终选取的表情文件
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

      const relationshipResponsePromise = getRelationshipMessage(
        botReply.picker_chatmessage
      );

      // 播放第一条语音并立即请求 relationshipResponse
      playAudioQueue(audioQueue).then(async () => {
        dispatch(setIdle());
      });

      // 等待 relationshipResponse 完成
      try {
        const relationshipResponse = await relationshipResponsePromise;
        console.log('Relationship response:', relationshipResponse.data);
        // 立即更新画布数据
        dispatch(setCanvasData(relationshipResponse.data.generator_draw));
        dispatch(setGraph());
      } catch (error) {
        console.error('Error fetching relationship response:', error);
      }
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
      if (status.status !== 'Idle') {
        console.log('Cannot start recording while status is not idle');
        setShowToast(true);
        return;
      }
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
      {showToast && (
        <Toast
          message="现在还不能说话哦"
          duration={1000}
          onClose={() => setShowToast(false)} // 提示消失时更新状态
        />
      )}
    </div>
  );
};

export default Chat;
