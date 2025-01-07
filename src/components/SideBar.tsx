// 侧边栏组件，能够接受 isOpen 和 toggleSidebar 两个 props，用于控制侧边栏的显示和隐藏。
// 当侧边栏显示时，点击按钮可以隐藏侧边栏，点击按钮时，侧边栏会显示出来，同时会显示 children 中的内容。
import React from 'react';

const Sidebar = ({ isOpen, toggleSidebar, children }) => {
  return (
    <div>
      <button
        onClick={toggleSidebar}
        className="bg-blue-500 text-white px-3 rounded-full h-6 z-30 fixed"
      ></button>
      <div
        className={`${
          isOpen ? 'visible' : 'hidden'
        } bg-gray-800 text-white p-4 z-10`}
        style={{ position: 'fixed', top: 0, bottom: 0, left: 0 }}
      >
        {children}
      </div>
    </div>
  );
};

export default Sidebar;
