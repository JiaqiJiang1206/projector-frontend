import { createSlice } from '@reduxjs/toolkit';

const initialMessages = [
  {
    id: 0,
    text: 'Hello! How can I help you today?',
    sender: 'bot',
    positions: [
      [
        [0, 0],
        [0, 0],
      ],
    ],
    titlePosition: [],
    captionPosition: [],
    emojiPath: ['002.svg'],
  },
];

const messagesSlice = createSlice({
  name: 'messages',
  initialState: initialMessages,
  reducers: {
    // 添加一条消息
    addMessage: (state, action) => {
      state.push(action.payload);
    },
    // 删除一条消息
    removeMessage: (state, action) => {
      return state.filter((msg) => msg.id !== action.payload);
    },
    // 清空所有消息
    clearMessages: (state) => {
      return [];
    },
    // 批量添加消息，例如从 sessionStorage 中恢复
    setMessages: (state, action) => {
      return action.payload;
    },
  },
});

export const { addMessage, removeMessage, clearMessages, setMessages } =
  messagesSlice.actions;

export default messagesSlice.reducer;
