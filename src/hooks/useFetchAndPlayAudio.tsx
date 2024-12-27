import { useState, useCallback } from 'react';
import { axiosInstance } from './axiosConfig';
import { useDispatch } from 'react-redux';
import { setSpeaking } from '../store/statusSlice';

const useFetchAndPlayAudio = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const dispatch = useDispatch();

  const fetchAudio = useCallback(
    async (startAudioUrl, botText, fetchAudioUrl) => {
      const audioQueue: string[] = [];
      let fileIndex = 0;

      try {
        // Start audio processing
        const response = await axiosInstance.post(startAudioUrl, {
          content: botText,
        });
        const audioCount = response.data.reply;

        if (audioCount === 0) {
          console.log('No audio to play.');
          return audioQueue;
        }

        // Fetch audio files
        while (fileIndex < audioCount) {
          try {
            const response = await axiosInstance.post(
              `${fetchAudioUrl}?file=${fileIndex}`,
              { content: fileIndex },
              { responseType: 'blob' }
            );
            const audioBlob = response.data;
            const audioUrl = URL.createObjectURL(audioBlob);
            audioQueue.push(audioUrl);
            fileIndex++;
          } catch (error) {
            if (error.response?.status === 404) {
              console.log('No more audio files.');
              break;
            } else {
              console.error('Error fetching audio:', error);
            }
          }
        }
      } catch (error) {
        console.error('Error in audio processing:', error);
      }

      return audioQueue;
    },
    []
  );

  const playAudioQueue = async (audioQueue: string[]) => {
    setIsPlaying(true);
    dispatch(setSpeaking());
    for (const audioUrl of audioQueue) {
      try {
        await playAudio(audioUrl);
      } catch (error) {
        console.error('Error playing audio:', error);
      }
    }
    setIsPlaying(false);
  };

  const playAudio = (audioUrl) => {
    return new Promise((resolve, reject) => {
      const audio = new Audio(audioUrl);
      audio.onended = resolve;
      audio.onerror = reject;
      audio.play().catch(reject);
    });
  };

  return { isPlaying, fetchAudio, playAudioQueue };
};

export default useFetchAndPlayAudio;
