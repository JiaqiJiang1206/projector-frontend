// StatusIndicator.jsx
import React from 'react';

const StatusIndicator = ({ status }) => {
  const getStatusImage = () => {
    switch (status) {
      case 'Recording':
        return '/img/listening.gif';
      case 'Processing':
        return '/img/thinking.gif';
      case 'Speaking':
        return '/img/bubble-chat.png';
      default:
        return '/img/open-hand.png';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'Recording':
        return '我在认真听你说话';
      case 'Processing':
        return '正在思考，请不要打断我哦';
      case 'Speaking':
        return '我终于想出来啦！请听我说，不要打断我哟';
      default:
        return '手置于上方开始对话';
    }
  };

  return (
    <div>
      <img src={getStatusImage()} alt="Status Icon" className="w-auto h-20" />
      <p>{getStatusText()}</p>
    </div>
  );
};

export default StatusIndicator;
