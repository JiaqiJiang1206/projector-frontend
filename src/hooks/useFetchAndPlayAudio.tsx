import { useState, useCallback } from 'react';
import { axiosTTS } from './axiosConfig';

const useFetchAndPlayAudio = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  const fetchAndPlayAudio = useCallback(
    async (startAudioUrl, botText, fetchAudioUrl) => {
      const audioQueue: string[] = [];
      let fileIndex = 0;

      setIsPlaying(true);

      try {
        // Start audio processing
        const response = await axiosTTS.post(startAudioUrl, {
          content: botText,
        });
        const audioCount = response.data.reply;

        if (audioCount === 0) {
          console.log('No audio to play.');
          setIsPlaying(false);
          return;
        }

        // Fetch audio files
        while (fileIndex < audioCount) {
          try {
            const response = await axiosTTS.post(
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

        // Play audio queue
        for (const audioUrl of audioQueue) {
          await playAudio(audioUrl);
        }
      } catch (error) {
        console.error('Error in audio processing:', error);
      } finally {
        setIsPlaying(false);
      }
    },
    []
  );

  const playAudio = (audioUrl) => {
    return new Promise((resolve, reject) => {
      const audio = new Audio(audioUrl);
      audio.onended = resolve;
      audio.onerror = reject;
      audio.play().catch(reject);
    });
  };

  return { isPlaying, fetchAndPlayAudio };
};

export default useFetchAndPlayAudio;
