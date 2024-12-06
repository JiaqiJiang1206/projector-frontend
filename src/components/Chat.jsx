import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const Chat = ({ messages, setMessages }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const recognitionRef = useRef(null); // 保存语音识别实例
  const wsRef = useRef(null); // 保存 WebSocket 实例
  const messagesEndRef = useRef(null); // 聊天窗口底部滚动引用
  const arduinoMessage = useRef(null); // 保存 Auduino 信息

  // 滚动到聊天底部
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // 初始化 WebSocket 和 SpeechRecognition
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error('SpeechRecognition API is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'zh-CN';
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => {
      // if (arduinoMessage.current === 'PRESSED') {
      //   startListening();
      // } else {
      //   setIsListening(false);
      // }
      console.log('Speech recognition ended.');
    };
    recognition.onerror = (error) => {
      console.error('Speech recognition error:', error);
      setIsListening(false);
    };
    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = 0; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      setInput(finalTranscript || interimTranscript);

      if (finalTranscript) {
        setInput(finalTranscript);
        handleSend(finalTranscript);
      }
    };

    recognitionRef.current = recognition;

    const ws = new WebSocket('ws://localhost:8081');
    ws.onopen = () => console.log('WebSocket connected');
    ws.onmessage = (event) => {
      arduinoMessage.current = event.data;
      if (arduinoMessage.current === 'PRESSED') {
        startListening();
      } else if (arduinoMessage.current === 'RELEASED') {
        stopListening();
      }
    };
    ws.onerror = (error) => console.error('WebSocket error:', error);
    ws.onclose = () => console.log('WebSocket disconnected');

    wsRef.current = ws;

    return () => {
      recognition.stop();
      ws.close();
    };
  }, []);

  const handleSend = async (messageText = input) => {
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

      const audioCount = await startAudioProcessing(botMessage.text.text);
      if (audioCount > 0) await fetchAndPlayAudio();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) recognitionRef.current.start();
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const startAudioProcessing = async (text) => {
    try {
      const response = await axios.post(
        'http://10.12.170.113:8080/api/chat/startaudio',
        { content: text }
      );
      return response.data.reply;
    } catch (error) {
      console.error('Error starting audio processing:', error);
      return 0;
    }
  };

  const fetchAndPlayAudio = async () => {
    let fileIndex = 0;

    while (true) {
      try {
        const response = await axios.post(
          `http://10.12.170.113:8080/api/chat/sendaudio?file=${fileIndex}`,
          { content: fileIndex },
          { responseType: 'blob' }
        );

        const audioBlob = response.data;
        const audioUrl = URL.createObjectURL(audioBlob);
        await playAudio(audioUrl);
        fileIndex++;
        setIsListening(false);
      } catch (error) {
        if (error.response?.status === 404) {
          console.log('No more audio files.');
          break;
        }
        console.error('Error fetching audio:', error);
        break;
      }
    }
  };

  const playAudio = (audioUrl) => {
    return new Promise((resolve, reject) => {
      const audio = new Audio(audioUrl);
      audio.onended = resolve;
      audio.onerror = reject;
      audio.play().catch(reject);
    });
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
            className="flex-1 border rounded-lg p-2 focus:outline-none"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
          />
          <button
            className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            onClick={handleSend}
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
      </div>
    </div>
  );
};

export default Chat;
