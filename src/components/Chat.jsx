import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

import useWebSocket from '../hooks/useWebSocket';
import useSpeechRecognition from '../hooks/useSpeechRecognition';
import useFetchAndPlayAudio from '../hooks/useFetchAndPlayAudio';

const Chat = ({ messages, setMessages }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  let recognizedInput = '';

  const handleSocketMessage = (data) => {
    if (data === 'PRESSED') {
      startListening();
    } else if (data === 'RELEASED') {
      stopListening();
      console.log(recognizedInput);
      handleSend(recognizedInput);
    }
  };

  const { sendMessage } = useWebSocket(
    'ws://localhost:8081',
    handleSocketMessage
  );

  const handleReceiveRecognition = (transcript) => {
    recognizedInput = transcript;
    setInput(transcript);
  };

  const { startListening, stopListening, isListening } = useSpeechRecognition(
    handleReceiveRecognition
  );

  const { isPlaying, fetchAndPlayAudio } = useFetchAndPlayAudio();

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    handleSend('你好，我们从头开始聊这个学术项目吧，你先给我大概介绍一下。');
  }, []);

  const handleSend = async (messageText = input) => {
    console.log('Message:', messageText);
    if (!messageText.trim()) return;

    const userMessage = { id: Date.now(), text: messageText, sender: 'user' };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post(
        'http://10.12.170.113:8080/api/chat/poster',
        { content: messageText }
      );

      const botText = response.data.reply;
      const botMessage = {
        id: Date.now(),
        text: JSON.parse(botText),
        sender: 'bot',
      };
      setMessages((prevMessages) => [...prevMessages, botMessage]);

      await fetchAndPlayAudio(
        'http://10.12.170.113:8080/api/chat/startaudio',
        botText,
        'http://10.12.170.113:8080/api/chat/sendaudio'
      );
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
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
              {message.sender === 'user' ? message.text : message.text.text}
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
            isListening ? 'bg-red-500' : 'bg-blue-500'
          } text-white`}
          onMouseDown={startListening}
          onMouseUp={stopListening}
        >
          {isListening ? 'Listening...' : 'Hold to Speak'}
        </button>
        {isPlaying && (
          <div className="mt-2 text-gray-500">Playing audio...</div>
        )}
      </div>
    </div>
  );
};

export default Chat;
