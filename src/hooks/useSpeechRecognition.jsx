import { useRef, useState, useEffect } from 'react';

const useSpeechRecognition = (onResult) => {
  const recognitionRef = useRef(null);
  const [isListening, setIsListening] = useState(false);

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

    recognition.onstart = () => {
      setIsListening(true);
      console.log('Listening...');
    };

    recognition.onend = () => {
      setIsListening(false);
      console.log('Speech recognition service disconnected');
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

      onResult(finalTranscript || interimTranscript);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const startListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Speech recognition error:', error);
      }
    }
  };

  const stopListening = () => {
    try {
      recognitionRef.current.stop();
    } catch {
      console.error('Speech recognition error');
    }
  };

  return { startListening, stopListening, isListening };
};

export default useSpeechRecognition;
