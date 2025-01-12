import useWebsocket from '../../hooks/useWebSocket';
import { setRecording, setProcessing } from '../../store/slices/statusSlice';
import { setBook } from '../../store/slices/projectorSlice';
import { useSelector } from 'react-redux';

export function getRandomEmojiPaths(emotion: string) {
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

export function useWebSocketHandler(
  url,
  dispatch,
  startRecording,
  stopRecording,
  systemStatus
) {
  useWebsocket(url, (message) => {
    console.log('WebSocket message received:', message);
    if (message === 'PRESSED') {
      if (systemStatus.status !== 'Idle') {
        console.log('Cannot start recording while status is not idle');
        return;
      }
      console.log('Recording started');
      startRecording();
      dispatch(setRecording());
    } else if (message === 'RELEASED') {
      console.log('Recording stopped');
      stopRecording();
      dispatch(setProcessing());
      dispatch(setBook());
    }
  });
}
