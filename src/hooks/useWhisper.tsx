import { useState, useEffect, useRef } from 'react';
import { axiosWhisper } from './axiosConfig';

function useWhisper() {
  const [transcription, setTranscription] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const startRecording = () => {
    setIsRecording(true);
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        let chunks = [];

        mediaRecorder.ondataavailable = (event) => {
          chunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'audio/mp3' });
          const audioUrl = URL.createObjectURL(blob);
          setAudioUrl(audioUrl);
          sendAudioToWhisperAPI(blob);
        };

        mediaRecorder.start();
      })
      .catch((err) => console.error('Error accessing microphone:', err));
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
  };

  const sendAudioToWhisperAPI = (audioBlob) => {
    const formData = new FormData();
    formData.append('file', audioBlob);

    axiosWhisper
      .post('/transcribe', formData)
      .then((response) => response.data)
      .then((data) => {
        setTranscription(data.text); // Assuming the API returns the transcription text
      })
      .catch((err) =>
        console.error('Error sending audio to Whisper API:', err)
      );
  };

  return {
    transcription,
    isRecording,
    audioUrl,
    startRecording,
    stopRecording,
  };
}

export default useWhisper;
