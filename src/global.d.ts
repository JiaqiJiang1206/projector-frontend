interface Window {
  SpeechRecognition: any;
  webkitSpeechRecognition: any;
}

interface SpeechRecognition {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: () => void;
  onend: () => void;
  onerror: (error: any) => void;
  onresult: any;
  start: () => void;
  stop: () => void;
  abort: () => void;
}
