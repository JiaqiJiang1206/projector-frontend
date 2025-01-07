import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Selector from './components/Selector';
import MainApp from './components/MainApp';

function App() {
  return (
    <Router>
      {/* <nav>
        <Link to="/">Home</Link> | <Link to="/about">About</Link>
      </nav> */}
      <Routes>
        <Route path="/" element={<Selector />} />
        <Route path="/app" element={<MainApp />} />
      </Routes>
    </Router>
  );
}

export default App;
