import React, { useState, useEffect, useRef } from 'react';
import { axiosInstance } from '../hooks/axiosConfig';

import useWebSocket from '../hooks/useWebSocket';
import useFetchAndPlayAudio from '../hooks/useFetchAndPlayAudio';
import useWhisper from '../hooks/useWhisper';

const Chat = ({ messages, setMessages }) => {
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

  useEffect(() => {
    if (transcription) {
      handleSend(transcription);
    }
  }, [transcription]);

  const handleSocketMessage = (data) => {
    if (data === 'PRESSED') {
      startRecording();
    } else if (data === 'RELEASED') {
      stopRecording();
    }
  };

  const { sendMessage } = useWebSocket(
    'ws://localhost:8081',
    handleSocketMessage
  );

  const { isPlaying, fetchAndPlayAudio } = useFetchAndPlayAudio();

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    // handleSend('你好，我们从头开始聊这个学术项目吧，你先给我大概介绍一下。');
  }, []);

  const handleSend = async (messageText = input) => {
    console.log('Message:', messageText);
    if (!messageText.trim()) return;

    const userMessage = { id: Date.now(), text: messageText, sender: 'user' };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await axiosInstance.post('/poster', {
        content: messageText,
      });

      const botReply = response.data.reply;
      const botReplys = {
        id: Date.now(),
        text: botReply[0],
        sender: 'bot',
        positions: botReply[1],
      };
      setMessages((prevMessages) => [...prevMessages, botReplys]);
      console.log('Bot reply:', botReplys);
      await fetchAndPlayAudio('/startaudio', botReplys.text, '/sendaudio');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  const changeRecordingState = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
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
